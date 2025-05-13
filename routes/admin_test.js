const express=require("express")

const router=express.Router()


router.use((req,res,next)=>{
    try{
        console.log("this is the admin page middleware")
        
        next()
    }catch(err){
        console.log("admin middleware",err)
        res.status(401).json(
            "a problem occured"
          );
    }
})

module.exports=router