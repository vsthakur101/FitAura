const express = require('express');
const router = express.Router();

const {
    getUserById,
    updateUserProfile,
    uploadProfilePhoto,
    getUserProgress,
    getUserNutrition
} = require('../controllers/userController');

const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// ─────────────────────────────────────────────
// 👤 User Profile
// ─────────────────────────────────────────────
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUserProfile);
router.put('/:id/upload-profile-photo', verifyToken, upload.single('photo'), uploadProfilePhoto);

// ─────────────────────────────────────────────
// 📊 User Logs
// ─────────────────────────────────────────────
router.get('/:id/progress', verifyToken, getUserProgress);
router.get('/:id/nutrition', verifyToken, getUserNutrition);

module.exports = router;
