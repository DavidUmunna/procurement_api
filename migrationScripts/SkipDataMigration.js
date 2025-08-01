const mongoose=require("mongoose")
const SkipsData=require("../models/skips_tracking")
require('dotenv').config({ path: '../.env' });
const Migration=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)

        const DocsToUpdate=await SkipsData.find({
            $or:[
                {DateMobilized:{$exists:false}},
                {DateReceivedOnLocation:{$exists:false}},
                {SkipsTruckRegNo:{$exists:false}},
                {SkipsTruckDriver:{$exists:false}},
                {WasteTruckRegNo:{$exists:false}},
                {WasteTruckDriverName:{$exists:false}}
            ]
        })

        for (let i=0;i<DocsToUpdate.length;i++){
            if (DocsToUpdate[i].DateMobilized===undefined){
                DocsToUpdate[i].DateMobilized=null
            }
            if(DocsToUpdate[i].DateReceivedOnLocation===undefined){
                DocsToUpdate[i].DateReceivedOnLocation=null
            }
            if(DocsToUpdate[i].SkipsTruckRegNo===undefined){
                DocsToUpdate[i].SkipsTruckRegNo=null
            }
            if(DocsToUpdate[i].SkipsTruckDriver===undefined){
                DocsToUpdate[i].SkipsTruckDriver=null
            }
            if(DocsToUpdate[i].WasteTruckRegNo===undefined){
                DocsToUpdate[i].WasteTruckRegNo=null
            }
            if(DocsToUpdate[i].WasteTruckDriverName==undefined){
                DocsToUpdate[i].WasteTruckDriverName=null
            }
            console.log(DocsToUpdate[i])

            await DocsToUpdate[i].save()
            console.log(`skips document ${SkipsData._id}`)
        }

        await mongoose.disconnect()
        console.log("Migration Complete ")
    }catch(error){
        console.error('Migration failed:', error);
        mongoose.disconnect();
    }
}

Migration();