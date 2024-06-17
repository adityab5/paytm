const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");

const router = express.Router();

router.use("/user",userRouter);
router.use("/account",accountRouter);


module.exports = router;

// all req will look like this 
// //api/v1/user
// //api/v1/user/:id
// //api/v1/user/:id/transaction.......
