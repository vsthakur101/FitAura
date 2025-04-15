const knex = require('../config/db');
exports.addExerciseToDay = async (req, res) => {
    const dayId = req.params.id;
    const { name, sets, reps, rest_period, notes } = req.body;
    
    const day = await knex('workout_days').where({ id: dayId }).first();
    if (!day) return res.status(404).json({ message: 'Workout day not found' });

    try {
        const [exercise] = await knex('exercises')
            .insert({
                day_id: dayId,
                name,
                sets,
                reps,
                rest_period,
                notes
            })
            .returning('*');

        res.status(201).json({ message: 'Exercise added', exercise });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add exercise', detail: err.message });
    }
};

exports.updateExercise = async (req, res) => {
    const exerciseId = req.params.id;
    const { name, sets, reps, rest_period, notes } = req.body;

    try {
        const updated = await knex('exercises')
            .where({ id: exerciseId })
            .update({
                name,
                sets,
                reps,
                rest_period,
                notes
            });

        if (updated === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.json({ message: 'Exercise updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update exercise', detail: err.message });
    }
};

exports.deleteExercise = async (req, res) => {
    const exerciseId = req.params.id;

    try {
        const deleted = await knex('exercises').where({ id: exerciseId }).del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete exercise', detail: err.message });
    }
};

exports.getExercisesByDay = async (req, res) => {
    const dayId = req.params.id;

    try {
        const exercises = await knex('exercises').where({ day_id: dayId });

        res.json({ exercises });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exercises', detail: err.message });
    }
};

