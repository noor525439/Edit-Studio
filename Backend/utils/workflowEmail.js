import nodemailer from "nodemailer";
import "dotenv/config";

const getTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

export const sendWorkflowEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter || !to) return;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Workflow email error:", err.message);
  }
};
