const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyOtp,
    logout,
    updateTrainerPassword
} = require('../controllers/authController');

const { verifyToken } = require('../middlewares/authMiddleware');
const { checkOrigin } = require('../middlewares/checkOrigin');

// ─────────────────────────────────────────────
// 🟢 Public Auth Routes
// ─────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', checkOrigin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-password', verifyToken(['trainer']), updateTrainerPassword);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout); // still public because logout is client-side

// ─────────────────────────────────────────────
// 🔐 Protected Routes
// ─────────────────────────────────────────────
router.get('/me', verifyToken, getMe);

module.exports = router;
