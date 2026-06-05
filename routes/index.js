const express = require("express");
const router = express.Router();
const userRouter = require("./user.js");
const accountRouter = require("./account.js");
const tagsRouter = require("./tags.js");
const budgetsRouter = require("./budgets.js");

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/tags", tagsRouter);
router.use("/budgets", budgetsRouter);

module.exports = router;