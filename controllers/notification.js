const {transporter}=require("../emailnotification/emailNotification")

const notifications=async (Requests)=>{
    try{

        const emails=['david.umunna@haldengroup.ng']
        const FRONTEND_URL=process.env.FRONTEND_BASED_URL
        const mailOptions={
            from:"HaldenResources management",
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

module.exports=notifications;