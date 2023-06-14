require('dotenv').config()
const nodemailer = require("nodemailer");

async function sendEmail(data) {

    var transporter = nodemailer.createTransport({
        host: process.env.HOST,
        secureConnection: false,
        port: process.env.EMAIL_PORT,
        tls: { ciphers: 'SSLv3' },
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.FROM,
        to: data.emailId,
        subject: "Welcome E-Mail",
        text: "Hello " + data.username + "," +
            "\n\nThank you for registeration." +
            "\n\n~Team TipManager." +
            "\n\nNote: This is a system generated email. Please do not reply on that E-Mail."
    };
    return transporter.sendMail(mailOptions);
}

exports.sendEmail = sendEmail;
