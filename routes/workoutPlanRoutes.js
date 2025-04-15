const express = require('express');
const router = express.Router();
const workoutPlanController = require('../controllers/workoutPlanController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/users/:id/workout-plans', verifyToken, workoutPlanController.getUserWorkoutPlans);
router.get('/workout-plans/:id', verifyToken, workoutPlanController.getWorkoutPlanDetails);
router.post('/users/:id/workout-plans', verifyToken, workoutPlanController.createWorkoutPlan);
router.put('/workout-plans/:id', verifyToken, workoutPlanController.updateWorkoutPlan);
router.delete('/workout-plans/:id', verifyToken, workoutPlanController.deleteWorkoutPlan);

module.exports = router;
