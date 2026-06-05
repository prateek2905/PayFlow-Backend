const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account, Transaction } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userId: req.userId });
    res.json({ balance: account.balance });
});

router.get("/transactions", authMiddleware, async (req, res) => {
    const transactions = await Transaction.find({ userId: req.userId })
        .populate("tag", "name")
        .sort({ date: -1 })
        .limit(50);
    res.json({ transactions });
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, to, tagId, name } = req.body;

        if (!tagId || !mongoose.Types.ObjectId.isValid(tagId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "A valid tag is required" });
        }

        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid account" });
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        const txName = name?.trim() || "Payment";
        const now = new Date();

        await Transaction.create([{
            name: txName,
            type: "debit",
            tag: tagId,
            userId: req.userId,
            value: amount,
            date: now,
        }], { session });

        await Transaction.create([{
            name: txName,
            type: "credit",
            tag: tagId,
            userId: to,
            value: amount,
            date: now,
        }], { session });

        await session.commitTransaction();
        res.json({ message: "Transfer successful" });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: "Transfer failed" });
    } finally {
        session.endSession();
    }
});

module.exports = router;
