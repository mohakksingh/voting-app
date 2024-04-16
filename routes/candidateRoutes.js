const express=require('express')
const router=express.Router()
const User=require('../models/candidate')
const {jwtAuthMiddleware,generateToken}=require('../jwt')
const Candidate = require('../models/candidate')

const checkAdminRole=async(userID)=>{
    try{
        const user=await User.findById(userID)
        if(user.role==='admin'){
            return true;
        }
    }catch(e){
        return false
    }   
}



//POST route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! (await checkAdminRole(req.user.id))){
            return res.status(403).json({
                message:"User does not have admin role"
            })
        }
        const data=req.body //data in body

        //creating a new candidate
        const newCandidate=new Candidate(data)

        //saving the data
        const response=await newCandidate.save()
        console.log("Data saved");
        res.status(200).json({response:response})
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:"Internal Server Error"
        })
    }
})

router.put("/:candidateID",jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({
                message:"User does not have admin role"
            })
        }else{
            console.log("admin role found");
        }

        const candidateID=req.params.candidateID
        const updatedCandidateData=req.body

        const response=await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,
            runValidators:true
        })

        if(!response){
            return res.status(401).json({
                error:"candidate not found"
            })
        }

        console.log("candidate data updated");
        res.status(200).json(response)
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})


router.delete("/:candidateID",jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({
                message:"User does not have admin role"
            })
        }

        const candidateID=req.params.candidateID
        
        const response=await Candidate.findByIdAndDelete(candidateID)

        if(!response){
            return res.status(401).json({
                error:"candidate not found"
            })
        }

        console.log("candidate deleted");
        res.status(200).json(response)
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})



module.exports=router