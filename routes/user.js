const express = require("express");
const router = express.Router();
const { User } = require("../db");
const { Account } = require("../db");
const bcrypt = require("bcrypt");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
  username: zod.string().min(3).max(30),
  password: zod.string().min(6),
  firstName: zod.string().min(3).max(50),
  lastName: zod.string().min(3).max(50),
});
const signinSchema = zod.object({
  username: zod.string().min(3).max(30),
  password: zod.string().min(6),
});
const updateSchema = zod.object({
  password: zod.string().min(6).optional(),
  firstName: zod.string().min(3).max(50).optional(),
  lastName: zod.string().min(3).max(50).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

router.post("/signup", async (req, res) => {
    const inputVerified = signupSchema.safeParse(req.body);
    if (!inputVerified.success) {
        return res.status(400).json({
            message: "Invalid input",
        });
    }

    const existingUser = await User.findOne({ username: inputVerified.data.username });
    if (existingUser) {
        return res.status(400).json({
            message: "User already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(inputVerified.data.password, 10);
    const user = await User.create({
        username: req.body.username, 
        password: hashedPassword, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName
    });
    const userId = user._id;

    await Account.create({
        userId: userId,
        balance: 0
    });

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({ 
        message: "User created successfully",
        token: token
    });
});

router.post("/signin", async(req, res) => {
  const inputVerified = signinSchema.safeParse(req.body);
  if (!inputVerified.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  const user = await User.findOne({ username: inputVerified.data.username });
  if (!user) {
    return res.status(401).send("Invalid username");
  }
  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(401).send("Invalid password");
  }

  const token = jwt.sign({
    userId: user._id
  }, JWT_SECRET);

  res.json({
    message: "User logged in successfully",
    token: token
  });
});

router.put("/update", authMiddleware, async (req, res) => {
  const inputVerified = updateSchema.safeParse(req.body);
  if (!inputVerified.success) {
    return res.status(400).json({ message: inputVerified.error.errors[0].message });
  }

  const updates = { ...inputVerified.data };
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  await User.updateOne({ _id: req.userId }, updates);

  res.json({ message: "User updated successfully" });
});

router.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
        ]
    });
    res.json({
        user: users.map(u => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            username: u.username
        }))
    });
});

module.exports = router;