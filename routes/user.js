const express = require("express");
const router = express.Router();
const { User } = require("../db");
const { Account } = require("../db");
const bcrypt = require("bcrypt");
const zod = require("zod");
const jwt = require("jsonwebtoken");

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

app.post("/signup", async (req, res) => {
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
    }, process.env.JWT_SECRET);

    res.json({ 
        message: "User created successfully",
        token: token
    });
});

app.post("/signin", async(req, res) => {
  const inputVerified = signinSchema.safeParse(req.body);
  if (!inputVerified.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).send("Invalid username");
  }
  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(401).send("Invalid password");
  }

  const token = jwt.sign({
    userId: user._id
  }, process.env.JWT_SECRET);

  res.json({
    message: "User logged in successfully",
    token: token
  });
});

module.exports = router;