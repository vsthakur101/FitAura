const knex = require('../config/db');
const { handleError } = require('../utils/helpers');
const { exerciseSchema, updateExerciseSchema } = require('../validators/exercise');

exports.addExerciseToDay = async (req, res) => {
    const dayId = Number(req.params.id);
    if (!Number.isInteger(dayId)) return res.status(400).json({ message: 'Invalid workout day ID' });

    const { error, value } = exerciseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const day = await knex('workout_days').where({ id: dayId }).first();
        if (!day) return res.status(404).json({ message: 'Workout day not found' });

        const [exercise] = await knex('exercises')
            .insert({ day_id: dayId, ...value })
            .returning('*');

        await knex('audit_logs').insert({
            user_id: req.user.id,
            action: 'ADD_EXERCISE',
            details: JSON.stringify(exercise),
            timestamp: new Date()
        });

        return res.status(201).json({ message: 'Exercise added successfully', exercise });
    } catch (err) {
        return handleError(res, err, 'Failed to add exercise');
    }
};

exports.updateExercise = async (req, res) => {
    const exerciseId = Number(req.params.id);
    if (!Number.isInteger(exerciseId)) return res.status(400).json({ message: 'Invalid exercise ID' });

    const { error, value } = updateExerciseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const existing = await knex('exercises').where({ id: exerciseId }).whereNull('deleted_at').first();
        if (!existing) return res.status(404).json({ message: 'Exercise not found' });

        await knex('exercises').where({ id: exerciseId }).update(value);

        await knex('audit_logs').insert({
            user_id: req.user.id,
            action: 'UPDATE_EXERCISE',
            details: JSON.stringify({ before: existing, after: value }),
            timestamp: new Date()
        });

        return res.status(200).json({ message: 'Exercise updated successfully' });
    } catch (err) {
        return handleError(res, err, 'Failed to update exercise');
    }
};

exports.deleteExercise = async (req, res) => {
    const exerciseId = Number(req.params.id);
    if (!Number.isInteger(exerciseId)) return res.status(400).json({ message: 'Invalid exercise ID' });

    try {
        const existing = await knex('exercises').where({ id: exerciseId }).whereNull('deleted_at').first();
        if (!existing) return res.status(404).json({ message: 'Exercise not found' });

        await knex('exercises').where({ id: exerciseId }).update({ deleted_at: new Date() });

        await knex('audit_logs').insert({
            user_id: req.user.id,
            action: 'DELETE_EXERCISE',
            details: JSON.stringify(existing),
            timestamp: new Date()
        });

        return res.status(200).json({ message: 'Exercise soft-deleted successfully' });
    } catch (err) {
        return handleError(res, err, 'Failed to delete exercise');
    }
};

exports.getExercisesByDay = async (req, res) => {
    const dayId = Number(req.params.id);
    if (!Number.isInteger(dayId)) return res.status(400).json({ message: 'Invalid workout day ID' });

    try {
        const exercises = await knex('exercises')
            .where({ day_id: dayId })
            .whereNull('deleted_at')
            .orderBy('id', 'asc');

        return res.status(200).json({ exercises });
    } catch (err) {
        return handleError(res, err, 'Failed to fetch exercises');
    }
};
