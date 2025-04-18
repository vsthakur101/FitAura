const express = require('express');
const router = express.Router();

const {
    getNutritionLogs,
    addNutritionLog,
    updateNutritionLog,
    deleteNutritionLog
} = require('../controllers/nutritionController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 🍽️ Nutrition Log Routes
// ─────────────────────────────────────────────

// Fetch all logs for a user
router.get('/:userId', verifyToken, getNutritionLogs);

// CRUD for individual log entries
router.post('/', verifyToken, addNutritionLog);
router.put('/:id', verifyToken, updateNutritionLog);
router.delete('/:id', verifyToken, deleteNutritionLog);

module.exports = router;
