const knex = require('../config/db');
const { handleError } = require('../utils/helpers');

exports.getUserSchedule = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Check if plan is assigned to user
        const assignment = await knex('assigned_plans')
            .where({ client_id: userId })
            .orderBy('assigned_at', 'desc')
            .first();

        if (!assignment) {
            return res.status(404).json({ message: 'No plan assigned to this user' });
        }

        const plan = await knex('workout_plans').where({ id: assignment.plan_id }).first();

        const days = await knex('workout_days').where({ plan_id: plan.id });

        const detailedDays = await Promise.all(
            days.map(async (day) => {
                const exercises = await knex('exercises').where({ day_id: day.id });
                return {
                    ...day,
                    exercises
                };
            })
        );

        res.status(200).json({
            plan: {
                id: plan.id,
                title: plan.title,
                goal: plan.goal,
                level: plan.level,
                assigned_by: assignment.trainer_id,
                assigned_at: assignment.assigned_at
            },
            schedule: detailedDays
        });
    } catch (err) {
        handleError(res, 'Failed to fetch user schedule', err);
    }
};

exports.createReminder = async (req, res) => {
    const { title, description, date, time, repeat } = req.body;
    const user_id = req.user.id;

    try {
        const [reminder] = await knex('user_schedule_reminders')
            .insert({
                user_id,
                title,
                description,
                date,
                time,
                repeat
            })
            .returning('*');

        res.status(201).json({ message: 'Reminder scheduled successfully', data: reminder });
    } catch (err) {
        handleError(res, 'Failed to schedule reminder', err);
    }
};
exports.updateReminder = async (req, res) => {
    const reminderId = req.params.id;
    const { title, description, date, time, repeat } = req.body;
    const user_id = req.user.id;

    try {
        // Ensure the reminder exists and belongs to the current user
        const reminder = await knex('user_schedule_reminders')
            .where({ id: reminderId, user_id })
            .first();

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found or unauthorized access' });
        }

        const [updated] = await knex('user_schedule_reminders')
            .where({ id: reminderId })
            .update({
                title,
                description,
                date,
                time,
                repeat
            })
            .returning('*');

        res.status(200).json({
            message: 'Reminder updated successfully',
            data: updated
        });
    } catch (err) {
        handleError(res, 'Failed to update reminder', err);
    }
};
exports.deleteReminder = async (req, res) => {
    const reminderId = req.params.id;
    const user_id = req.user.id;

    try {
        const deleted = await knex('user_schedule_reminders')
            .where({ id: reminderId, user_id })
            .del();

        if (!deleted) {
            return res.status(404).json({ message: 'Reminder not found or unauthorized' });
        }

        res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (err) {
        handleError(res, 'Failed to delete reminder', err);
    }
};
