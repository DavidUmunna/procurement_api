const {transporter}=require("../emailnotification/emailNotification")
const order=require("../models/PurchaseOrder")
const users=require("../models/users_")
const notifications=async (Requests)=>{
    try{

        const emails=['david.umunna@haldengroup.ng']
        const FRONTEND_URL=process.env.FRONTEND_BASED_URL
        const mailOptions={
            from:"Halden Resources Management",
            to:emails.map((email)=>{return email}),
            subject:'new Requests available',
            html:`
            <p>A total of ${Requests} requests have been sent.</p>
            <p>Do well to check thier contents ${FRONTEND_URL} </p>
            <p>Thank you</p>
            `
        }
        await transporter.sendMail(mailOptions)
    }catch(error){
        console.error("error originated from notification controller:",error)
    }

}
const IncomingRequest=async (requestId)=>{
    try{
        const test_emails=['david.umunna@haldengroup.ng']
        const new_request=await order.findById(requestId).populate("staff","-password -__v -role -canApprove -_id")
        const users_list=(await users.find()).filter(user=>((user.canApprove===true && user.Department===new_request.staff.Department) || 
            user.Department==="Human resources"||user.role==="internal_auditor" ||user.role==="global_admin"||user.role==="accounts"))
        const emails=users_list.map(user=>(user.email))
        console.log("the emails :",emails)
        const FRONTEND_URL=process.env.FRONTEND_BASED_URL
        const mailOptions={
            from: "Halden Resources Management",
            to:emails,
            subject:`new Request on ${new Date().toLocaleString()} `,
            html:`
            <p>A new Request from ${new_request.staff.name}</p>
            <p>Titled ${new_request.Title}</p>
            <p>needs your attention</p>
            <p>do well to check their contents ${FRONTEND_URL}</p>            
            <p>Thank you</p>
            `
        }
        await transporter.sendMail(mailOptions)
    }catch(error){
        console.error("error originated from notification controller:",error)

    }
   
}


const RequestActivity=async(requestId)=>{
    try{
        const test_emails=['david.umunna@haldengroup.ng']
        const prev_Request=await order.findById(requestId).populate("staff","-password -__v -role -canApprove -_id")
        const FRONTEND_URL=process.env.FRONTEND_BASED_URL
        staff_emails=[prev_Request.staff.email]
        const accountsUsers = await users.find({ role: "accounts" });
        const accountEmails = accountsUsers.map(user => user.email);
        staff_emails.push(...accountEmails);    
        console.log("staff emails:",staff_emails)
        
        const decisions=prev_Request.Approvals.map(approval=>{return approval})
        const mailOptions={
            from: "Halden Resources Management",
            to:staff_emails,
            subject:`Request Title:${prev_Request.Title}`,
            html:`
            <p>there has been some some recent activity on this request</p>
            <p>the request was made by ${prev_Request.staff.name}</p>
            <p>${decisions.map(decision=>(
                `${decision.admin}  ${decision.status} the request on ${decision.timestamp.toLocaleString()}`
            ))}</p>
            <p>do well to check their contents ${FRONTEND_URL}</p> 

            `
        }
        await transporter.sendMail(mailOptions)

    }catch(error){
        console.error("error originated from notification controller:",error)
    }
}
module.exports={notifications,IncomingRequest,RequestActivity};