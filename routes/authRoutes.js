const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/me', verifyToken, auth.getMe);
router.put('/change-password', verifyToken, auth.changePassword);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/logout', auth.logout);

module.exports = router;
