const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/Submission");


const register = async (req,res)=>{
    
    try{
        // validate the data;
      validate(req.body); 
      const {firstName , emailId, password}  = req.body;
     
    if (!firstName || !emailId || !password) {
        return res.status(400).send("Please provide all required fields (Name, Email, Password).");
    }


      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'
    //
    
    const user =  await User.create(req.body);
    const reply = {
        firstName : user.firstName,
        emailId : user.emailId,
        _id : user._id ,
        role:user.role
    }
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
            user:reply,
            message:"User Registered  Succesfully"
        })
    }

    catch(err){
        res.status(400).send("Error: "+err);
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});
        if(!user) {
            throw new Error("Invalid Credentials");
        }

        const match = await bcrypt.compare(password , user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName : user.firstName,
            emailId : user.emailId,
            _id : user._id ,
            role:user.role
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,
            {maxAge: 60*60*1000 ,
            httpOnly: true
            });
        res.status(200).json({
            user:reply,
            message:"Logged In Succesfully"
        })
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000 , httpOnly: true,});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async(req, res) => {
    try {
        // 1. Safely extract the ID using optional chaining
        const userId = req.result?._id;  
            
            // what does "?" mean
            // You are essentially telling JavaScript:
            // "Hey, check if req.result actually exists first.
            // If it does, grab the _id. If it doesn't exist, 
            // just stop right here and set userId to undefined."

            // Because it stops and returns undefined gracefully,
            // your server doesn't crash. Instead, your code just moves to the next line:
       

        if(!userId) {
            return res.status(401).send("Unauthorized or User not found");
        }

        // 2. Delete the children FIRST
        await Submission.deleteMany({ userId: userId });  

        // 3. Delete the parent LAST
        const deletedUser = await User.findByIdAndDelete(userId); 

        if(!deletedUser) {
            return res.status(404).send("User profile does not exist");
        }

        res.status(200).send("User and associated data deleted successfully");

    } catch(err) {
        console.error(err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
}




module.exports = {register, login,logout, adminRegister , deleteProfile};  