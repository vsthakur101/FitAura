const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/nutrition-logs/:userId', verifyToken, nutritionController.getNutritionLogs);
router.post('/nutrition-logs', verifyToken, nutritionController.addNutritionLog);
router.put('/nutrition-logs/:id', verifyToken, nutritionController.updateNutritionLog);
router.delete('/nutrition-logs/:id', verifyToken, nutritionController.deleteNutritionLog);

module.exports = router;
