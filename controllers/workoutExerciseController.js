const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const exerciseSchema = Joi.object({
    name: Joi.string().min(1).required(),
    sets: Joi.number().integer().min(1).required(),
    reps: Joi.number().integer().min(1).required(),
    rest_period: Joi.number().min(0).required(),
    notes: Joi.string().allow('', null)
});

exports.addExerciseToDay = async (req, res) => {
    const dayId = parseInt(req.params.id);
    if (isNaN(dayId)) return res.status(400).json({ message: 'Invalid workout day ID' });

    const { error, value } = exerciseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const day = await knex('workout_days').where({ id: dayId }).first();
        if (!day) return res.status(404).json({ message: 'Workout day not found' });

        const [exercise] = await knex('exercises')
            .insert({ day_id: dayId, ...value })
            .returning('*');

        res.status(201).json({ message: 'Exercise added', exercise });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add exercise', error: err.message });
    }
};

exports.updateExercise = async (req, res) => {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) return res.status(400).json({ message: 'Invalid exercise ID' });

    const { error, value } = exerciseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const updated = await knex('exercises')
            .where({ id: exerciseId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.json({ message: 'Exercise updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update exercise', error: err.message });
    }
};

exports.deleteExercise = async (req, res) => {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) return res.status(400).json({ message: 'Invalid exercise ID' });

    try {
        const deleted = await knex('exercises').where({ id: exerciseId }).del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete exercise', error: err.message });
    }
};

exports.getExercisesByDay = async (req, res) => {
    const dayId = parseInt(req.params.id);
    if (isNaN(dayId)) return res.status(400).json({ message: 'Invalid workout day ID' });

    try {
        const exercises = await knex('exercises').where({ day_id: dayId }).orderBy('id', 'asc');

        res.json({ exercises });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch exercises', error: err.message });
    }
};
