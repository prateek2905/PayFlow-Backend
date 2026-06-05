const express = require('express');
const { authMiddleware } = require('../middleware');
const { Tag } = require('../db');

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ tags });
});

// Upsert — returns existing tag if name already taken, creates otherwise
router.post("/", authMiddleware, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Tag name is required" });
    }
    try {
        const tag = await Tag.findOneAndUpdate(
            { name: name.trim() },
            { name: name.trim() },
            { upsert: true, new: true }
        );
        res.json({ tag });
    } catch (err) {
        res.status(500).json({ message: "Failed to create tag" });
    }
});

module.exports = router;
