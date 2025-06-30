// Using Nodemailer
const nodemailer = require("nodemailer");
const Resend=require("resend")


//const resend = new Resend();

async function notifyAdmins(request) {
  const transporter = nodemailer.createTransport({
    service: "Outlook",
    auth: {
      user: "david.umunna@haldengroup.ng",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "david.umunna@haldengroup.ng",
    to: "chimarokeumunna98@gmail.com",
    subject: "New Request placed",
    text: `User ${request.orderedBy} made requests`,
  });

}
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use 'hotmail', 'yahoo', etc.
  auth: {
    user: 'haldennoreply@gmail.com',
    pass: process.env.APP_PASS, // Use App Password if 2FA is enabled
  },
});

const Resend_transporter=async()=>{
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',}) 

  if (error) {
    return console.error({ error });

  
  }
  console.log({data})
}


module.exports={notifyAdmins,transporter}
