// backend/db.js
const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

mongoose.connect(MONGO_URI);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  monthlyIncome: {
    type: Number,
    default: 0,
  },
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const transactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});
budgetSchema.index({ userId: 1, tag: 1 }, { unique: true });

const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", userSchema);
const Tag = mongoose.model("Tag", tagSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Budget = mongoose.model("Budget", budgetSchema);

module.exports = {
  User,
  Account,
  Tag,
  Transaction,
  Budget,
};
