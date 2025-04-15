const knex = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const otpStore = {}; // TODO: Replace with PostgreSQL-based table with TTL (e.g. Redis or temporal table)

// Utility to generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ------------------ Validators ------------------

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user', 'beginner').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const otpSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

const otpVerifySchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otp: Joi.string().length(6).required()
});

// ------------------ Controllers ------------------

exports.signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { name, email, password, role } = value;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await knex('users')
      .insert({ name, email, password: hashedPassword, role })
      .returning(['id', 'name', 'email', 'role']);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', detail: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = value;
    const user = await knex('users').where({ email }).first();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', detail: err.message });
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
    res.status(500).json({ message: 'Failed to fetch user', detail: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { oldPassword, newPassword } = value;

    const user = await knex('users').where({ id: req.user.id }).first();

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: req.user.id }).update({ password: hashed });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', detail: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    // TODO: Send via email in production
    res.json({ message: 'Use this reset token', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Error processing forgot password', detail: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: decoded.id }).update({ password: hashed });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', detail: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { error, value } = otpSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { phone } = value;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, createdAt: Date.now() };

    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp }); // show only in dev
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', detail: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { error, value } = otpVerifySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { phone, otp } = value;
    const storedOtp = otpStore[phone];

    if (!storedOtp || storedOtp.otp !== otp || Date.now() - storedOtp.createdAt > 5 * 60 * 1000) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    let user = await knex('users').where({ phone }).first();
    if (!user) {
      const [newUser] = await knex('users').insert({ phone, role: 'beginner' }).returning('*');
      user = newUser;
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ message: 'OTP verified', token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify OTP', detail: err.message });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'User logged out (client should discard token)' });
};
