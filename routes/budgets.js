const express = require("express");
const router = express.Router();
const { Budget } = require("../db");
const { authMiddleware } = require("../middleware");
const mongoose = require("mongoose");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.userId }).populate("tag", "name");
        res.json({ budgets });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch budgets" });
    }
});

router.put("/:tagId", authMiddleware, async (req, res) => {
    const { tagId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).json({ message: "Invalid tag id" });
    }
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: "amount must be a non-negative number" });
    }
    try {
        const budget = await Budget.findOneAndUpdate(
            { userId: req.userId, tag: tagId },
            { $set: { amount } },
            { upsert: true, new: true }
        ).populate("tag", "name");
        res.json({ budget });
    } catch (err) {
        res.status(500).json({ message: "Failed to save budget" });
    }
});

router.delete("/:tagId", authMiddleware, async (req, res) => {
    const { tagId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).json({ message: "Invalid tag id" });
    }
    try {
        await Budget.findOneAndDelete({ userId: req.userId, tag: tagId });
        res.json({ message: "Budget removed" });
    } catch (err) {
        res.status(500).json({ message: "Failed to remove budget" });
    }
});

module.exports = router;
