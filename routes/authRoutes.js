const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
    sendOtp,
    verifyOtp,
    logout
} = require('../controllers/authController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 🟢 Public Auth Routes
// ─────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout); // still public because logout is client-side

// ─────────────────────────────────────────────
// 🔐 Protected Routes
// ─────────────────────────────────────────────
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
