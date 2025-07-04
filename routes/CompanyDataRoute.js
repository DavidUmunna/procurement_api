const express=require("express")
const CompanyData=require("../models/CompanyData")

const router=express.Router()


router.get("/company",async(req,res)=>{
    try{

        const companyInfo=await CompanyData.find()
        if (!CompanyData){
            res.status(404).json({message:"no information found"})
        }
        res.status(200).json({companyInfo,message:"information located"})
    }catch(error){
        console.error("error originated from CompanyData",error)
        res.status(500).json({message:"server error "})
    }
})


router.post("/CreateCompanyData",async(req,res)=>{
    try{
        const {CompanyName, OrganizationStructure,
            ResourcesToStreamline,Workflow}=req.body
        //console.log(CompanyName,OrganizationStructure,ResourcesToStreamline,Workflow)
        if(!CompanyName || !OrganizationStructure || !ResourcesToStreamline || !Workflow){
            return res.status(401).json({message:"please enter all fields"})
        }
        const newCompanyData=new CompanyData({
            CompanyName,
            OrganizationStructure,
            ResourcesToStreamline,
            Workflow
        })
        await newCompanyData.save()
        res.status(200).json({success:true,message:"Company Data saved successfully"})
    }catch(error){
        console.error("error from create company data",error)
        res.status(500).json({message:"server error"})
    }
})

module.exports=router