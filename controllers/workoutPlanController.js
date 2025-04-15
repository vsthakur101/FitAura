const knex = require('../config/db');
const { handleError } = require('../utils/helpers');
const { planSchema } = require('../validators/workoutPlan');

// Get all workout plans for a user
exports.getUserWorkoutPlans = async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    try {
        const plans = await knex('workout_plans')
            .where({ user_id: userId })
            .whereNull('deleted_at')
            .orderBy('created_at', 'desc');

        return res.json({ plans });
    } catch (err) {
        return handleError(res, err, 'Error fetching workout plans');
    }
};

// Get full details of a workout plan (with days and exercises)
exports.getWorkoutPlanDetails = async (req, res) => {
    const planId = Number(req.params.id);
    if (!Number.isInteger(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    try {
        const plan = await knex('workout_plans').where({ id: planId }).whereNull('deleted_at').first();
        if (!plan) return res.status(404).json({ message: 'Workout plan not found' });

        const days = await knex('workout_days')
            .where({ plan_id: planId })
            .whereNull('deleted_at')
            .orderBy('day_number', 'asc');

        const daysWithExercises = await Promise.all(
            days.map(async (day) => {
                const exercises = await knex('exercises')
                    .where({ day_id: day.id })
                    .whereNull('deleted_at');
                return { ...day, exercises };
            })
        );

        return res.json({ ...plan, days: daysWithExercises });
    } catch (err) {
        return handleError(res, err, 'Error fetching workout plan');
    }
};

// Create workout plan with nested days and exercises
exports.createWorkoutPlan = async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    const { error, value } = planSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

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

        await trx('audit_logs').insert({
            user_id: req.user.id,
            action: 'CREATE_WORKOUT_PLAN',
            details: JSON.stringify({ plan_id: plan.id }),
            timestamp: new Date()
        });

        await trx.commit();
        return res.status(201).json({ message: 'Workout plan created successfully', plan_id: plan.id });
    } catch (err) {
        await trx.rollback();
        return handleError(res, err, 'Failed to create workout plan');
    }
};

// Update metadata only (title, goal, etc.)
exports.updateWorkoutPlan = async (req, res) => {
    const planId = Number(req.params.id);
    if (!Number.isInteger(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    const { title, goal, duration_weeks, level } = req.body;

    try {
        const updated = await knex('workout_plans')
            .where({ id: planId })
            .update({ title, goal, duration_weeks, level, updated_at: new Date() });

        if (updated === 0) return res.status(404).json({ message: 'Workout plan not found' });

        await knex('audit_logs').insert({
            user_id: req.user.id,
            action: 'UPDATE_WORKOUT_PLAN',
            details: JSON.stringify({ plan_id: planId }),
            timestamp: new Date()
        });

        return res.json({ message: 'Workout plan updated successfully' });
    } catch (err) {
        return handleError(res, err, 'Failed to update workout plan');
    }
};

// Soft-delete a plan (and optionally its children)
exports.deleteWorkoutPlan = async (req, res) => {
    const planId = Number(req.params.id);
    if (!Number.isInteger(planId)) return res.status(400).json({ message: 'Invalid plan ID' });

    const trx = await knex.transaction();
    try {
        const plan = await trx('workout_plans')
            .where({ id: planId })
            .whereNull('deleted_at')
            .first();

        if (!plan) {
            await trx.rollback();
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        await trx('workout_plans').where({ id: planId }).update({ deleted_at: new Date() });

        const days = await trx('workout_days').where({ plan_id: planId });
        const dayIds = days.map((d) => d.id);

        await trx('workout_days').whereIn('id', dayIds).update({ deleted_at: new Date() });
        await trx('exercises').whereIn('day_id', dayIds).update({ deleted_at: new Date() });

        await trx('audit_logs').insert({
            user_id: req.user.id,
            action: 'DELETE_WORKOUT_PLAN',
            details: JSON.stringify({ plan_id: planId }),
            timestamp: new Date()
        });

        await trx.commit();
        return res.status(200).json({ message: 'Workout plan deleted successfully' });
    } catch (err) {
        await trx.rollback();
        return handleError(res, err, 'Failed to delete workout plan');
    }
};
