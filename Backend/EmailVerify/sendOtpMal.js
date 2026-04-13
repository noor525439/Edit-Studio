import nodemailer from "nodemailer"
import "dotenv/config"

export const setOptMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Password reset Otp',
        html: `<p>Your Otp for the reset  password is <b>${otp}</b> it is valid for 10 mins </p>`
    }
    await transporter.sendMail(mailOptions)
}