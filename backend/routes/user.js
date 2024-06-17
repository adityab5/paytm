const express = require("express"); //
const zod = require("zod");
const { User, Account } = require("../db"); //
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middleware");


const router = express.Router(); //




// const signupSchema = zod.object({
//   userName: zod.string().min(3),
//   firstName: zod.string().max(20),
//   lastName: zod.string().max(20),
//   password: zod.string().min(6),
// });

router.post("/signup", async (req,res)=>{
    const body = req.body;
    // const {success} = signupSchema.safeParse(body);
    // console.log(success);
    // if(!success){
    //     return res.status(411).json({msg : "email already taken / invalid data"});
    // }

    
    const user = await User.findOne({
        userName : req.body.userName
    }) 

    if (user && user.userName == body.userName) {
      return res
        .status(400)
        .json({ msg: "email already taken / invalid data" });
    }

    const newUser = await User.create(body);
    const userId = newUser._id;
    //----create new account
    await Account.create({
        userId,
        balance: 1+ Math.random()*10000
    })

    const token = jwt.sign({
        userId : newUser._id
    },JWT_SECRET)

    res.send({
        msg: "user created successfully",
        token : token
    })
});





// function to check if the user exists or not
// function userExist(userName,password){
//     const userExist = User.findOne(
//         (user) => user.userName === userName && user.password === password
//     ) !== undefined;
//     return userExist;
// }
// //








// router.post("/signin",async (req,res)=>{
//     const {userName,password} = req.body;
//     if(!userExist(userName,password)){
//         return res.status(400).json({msg : "invalid credentials / user not found"});
//     }

//     const user = await User.findOne({
//         userName : userName,
//         password : password
//     })

//     var token = jwt.sign({_id : user._id},JWT_SECRET);
//     // var token = jwt.sign({userName: userName}, JWT_SECRET);

//     res.json({
//         msg : "user logged in successfully",
//         token : token
//     })

// })
//---------OR--------
const signinBody = zod.object({
  userName: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success,error } = signinBody.safeParse(req.body);
//   console.log(success)
  if (!success) {
    // console.log(error)
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});
//-----------------


const updateBody = zod.object({
    password : zod.string().optional(),
    firstName : zod.string().optional(),
    lastName : zod.string().optional()
});

router.put("/",authMiddleware,async (req,res)=>{
    const {success} = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            msg : "Error while updating information"
        })
    }

    await User.updateOne(req.body,{
        id: req.userId
    })

    res.json({
        msg: "updated successfully"
    })

})

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
        $or: [
            {
                firstName: { $regex: filter },
            },
            {
                lastName: { $regex: filter },
            },
        ]
    });

  res.json({
        user: users.map((user) => ({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
        })),
    });
});



module.exports = router;


