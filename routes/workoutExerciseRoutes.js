const express = require('express');
const router = express.Router();

const {
    addExerciseToDay,
    updateExercise,
    deleteExercise,
    getExercisesByDay
} = require('../controllers/workoutExerciseController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 🗓️ Workout Day-Level Routes
// ─────────────────────────────────────────────
router.post('/workout-days/:id/exercises', verifyToken, addExerciseToDay);
router.get('/workout-days/:id/exercises', verifyToken, getExercisesByDay);

// ─────────────────────────────────────────────
// 💪 Individual Exercise Routes
// ─────────────────────────────────────────────
router.put('/exercises/:id', verifyToken, updateExercise);
router.delete('/exercises/:id', verifyToken, deleteExercise);

module.exports = router;
