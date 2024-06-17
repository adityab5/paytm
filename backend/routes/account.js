const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');




const router = express.Router();



router.get('/balance',authMiddleware,async(req,res)=>{
    const account = await Account.findOne({
        userId : req.userId
    });

    res.json({
        balance:account.balance
    })
})
// router.get("/balance", authMiddleware, (req, res) => {
//   Account.findOne({
//     userId: req.userId,
//   })
//     .then((account) => {
//       console.log(account);
//       res.json({
//         balance: account.balance,
//       });
//     })
//     .catch((error) => {
//       // Handle error
//       res.status(500).json({ error: "An error occurred" });
//     });
// });

// router.post('/transfer',authMiddleware,async (req,res)=>{
//     const {amount,to} = req.body;

//     const account = await Account.findOne({
//         userId:req.userId
//     })

//     if(account.balance<amount){
//         return res.status(400).json({
//             msg:"insufficient balance"
//         })
//     }

//     const toAccount = await Account.findOne({
//         userId:to
//     })

//     if(!toAccount){
//         return res.status(400).json({
//             msg:"invalid account"
//         })
//     }

//     await Account.updateOne(
//         {
//             userId:req.userId
//         },
//         {
//             $inc:{
//                 balance:-amount
//             }
//         }   
//     )

//     await Account.updateOne(
//         {
//             userId:to
//         },
//         {
//             $inc:{
//                 balance:amount
//             }
//         }
//     )

//     res.json({
//         msg:"transfer successful"
//     })
// })

//good sol using txns in db
router.post('/transfer',authMiddleware,async (req,res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();
    const {to,amount} = req.body;

    //Fetch the accounts within the transaction
    const account = await Account.findOne({ userId : req.userId }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            msg:"insufficient balance"
        })
    }

    const toAccount = await Account.findOne({ userId : to }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            msg:"invalid account"
        })
    }

    //perform the transfer
    await Account.updateOne({userId : req.userId},{$inc:{balance:-amount}}).session(session);
    await Account.updateOne({userId : to},{$inc:{balance:amount}}).session(session);

    //commit the transaction
    await session.commitTransaction();
    res.json({
        msg: "Transfer successful"
    })
})

module.exports = router;