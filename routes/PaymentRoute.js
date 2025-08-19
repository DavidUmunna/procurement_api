const express=require("express")
const router=express.Router()
const paymentDetails=require("../models/PaymentDetails")
const PaymentDetails = require("../models/PaymentDetails")
const disbursementscedule=require("../models/DisbursementSchedule")
const DisbursementSchedule = require("../models/DisbursementSchedule")

router.get("/:id",async(req,res)=>{
    try{
        const {id}=req.params
        console.log("id:",id)
        const Paymentdetail=await paymentDetails.find({scheduleId:id})
        console.log("payment detail get",Paymentdetail)
        res.status(200).json({success:true, data:Paymentdetail,message:"details sent successfully"})


    }catch(error){
        console.error("this error occured from payment details GET",error)
        res.status(500).json({message:"Server Error"})

    }
})
router.put("/:id",async(req,res)=>{
    try{
        const {id}=req.params
        const {Beneficiary,AccountNumber,Bank}=req.body

        const existing_detail=await paymentDetails.findById(id)
        if (Beneficiary){
            existing_detail.Beneficiary=Beneficiary
        }
        if(AccountNumber){
            existing_detail.AccountNumber=AccountNumber
        }
        if(Bank){
            existing_detail.Bank=Bank
        }

        const newDetail=await existing_detail.save()
        res.status(200).json({success:true,message:"update was successful",data:newDetail})
    }catch(error){
        console.error("this error occured from payment details PUT",error)
        res.status(500).json({message:"Server Error"})

    }
})
router.post("/create",async(req,res)=>{
    try{
        const {scheduleId,Beneficiary,AccountNumber,Bank}=req.body
        
        if(!scheduleId){
            res.status(403).json({message:"cant authorize without Id"})
        }
        const new_paymentdetails=new paymentDetails({
            scheduleId:scheduleId,
            Beneficiary:Beneficiary,
            AccountNumber:AccountNumber,
            Bank:Bank
        })

        const savedDetails=await new_paymentdetails.save()
        const CorrespondingSchedule=await DisbursementSchedule.findById(savedDetails.scheduleId)
        CorrespondingSchedule.paymentDetails.push(savedDetails._id)
        if (!CorrespondingSchedule) {
           return res
           .status(404)
           .json({ message: "Corresponding schedule not found" });
        }
        await CorrespondingSchedule.save()
        return res.status(200).json({success:true,data:savedDetails,message:"payment Details Added successfully"})

    }catch(error){
        console.error("this error occured from payment details POST",error)
        return res.status(500).json({message:"Server Error"})
    }
})
router.delete("/:id",async(req,res)=>{
    try{
        const {id}=req.params

        const deletedPayment = await PaymentDetails.findByIdAndDelete(id);

        if (!deletedPayment) {
          return res.status(404).json({ message: "Payment detail not found" });
        }
        res.status(200).json({message:"Detail deleted successfully"})
    }catch(error){
        console.error("this error occured from payment details Delete",error)
        res.status(500).json({message:"Server Error"})

    }
})

module.exports=router;

