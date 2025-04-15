const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/users/:id', verifyToken, user.getUserById);
router.put('/users/:id', verifyToken, user.updateUserProfile);
router.put('/users/:id/profile-photo', verifyToken, upload.single('photo'), user.uploadProfilePhoto);
router.get('/users/:id/progress', verifyToken, user.getUserProgress);
router.get('/users/:id/nutrition', verifyToken, user.getUserNutrition);


module.exports = router;
