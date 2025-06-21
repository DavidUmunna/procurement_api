const express=require("express")
const auth=require("../middlewares/check-auth")
const router=express.Router()

router.post("/",auth,async(req,res)=>{
    try{

        const item=req.body
        const rbac_object={};
        console.log(item)
        if (item.ADMIN_ROLES_ASSET_MANAGEMENT){
                
            rbac_object["ADMIN_ROLES_ASSET_MANAGEMENT"]=['global_admin','human_resources','internal_auditor',"financial_manager"]
        }
        if(item.ADMIN_ROLES_DASHBOARD){
            rbac_object["ADMIN_ROLES_DASHBOARD"]=["procurement_officer", "human_resources", "internal_auditor", "global_admin","lab_supervisor",
           "Financial_manager","waste_management_manager","accounts","waste_management_supervisor","Environmental_lab_manager","PVT_manager",
           "QHSE_coordinator","Contracts_manager","Engineering_manager"];
    
        }
        if(item.GENERAL_ACCESS){
        rbac_object["GENERAL_ACCESS"]=["procurement_officer", "human_resources", "internal_auditor", "global_admin",
            "Financial_manager","accounts","Director",];
            
        }
        if (item.GENERAL_ACCESS_ORDERS){
            rbac_object["GENERAL_ACCESS_ORDERS"]=["procurement_officer", "human_resources", "internal_auditor", "global_admin",
            "Financial_manager","Director",];
            
        }
        if (item.DEPARTMENTAL_ACCESS){
            rbac_object["DEPARTMENTAL_ACCESS"]=["waste_management_manager","waste_management_supervisor","PVT_manager","Environmental_lab_manager","PVT_manager","lab_supervisor","QHSE_coordinator",
                "Contracts_manager","Engineering_manager"]
                
        }if(item.ADMIN_ROLES_GENERAL){
                rbac_object["ADMIN_ROLES_GENERAL"]=["procurement_officer", "human_resources", "internal_auditor", "global_admin","admin","lab_supervisor",
                    "Financial_manager","waste_management_manager","accounts","waste_management_supervisor","Environmental_lab_manager","PVT_manager",
                    "QHSE_coordinator","Contracts_manager","Engineering_manager","admin"];
                    
        }if (item.ADMIN_ROLES_DEPARTMENT){
                rbac_object["ADMIN_ROLES_DEPARTMENT"]=["admin","global_admin","human_resources"]
        }
        if (item.APPROVALS_LIST){
            rbac_object["APPROVALS_LIST"]=["accounts_dep"]
        }
        console.log(rbac_object)  
        res.status(200).json({message:"items Delivered",data:rbac_object})
    }catch(error){
        console.error("from roles&department:",error)
        res.status(500).json({message:'an error occured'})
    }

});

module.exports=router