const mongoose = require('mongoose');
const { number } = require('zod');

mongoose.connect(
  "mongodb+srv://bhushanadiit55555:QCQCimi8JgyQcbib@cluster0.vg202qr.mongodb.net/"
);

//create a schema for the user
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "User name must be min 3 charecter"],
    maxlength: [20, "User name must be max 20 charecter"],
    unique: true,
    lowercase: true,
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const accountSchema = new mongoose.Schema({
    userId : { 
        type : mongoose.Schema.Types.ObjectId, //reference to User model
        ref : 'User',
        required : true
    },
    balance : {
        type: Number,
        required : true
    }
});
    
//create a model from the schema
const User = mongoose.model("Users",userSchema);
const Account = mongoose.model("Account",accountSchema);

module.exports = { 
    User,
    Account,
 };