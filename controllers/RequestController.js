const mongoose=require("mongoose")
const users=require("../models/users_")
const PurchaseOrder = require("../models/PurchaseOrder")
const {  StaffResponseAlert,MoreInformationAlert } = require("./notification")
//const requests=require("../models/PurchaseOrder")

const ReviewedRequests = async (req, res) => {
  try {
    const { orderId } = req.query
    console.log("orderId:", req.query);

    const request = await PurchaseOrder.findById(orderId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const Approvals = request.Approvals?.filter(
      (admin) => admin.status === "More Information"
    ) || [];
    const Approval_names=Approvals.map(a=>(a.admin))

    res.status(200).json({ success: true, data: Approval_names });

  } catch (error) {
    console.error("Error in operation", error);
    res.status(500).json({ success: false, message: "Error in processing" });
  }
};
const GetOverallMonthlyRequests = async (req, res) => {
    try {
        const {Department}=req.query
        const query={}
        const now = new Date();
        const startOfDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
        
            1, 0, 0, 0
        ));
        console.log("start of query",startOfDay)
        
        const endOfDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth()+1,
            0,23, 59, 59, 999
        ));
        console.log("end of query",endOfDay)
        query.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay,
        };
        const Requests = await PurchaseOrder.find(query).populate("staff")
        const filteredRequests=Requests.filter((request)=>{
            const plainRequest=request.toObject()
            if(Department){
                return plainRequest.staff.Department===Department
            }
            return true
        }
        
        )
        const totalDailyRequests=filteredRequests.length
        console.log("totalDaily",totalDailyRequests)

        res.status(200).json({
            message: "Total requests for today",
            total: filteredRequests.length,
            data: Department? filteredRequests:Requests
        });
    } catch (error) {
        console.error("An error occurred", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const MonthlyStaffRequest=async(req,res)=>{
    try{
        const {userId}=req.query
        
        const query={}
        if (userId){
            query.staff=userId
        }
        console.log(query)
      
        const now = new Date();
        const startOfDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            0, 0, 0, 0
        ));
        console.log("start of query",startOfDay)
        const endOfDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),

            23, 59, 59, 999
        ));
        console.log("end of query",endOfDay)
        query.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay,
        };
        const Requests = await PurchaseOrder.find(query)

        console.log("Monthly:",Requests)

        res.status(200).json({
            message: "Total requests for today",
            data: Requests,
        });


    }catch(error){
        console.error("An error occurred staff Requests", error);
        res.status(500).json({ message: "Server Error" });
 
    }
}

const MoreInformation=async(req,res)=>{
    const {id:orderId}=req.params
    const {adminName,comment}=req.body
    const user=req.user
    if (!user.canApprove){
        return res.status(403).json({message:'you are not authorized to approve requests'})
    }
    try{
        const request=await PurchaseOrder.findById(orderId)
        if (!request){
            return res.status(404).json({message:"request not found"})
        }
        const approvingUser = await users.findOne({ name: adminName });
        if (!approvingUser) {
          return res.status(404).json({ message: "Approving user not found" });
        }
        request.Approvals=(request.Approvals||[]).filter(
            a=>a.admin!==adminName
        )

        const newDecision={
            admin:adminName,
            status:"More Information",
            comment:comment,
            timestamp:new Date()
        }

        request.Approvals.push(newDecision)
        if(!request.PendingApprovals.includes(approvingUser._id)){

          request.PendingApprovals.push(approvingUser._id)
        }
        const prev_Request=await request.save()
        MoreInformationAlert(prev_Request._id)
        return res.status(200).json({
            success:true,
            message:"successful operation"
        })

    }catch(error){
        console.error("Error in operation",error)
        res.status(500).json({success:false,message:"Error In processing "})
    }

}


const StaffResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, admin } = req.body;

    // Input validation
    console.log("order Id",id)
    if (!message || !admin) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch the purchase order
    const response = await PurchaseOrder.findById(id);
    if (!response) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }
   
    // Add the staff response
    const newStaffResponse = {
      admin,
      message,
      timestamps: new Date().toISOString() // optional: if you want to track time
    };

    response.staffResponse.push(newStaffResponse);
  
    // Save updated document
    const savedResponse = await response.save();

    // Trigger alert or notification
    StaffResponseAlert(response._id);

    // Send response
    return res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: savedResponse.staffResponse // optional: return updated responses
    });

  } catch (error) {
    console.error("Error in StaffResponse:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const GetStaffResponses=async(req,res)=>{
    try{
        const {orderId}=req.query
        if(!orderId){
            return res.status(404).json({success:false,message:"document not found"})
        }
       
        const Request=await PurchaseOrder.findById(orderId)
        let ResponseList=Request.staffResponse.map(response=>{
            const plain=response.toObject()
            return plain
        })
        return res.status(200).json({success:true,data:ResponseList, message:"successsful Request"})
       
    }catch(error){
        console.error("Error in operation",error)
        res.status(500).json({success:false,message:"Error In processing "})

    }
}
const ValidatePendingApprovals=async(requestId)=>{
    try{
        const Approval_roles=["human_resources","internal_auditor"]
        const NewRequest=await  PurchaseOrder.findById(requestId).populate("staff" )
        const Users=await users.find()
        const Managers=["Waste Management Manager","Contracts_manager",
            "Financial_manager","Environmental_lab_manager"]
        let required_approvers;
        const MD_id="6830789898ef43e5803ea02c"
        if(NewRequest.targetDepartment){
               required_approvers=Users.filter(user=>(
                
                (user.canApprove===true&&
                    user.Department===NewRequest.targetDepartment &&
                user.name!==NewRequest.staff.name&& user.role!=="global_admin")||(user.canApprove===true && 
                    !Managers.includes(user.role) && user.Department===NewRequest.targetDepartment
                )
                    || Approval_roles.includes(user.role) || String(user._id)===String(MD_id)
                ))
            }else{

                required_approvers=Users.filter(user=>(
                    
                    
                    (user.canApprove===true&&
                    user.Department===NewRequest.staff.Department && 
                    user.name!==NewRequest.staff.name && user.role!=="global_admin"&& Managers.includes(user.role))
                    || Approval_roles.includes(user.role) || String(user._id)===String(MD_id)
                    ))
                } 
            NewRequest.PendingApprovals = required_approvers.map(user => ({
              _id: user._id,
            }))
            await NewRequest.save()


    }catch(error){
        console.error("an error occured in the validation of approvers",error)

    }
}


const DeleteStaffResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { responseId } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: "Document ID is required" });
        }
        if (!responseId) {
            return res.status(400).json({ success: false, message: "Response ID is required" });
        }

        const Request = await PurchaseOrder.findById(id);
        if (!Request) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        // Convert to string for comparison if needed
        const responseIdStr = responseId.toString();
        
        // Filter out the response to be deleted
        const initialLength = Request.staffResponse.length;
        Request.staffResponse = Request.staffResponse.filter(response => {
            return response._id.toString() !== responseIdStr;
        });

        if (Request.staffResponse.length === initialLength) {
            return res.status(404).json({ 
                success: false, 
                message: "Response not found in document" 
            });
        }

        await Request.save();
        return res.status(200).json({ 
            success: true, 
            message: "Delete successful",
            data: Request.staffResponse 
        });

    } catch (error) {
        console.error("Error in DeleteStaffResponse:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message 
        });
    }
};


module.exports={StaffResponse,MoreInformation,ReviewedRequests,DeleteStaffResponse,
    GetStaffResponses,ValidatePendingApprovals,GetOverallMonthlyRequests,MonthlyStaffRequest};