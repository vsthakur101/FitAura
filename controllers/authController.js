const knex = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const otpStore = {}; // TODO :- TEMPORARY - use PostgreSQL later
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await knex('users')
      .insert({ name, email, password: hashedPassword, role })
      .returning(['id', 'name', 'email', 'role']);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).select('id', 'name', 'email', 'role').first();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: req.user.id }).update({ password: hashed });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await knex('users').where({ email }).first();
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Mock: return reset token
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  res.json({ message: 'Use this reset token', resetToken }); // In real app, send email
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: decoded.id }).update({ password: hashed });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ message: 'OTP sent successfully', otp }); // show for dev testing
};

// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

  const validOtp = otpStore[phone];
  if (!validOtp || validOtp !== otp) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  // Check if user exists, else create
  let user = await knex('users').where({ phone }).first();
  if (!user) {
    const [newUser] = await knex('users')
      .insert({ phone, role: 'beginner' })
      .returning('*');
    user = newUser;
  }

  // Generate JWT
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ message: 'OTP verified', token });
};

exports.logout = (req, res) => {
  // No real logout on server for JWT
  res.json({ message: 'User logged out (client should discard token)' });
};
