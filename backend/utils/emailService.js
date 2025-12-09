const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP configuration error:", error);
  } else {
    // console.log("SMTP server is ready to send emails");
  }
});

const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"FinanceFlow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP - FinanceFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 10px;">FinanceFlow</h2>
            <p style="color: #64748b; margin: 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #475569; margin-bottom: 15px;">You requested to reset your password. Use the OTP below to proceed:</p>
            <div style="background: #1e293b; color: white; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #ef4444; font-size: 14px; margin: 0;"><strong>This OTP will expire in 10 minutes.</strong></p>
          </div>
          
          <div style="color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              This is an automated message from FinanceFlow. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("✅ OTP email sent successfully to:", email);
    // console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
};
