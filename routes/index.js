const express = require("express");
const router = express.Router();
const userRouter = require("./user.js");
const accountRouter = require("./account.js");
const tagsRouter = require("./tags.js");

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/tags", tagsRouter);

module.exports = router;