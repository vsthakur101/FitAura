const express = require('express');
const router = express.Router();

const {
    getUserWorkoutPlans,
    getWorkoutPlanDetails,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
} = require('../controllers/workoutPlanController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 📦 Workout Plans - Bulk (User Scope)
// ─────────────────────────────────────────────
router.get('/users/:id/workout-plans', verifyToken, getUserWorkoutPlans);
router.post('/users/:id/workout-plans', verifyToken, createWorkoutPlan);

// ─────────────────────────────────────────────
// 🧾 Workout Plan - Single (Plan Scope)
// ─────────────────────────────────────────────
router.get('/workout-plans/:id', verifyToken, getWorkoutPlanDetails);
router.put('/workout-plans/:id', verifyToken, updateWorkoutPlan);
router.delete('/workout-plans/:id', verifyToken, deleteWorkoutPlan);

module.exports = router;
