// controllers/authController.js
const knex = require('../config/db');
const redis = require('../config/redis');
const bcrypt = require('bcrypt');
const { signupSchema, loginSchema } = require('../validators/authValidators');
const { generateToken, sendOtpEmail, logError, generateSecureOtp } = require('../utils/helpers');

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

    if (req.allowedOrigin === process.env.TRAINER_URL && user.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers are allowed to login here' });
    }
    const token = generateToken({ id: user.id, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true only on HTTPS
      sameSite: 'lax', // or 'strict' based on use case
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    logError('Login Error', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await knex('users')
      .select('id', 'name', 'email', 'role')
      .where({ id: decoded.id })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate secure 4-digit OTP
    const otp = generateSecureOtp(4);
    if (!/^\d{4}$/.test(otp)) {
      console.error('Invalid OTP generated:', otp);
    }

    const otpKey = `otp:email:${email}`;
    const retryKey = `otp:attempts:email:${email}`;
    const expiryInSeconds = 600; // 10 minutes

    // Store OTP in Redis with expiry
    await redis.set(otpKey, otp, 'EX', expiryInSeconds);
    await redis.del(retryKey); // Reset retry count (optional)

    // Send OTP email
    console.log(`OTP for ${email}: ${otp}`); // Dev only
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    logError('Forgot Password OTP Error', err);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.updateTrainerPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const trainerId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Both old and new password are required' });
  }

  try {
    const user = await knex('users').where({ id: trainerId }).first();

    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied. Only trainers can update password.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: trainerId }).update({
      password: hashedNew,
      updated_at: new Date()
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await knex('users')
      .where({ email })
      .update({ password: hashedPassword, updated_at: new Date() });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    logError('Reset Password Error', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpKey = `otp:email:${email}`;
    const retryKey = `otp:attempts:email:${email}`;
    const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_RETRIES || '5');
    const ATTEMPT_TTL = parseInt(process.env.OTP_RETRY_TTL || '300');

    const storedOtp = await redis.get(otpKey);
    const attempts = parseInt(await redis.get(retryKey)) || 0;

    if (attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many failed attempts. Please try again later.' });
    }

    if (!storedOtp || storedOtp !== otp) {
      await redis
        .multi()
        .incr(retryKey)
        .expire(retryKey, ATTEMPT_TTL)
        .exec();

      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP verified — cleanup
    await redis.del(otpKey);
    await redis.del(retryKey);

    return res.status(200).json({ message: 'OTP verified. You may now reset your password.' });
  } catch (err) {
    logError('Verify Forgot OTP Error', err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.logout = (_req, res) => {
  res.json({ message: 'User logged out (client should discard token)' });
};
