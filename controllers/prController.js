const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const prLogSchema = Joi.object({
    user_id: Joi.number().required(),
    exercise: Joi.string().min(1).required(),
    weight: Joi.number().min(0).required(),
    reps: Joi.number().integer().min(1).required(),
    date: Joi.date().required(),
    notes: Joi.string().allow('', null)
});

const updateSchema = Joi.object({
    exercise: Joi.string().min(1),
    weight: Joi.number().min(0),
    reps: Joi.number().integer().min(1),
    date: Joi.date(),
    notes: Joi.string().allow('', null)
});

exports.getPRLogs = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

    try {
        const logs = await knex('pr_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch PR logs', error: err.message });
    }
};

exports.addPRLog = async (req, res) => {
    const { error, value } = prLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const [log] = await knex('pr_logs')
            .insert(value)
            .returning('*');

        res.status(201).json({ message: 'PR log added', log });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add PR log', error: err.message });
    }
};

exports.updatePRLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const updated = await knex('pr_logs')
            .where({ id: logId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'PR log not found' });
        }

        res.json({ message: 'PR log updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update PR log', error: err.message });
    }
};

exports.deletePRLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    try {
        const deleted = await knex('pr_logs').where({ id: logId }).del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'PR log not found' });
        }

        res.json({ message: 'PR log deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete PR log', error: err.message });
    }
};
