const knex = require('../config/db');
const { logError } = require('../utils/helpers');
const { progressLogSchema, updateProgressLogSchema } = require('../validators/progressLog');

// ------------------ Controller Functions ------------------

exports.getProgressLogs = async (req, res) => {
    const userId = Number(req.params.userId);
    const { page = 1, limit = 10 } = req.query;

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const offset = (page - 1) * limit;

    try {
        const logs = await knex('progress_logs')
            .where({ user_id: userId })
            .whereNull('deleted_at')
            .orderBy('date', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await knex('progress_logs')
            .where({ user_id: userId })
            .whereNull('deleted_at')
            .count('*');

        return res.status(200).json({
            total: Number(count),
            page: Number(page),
            limit: Number(limit),
            logs
        });
    } catch (err) {
        return logError(res, err, 'Failed to fetch progress logs');
    }
};

exports.addProgressLog = async (req, res) => {
    const { error, value } = progressLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const [log] = await knex('progress_logs').insert(value).returning('*');

        await knex('audit_logs').insert({
            user_id: value.user_id,
            action: 'CREATE_PROGRESS_LOG',
            details: JSON.stringify(log),
            timestamp: new Date()
        });

        return res.status(201).json({ message: 'Progress log added successfully', log });
    } catch (err) {
        return logError(res, err, 'Failed to add progress log');
    }
};

exports.updateProgressLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    const { error, value } = updateProgressLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const existing = await knex('progress_logs')
            .where({ id: logId })
            .whereNull('deleted_at')
            .first();

        if (!existing) return res.status(404).json({ message: 'Progress log not found' });

        await knex('progress_logs').where({ id: logId }).update(value);

        await knex('audit_logs').insert({
            user_id: existing.user_id,
            action: 'UPDATE_PROGRESS_LOG',
            details: JSON.stringify({ before: existing, after: value }),
            timestamp: new Date()
        });

        return res.status(200).json({ message: 'Progress log updated successfully' });
    } catch (err) {
        return logError(res, err, 'Failed to update progress log');
    }
};

exports.deleteProgressLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    try {
        const existing = await knex('progress_logs')
            .where({ id: logId })
            .whereNull('deleted_at')
            .first();

        if (!existing) return res.status(404).json({ message: 'Progress log not found' });

        await knex('progress_logs').where({ id: logId }).update({ deleted_at: new Date() });

        await knex('audit_logs').insert({
            user_id: existing.user_id,
            action: 'DELETE_PROGRESS_LOG',
            details: JSON.stringify(existing),
            timestamp: new Date()
        });

        return res.status(200).json({ message: 'Progress log soft-deleted successfully' });
    } catch (err) {
        return logError(res, err, 'Failed to delete progress log');
    }
};
