const knex = require('../config/db'); // update as per your path

exports.getUserWorkoutPlans = async (req, res) => {
    const userId = req.params.id;

    try {
        const plans = await knex('workout_plans')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');

        res.json({ plans });
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching workout plans',
            error: err.message
        });
    }
};

exports.getWorkoutPlanDetails = async (req, res) => {
    const planId = req.params.id;

    try {
        const plan = await knex('workout_plans')
            .where({ id: planId })
            .first();

        if (!plan) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        const days = await knex('workout_days')
            .where({ plan_id: planId })
            .orderBy('day_number', 'asc');

        // For each day, get exercises
        const daysWithExercises = await Promise.all(
            days.map(async (day) => {
                const exercises = await knex('exercises')
                    .where({ day_id: day.id });

                return {
                    ...day,
                    exercises
                };
            })
        );

        res.json({
            ...plan,
            days: daysWithExercises
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching workout plan', error: err.message });
    }
};

exports.createWorkoutPlan = async (req, res) => {
    const userId = req.params.id;
    const { title, goal, duration_weeks, level, days } = req.body;

    try {
        // Insert plan
        const [plan] = await knex('workout_plans')
            .insert({
                user_id: userId,
                title,
                goal,
                duration_weeks,
                level
            })
            .returning('*');

        // Insert days + exercises
        for (const day of days) {
            const [insertedDay] = await knex('workout_days')
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

            await knex('exercises').insert(exercisesToInsert);
        }

        res.status(201).json({ message: 'Workout plan created successfully', plan_id: plan.id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create workout plan', detail: err.message });
    }
};

exports.updateWorkoutPlan = async (req, res) => {
    const planId = req.params.id;
    const { title, goal, duration_weeks, level } = req.body;

    try {
        const updated = await knex('workout_plans')
            .where({ id: planId })
            .update({
                title,
                goal,
                duration_weeks,
                level
            });

        if (updated === 0) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        res.json({ message: 'Workout plan updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update workout plan', detail: err.message });
    }
};

exports.deleteWorkoutPlan = async (req, res) => {
    const planId = req.params.id;

    try {
        const deleted = await knex('workout_plans')
            .where({ id: planId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        res.json({ message: 'Workout plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete workout plan', detail: err.message });
    }
};
