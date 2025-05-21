// Using Nodemailer
const nodemailer = require("nodemailer");

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
    user: 'chimarokeumunna98@gmail.com',
    pass: 'xruialzgbdhfzzkt', // Use App Password if 2FA is enabled
  },
});


module.exports={notifyAdmins,transporter}
