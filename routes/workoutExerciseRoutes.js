const express = require('express');
const router = express.Router();
const workoutExerciseController = require('../controllers/workoutExerciseController');
const {verifyToken} = require('../middlewares/authMiddleware');

router.post('/workout-days/:id/exercises', verifyToken, workoutExerciseController.addExerciseToDay);
router.put('/exercises/:id', verifyToken, workoutExerciseController.updateExercise);
router.delete('/exercises/:id', verifyToken, workoutExerciseController.deleteExercise);
router.get('/workout-days/:id/exercises', verifyToken, workoutExerciseController.getExercisesByDay);

module.exports = router;
