const path = require("path");
const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASS,
    },
  });

  let htmlText = "";
  if (options?.template) {
    htmlText = await ejs.renderFile(
      path.join(__dirname, "..", options?.template),
      options.data || null
    );
  }

  const mailOptions = {
    from: options?.from || "noreply@gmail.com",
    subject: options?.subject || "Sample Subject",
    to: options?.to || "mazen.mezoo20189@gmail.com",
    cc: options?.cc || [],
    bcc: options?.bcc || [],
    html: htmlText,
    attachments: options?.attachments || [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: ", info.messageId);
    }
  });
};

module.exports = sendEmail;
