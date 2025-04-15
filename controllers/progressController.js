const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const progressLogSchema = Joi.object({
    user_id: Joi.number().required(),
    date: Joi.date().required(),
    weight: Joi.number().min(0).required(),
    body_fat: Joi.number().min(0).optional(),
    notes: Joi.string().allow('', null)
});

const updateSchema = Joi.object({
    date: Joi.date(),
    weight: Joi.number().min(0),
    body_fat: Joi.number().min(0),
    notes: Joi.string().allow('', null)
});

exports.getProgressLogs = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    try {
        const logs = await knex('progress_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch progress logs', error: err.message });
    }
};

exports.addProgressLog = async (req, res) => {
    const { error, value } = progressLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const [log] = await knex('progress_logs')
            .insert(value)
            .returning('*');

        res.status(201).json({ message: 'Progress log added', log });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add progress log', error: err.message });
    }
};

exports.updateProgressLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const updated = await knex('progress_logs')
            .where({ id: logId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'Progress log not found' });
        }

        res.json({ message: 'Progress log updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update progress log', error: err.message });
    }
};

exports.deleteProgressLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    try {
        const deleted = await knex('progress_logs')
            .where({ id: logId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Progress log not found' });
        }

        res.json({ message: 'Progress log deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete progress log', error: err.message });
    }
};
