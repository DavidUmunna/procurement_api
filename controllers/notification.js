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
        const mailOptions = {
        from: "Halden Resources Management <noreply@haldenresources.com>",
        to: emails,
        subject: `New Request Submitted: ${new_request.Title}`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 25px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 22px;">New Request Notification</h2>
                <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Halden Resources Management</p>
            </div>
            
            <div style="padding: 25px;">
                <p style="margin-bottom: 20px;">Dear Team,</p>
                
                <p style="margin-bottom: 15px;">A new request has been submitted requiring your attention:</p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px; font-weight: bold; color: #2c3e50;">Request Details:</p>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Submitted By:</td>
                            <td style="padding: 5px 0;">${new_request.staff.name}</td>
                        </tr>
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Title:</td>
                            <td style="padding: 5px 0; font-weight: 500;">${new_request.Title}</td>
                        </tr>
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Date Submitted:</td>
                            <td style="padding: 5px 0;">${new Date().toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
                
                <p style="margin-bottom: 25px;">Please review this request at your earliest convenience:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}" 
                       style="background-color: #2c3e50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;
                              font-weight: bold; letter-spacing: 0.5px;">
                        View Full Request Details
                    </a>
                </div>
                
                <p style="margin-bottom: 0;">Thank you for your prompt attention to this matter.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; 
                        font-size: 12px; color: #7f8c8d; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">This is an automated notification. Please do not reply directly to this email.</p>
                <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Halden Resources Management. All rights reserved.</p>
            </div>
        </div>
        `
        };
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
            to:test_emails,
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

const MoreInformationAlert=async(requestId)=>{
    try{
        const prev_Request=await order.findById(requestId).populate("staff","-password -__v -role -canApprove -_id")
        const FRONTEND_URL=process.env.FRONTEND_BASED_URL
        staff_emails=[prev_Request.staff.email]
        const moreInfo=prev_Request.Approvals?.filter(a=>a.status==="More Information")
        const mailOptions = {
    from: "Halden Resources Management <noreply@haldenresources.com>",
    to: staff_emails,
    subject: `Action Required: Additional Information Needed for Request - "${prev_Request.Title}"`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h2 style="color: #2c3e50; margin: 0;">Halden Resources Management</h2>
        </div>
        
        <div style="padding: 20px;">
            <h3 style="color: #2c3e50;">Additional Information Required</h3>
            
            <p>Dear Team Member,</p>
            
            <p>We require additional information regarding your request:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
                <strong>Request Title:</strong> ${prev_Request.Title}
            </div>
            
            <p>The following administrators have requested more information:</p>
            
            <ul style="padding-left: 20px;">
                ${moreInfo.map(decision => `
                    <li style="margin-bottom: 8px;">
                        <strong>${decision.admin}</strong> requested additional details on 
                        ${decision.timestamp.toLocaleString()}
                    </li>
                `).join('')}
            </ul>
            
            <p>Please review the request and provide the necessary information at your earliest convenience:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${FRONTEND_URL}" 
                   style="background-color: #3498db; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    View Request Details
                </a>
            </div>
            
            <p>Thank you for your prompt attention to this matter.</p>
            
            <p>Best regards,<br>
            The Halden Resources Team</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; 
                    font-size: 12px; color: #7f8c8d; border-top: 1px solid #e0e0e0;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
    `
    };
    await transporter.sendMail(mailOptions)
        
    }catch(error){
          console.error("error originated from notification controller:",error)

    }
}

const StaffResponseAlert = async (requestId) => {
    try {
        const prev_Request = await order.findById(requestId)
            .populate("staff", "-password -__v -role -canApprove -_id")
            .populate("staffResponse.admin", "name email"); // Populate admin details if needed
        all_users=await users.find()
        //console.log("all the users of the app",all_users)
        const admin_Decision=prev_Request.Approvals.filter(a=>a.status==="More Information") //get the approvals data for the request
        const admin_names=admin_Decision.map(a=>(a.admin))
        const admin_users=all_users.filter(user=>admin_names.includes(user.name))
        const admin_emails=admin_users.map(a=>(a.email))
        console.log("admin_users",admin_emails)
        if (!prev_Request) {
            throw new Error("Request not found");
        }

        const FRONTEND_URL = process.env.FRONTEND_BASED_URL;
        const staff_emails = [prev_Request.staff?.email];
        const staffResponse = prev_Request.staffResponse || [];


        const mailOptions = {
        from: "Halden Resources Management <noreply@haldenresources.com>",
        to: admin_emails.map(a=>(a)), // Changed to admin emails instead of staff emails
        subject: `Staff Response Received for Request: "${prev_Request.Title}"`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 25px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 22px;">Staff Response Notification</h2>
                <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Halden Resources Management</p>
            </div>
            
            <div style="padding: 25px;">
                <p style="margin-bottom: 20px;">Dear Admin,</p>
                
                <p style="margin-bottom: 15px;">A staff member has responded to your request for additional information:</p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px; font-weight: bold; color: #2c3e50;">Request Details:</p>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Request Title:</td>
                            <td style="padding: 5px 0; font-weight: 500;">${prev_Request.Title}</td>
                        </tr>
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Request ID:</td>
                            <td style="padding: 5px 0;">${prev_Request.orderNumber}</td>
                        </tr>
                        <tr>
                            <td style="width: 30%; padding: 5px 0; color: #7f8c8d;">Staff Member:</td>
                            <td style="padding: 5px 0;">${prev_Request.staff.name}</td>
                        </tr>
                    </table>
                </div>
                
              
                
               
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}" 
                       style="background-color: #2c3e50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;
                              font-weight: bold; letter-spacing: 0.5px;">
                        Review Full Request
                    </a>
                </div>
                
                <p style="margin-bottom: 0;">You may now proceed with the next steps in the approval process.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; 
                        font-size: 12px; color: #7f8c8d; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0;">This is an automated notification. Please do not reply directly to this email.</p>
                <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Halden Resources Management. All rights reserved.</p>
            </div>
        </div>
        `
        };

        // Send the email (implementation depends on your email service)
        await transporter.sendMail(mailOptions);


    } catch (error) {
        console.error("Error sending staff response alert:", error);
       
    }
};
module.exports={notifications,IncomingRequest,RequestActivity,MoreInformationAlert,StaffResponseAlert};