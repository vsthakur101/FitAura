const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const planSchema = Joi.object({
    title: Joi.string().required(),
    goal: Joi.string().required(),
    duration_weeks: Joi.number().integer().min(1).required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    days: Joi.array().items(
        Joi.object({
            day_number: Joi.number().integer().required(),
            title: Joi.string().required(),
            notes: Joi.string().allow('', null),
            exercises: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    sets: Joi.number().integer().min(1).required(),
                    reps: Joi.number().integer().min(1).required(),
                    rest_period: Joi.number().min(0).required(),
                    notes: Joi.string().allow('', null)
                })
            ).required()
        })
    ).min(1).required()
});

exports.getUserWorkoutPlans = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    try {
        const plans = await knex('workout_plans')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');

        res.json({ plans });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching workout plans', error: err.message });
    }
};

exports.getWorkoutPlanDetails = async (req, res) => {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    try {
        const plan = await knex('workout_plans').where({ id: planId }).first();
        if (!plan) return res.status(404).json({ message: 'Workout plan not found' });

        const days = await knex('workout_days')
            .where({ plan_id: planId })
            .orderBy('day_number', 'asc');

        const daysWithExercises = await Promise.all(
            days.map(async (day) => {
                const exercises = await knex('exercises').where({ day_id: day.id });
                return { ...day, exercises };
            })
        );

        res.json({ ...plan, days: daysWithExercises });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching workout plan', error: err.message });
    }
};

exports.createWorkoutPlan = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    const { error, value } = planSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const trx = await knex.transaction();
    try {
        const [plan] = await trx('workout_plans')
            .insert({ user_id: userId, ...value })
            .returning('*');

        for (const day of value.days) {
            const [insertedDay] = await trx('workout_days')
                .insert({
                    plan_id: plan.id,
                    day_number: day.day_number,
                    title: day.title,
                    notes: day.notes
                })
                .returning('*');

            const exercisesToInsert = day.exercises.map((ex) => ({
                day_id: insertedDay.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                rest_period: ex.rest_period,
                notes: ex.notes
            }));

            if (exercisesToInsert.length) {
                await trx('exercises').insert(exercisesToInsert);
            }
        }

        await trx.commit();
        res.status(201).json({ message: 'Workout plan created successfully', plan_id: plan.id });
    } catch (err) {
        await trx.rollback();
        res.status(500).json({ error: 'Failed to create workout plan', detail: err.message });
    }
};

exports.updateWorkoutPlan = async (req, res) => {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    const { title, goal, duration_weeks, level } = req.body;

    try {
        const updated = await knex('workout_plans')
            .where({ id: planId })
            .update({ title, goal, duration_weeks, level });

        if (updated === 0) return res.status(404).json({ message: 'Workout plan not found' });

        res.json({ message: 'Workout plan updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update workout plan', detail: err.message });
    }
};

exports.deleteWorkoutPlan = async (req, res) => {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    const trx = await knex.transaction();
    try {
        const deleted = await trx('workout_plans').where({ id: planId }).del();

        if (deleted === 0) {
            await trx.rollback();
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        await trx('workout_days').where({ plan_id: planId }).del();
        // optionally, cascade delete exercises based on orphan days

        await trx.commit();
        res.json({ message: 'Workout plan deleted successfully' });
    } catch (err) {
        await trx.rollback();
        res.status(500).json({ error: 'Failed to delete workout plan', detail: err.message });
    }
};
