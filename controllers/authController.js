// controllers/authController.js
const knex = require('../config/db');
const redis = require('../config/redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { signupSchema, loginSchema, changePasswordSchema, otpSchema, otpVerifySchema } = require('../validators/authValidators');
const { generateToken, sendResetEmail, logError } = require('../utils/helpers');

exports.signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { name, email, password, role } = value;
    const existing = await knex('users').where({ email }).first();
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await knex('users')
      .insert({ name, email, password: hashedPassword, role })
      .returning(['id', 'name', 'email', 'role']);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    logError('Signup Error', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = value;
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token });
  } catch (err) {
    logError('Login Error', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await knex('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'role')
      .first();

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    logError('Fetch Current User Error', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { oldPassword, newPassword } = value;
    const user = await knex('users').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: req.user.id }).update({ password: hashed });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    logError('Change Password Error', err);
    res.status(500).json({ message: 'Error changing password' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    await sendResetEmail(email, resetToken); // placeholder for actual email service
    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    logError('Forgot Password Error', err);
    res.status(500).json({ message: 'Failed to process forgot password' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and password are required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: decoded.id }).update({ password: hashed });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    logError('Reset Password Error', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { error, value } = otpSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { phone } = value;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-min TTL
    await redis.setex(`otp:${phone}`, 300, otp);

    // Send via SMS in real-world, or console for dev
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp }); // Dev only
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', detail: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { error, value } = otpVerifySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { phone, otp } = value;

    // Environment-based configuration
    const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_RETRIES) || 5;
    const ATTEMPT_TTL = parseInt(process.env.OTP_RETRY_TTL) || 300;

    const storedOtp = await redis.get(`otp:${phone}`);
    const retryKey = `otp:attempts:${phone}`;

    const attempts = parseInt(await redis.get(retryKey)) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        message: 'Too many failed attempts. Please try again later.'
      });
    }

    if (!storedOtp || storedOtp !== otp) {
      // Increment retry attempts
      await redis
        .multi()
        .incr(retryKey)
        .expire(retryKey, ATTEMPT_TTL)
        .exec();

      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is correct – clear stored values
    await redis.del(`otp:${phone}`);
    await redis.del(retryKey);

    // Check or create user
    let user = await knex('users').where({ phone }).first();
    if (!user) {
      const [newUser] = await knex('users')
        .insert({ phone, role: 'beginner' })
        .returning('*');
      user = newUser;
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ message: 'OTP verified', token });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to verify OTP',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

exports.logout = (_req, res) => {
  res.json({ message: 'User logged out (client should discard token)' });
};
