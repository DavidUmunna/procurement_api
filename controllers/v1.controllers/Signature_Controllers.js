const Signatures=require("../../models/Signatures")




const CreateSignature=async(userId,SignatureData,ip,device)=>{
    try{
        
        const NewSignature=new Signatures({
            userId:userId,
            SignatureData:SignatureData,
            ipAddress:ip,
            device:device
        })

        const SavedSignature=await NewSignature.save()
        return SavedSignature._id


    }catch(error){
        console.log("error occurred in signature POST",error)
        
    }
}


module.exports={CreateSignature}