import nodemailer from "nodemailer";
import "dotenv/config";

export const sendSupportReplyEmail = async (recipientEmail, userName, replyMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: recipientEmail,
    subject: "Edit Studio - Support Team Reply",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #4f46e5;
              margin: 0;
              font-size: 24px;
            }
            .content {
              color: #333333;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .message-box {
              background-color: #f9fafb;
              border-left: 4px solid #4f46e5;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #888888;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Edit Studio Support</h1>
            </div>
            
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <p>Thank you for reaching out to Edit Studio support. We've received your message and our team has looked into it.</p>
              
              <div class="message-box">
                <p><strong>Our Reply:</strong></p>
                <p>${replyMessage.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>If you have any further questions or concerns, please don't hesitate to reach out. You can reply directly to this email or visit your support dashboard.</p>
              
              <a href="http://localhost:5173/contact-admin" class="button">View Your Support Messages</a>
            </div>
            
            <div class="footer">
              <p>&copy; 2026 Edit Studio. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this email address.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Support reply email sent to:", recipientEmail);
  } catch (error) {
    console.error("Error sending support reply email:", error);
    throw error;
  }
};

export const sendNewSupportNotificationEmail = async (adminEmail, senderName, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: adminEmail,
    subject: `[SUPPORT] New message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .alert {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Support Message</h2>
            
            <div class="alert">
              <p><strong>New message requires attention!</strong></p>
            </div>
            
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px;">
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <a href="http://localhost:3000/admin/messages" class="button">Review in Admin Panel</a>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending support notification email:", error);
  }
};
