const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'SES' if you're using AWS SES
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});


exports.generateSecureOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  while (otp.length < length) {
    const byte = crypto.randomBytes(1);
    const num = byte[0] % 10;
    otp += digits[num];
  }
  return otp;
}

exports.generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.sendOtpEmail = async (to, otp) => {
    const mailOptions = {
      from: `"FitAura Support" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Your OTP for Password Reset',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>👋 Hey,</h2>
          <p>You requested to reset your password.</p>
          <p><strong>Your OTP is: <span style="font-size: 24px;">${otp}</span></strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <br />
          <p>Stay Fit 💪<br/>– FitAura Team</p>
        </div>
      `
    };
  
    await transporter.sendMail(mailOptions);
  };


exports.logError = (res, message, err) => {
    console.error(`[ERROR] ${message}:`, err); // for terminal
    return res.status(500).json({
        message,
        error: err.message
    });
};
