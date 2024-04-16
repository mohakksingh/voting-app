const express=require('express')
const router=express.Router()
const User=require('./../models/user')
const {jwtAuthMiddleware,generateToken}=require('./../jwt')


//POST route to add a User
router.post('/signup',async(req,res)=>{
    try{
        const data=req.body //data in body

        //checking for admin
        const adminUser=await user.findOne({role:'admin'})
        if(data.role==='admin' && adminUser){
            return res.status(400).json({
                error:"admin user already exists"
            })
        }

        //validating aadhar card for 12 digits
        if(!/^\d{12}$/.test(data.aadharCardNumber)){
            return res.status(400).json({
                error:"Aadhar Card Number must be exactly 12 digits"
            })
        }

        //checking for dup
        const existingUser=await User.findOne({aadharCardNumber:data.aadharCardNumber})
        if(existingUser){
            return res.status(400).json({
                error:"User with the same Aadhar Card Number already exists"
            })
        }

        //creating a new User
        const newUser=new User(data)

        //saving the data   
        const response=await newUser.save()
        console.log("Data saved");

        const payload={
            id:response.id,
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload)
    
        res.status(200).json({response:response,token:token})
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:"Internal Server Error"
        })
    }
})

//login route
router.post('/login',async(req,res)=>{
    try{
        //extract the aadharCardNumber and pass from the body
        const {aadharCardNumber,password}=req.body  

        if(!aadharCardNumber || !password){
            return res.status(400).json({
                error:"Aadhar Card Number and password are required"
            })
        }

        //find the user by aadharCardNumber
        const user=await User.findOne({aadharCardNumber:aadharCardNumber})

        //if user does not exist or pass is wrong return err
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                error:"Invalid username or password"
            })
        }

        //generate token
        const payload={
            id:user.id,
        }
        const token=generateToken(payload)

        //return token as response
        res.json({token})
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:"Internal server error"
        })
    }
})

//profile route
router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData=req.user

        const userId=userData.id
        const user=await User.findById(userId)
        
        res.status(200).json({user})
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

router.put("/profile/password",jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId=req.user.id //extract the id from token
        const {currentPassword,newPassword}=req.body//extract the current and new password from the req body

        //checking if currentPass and newPass both are there
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                error:"Both currentPassword and newPassword are required"
            })
        }
        //find the user by userID
        const user=await User.findById(userId)

        //if password does not match return error
        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({
                error:"Invalid password"
            })
        }
        //update the user's password
        user.password=newPassword
        await user.save()

        console.log("password updated");
        res.status(200).json({
            message:"Password updated"
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})



module.exports=router