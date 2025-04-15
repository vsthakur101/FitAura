const knex = require('../config/db');
const { handleError } = require('../utils/helpers');
const { prLogSchema, updatePRLogSchema } = require('../validators/prLog');

// ------------------ Controller Functions ------------------

exports.getPRLogs = async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const logs = await knex('pr_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        return res.status(200).json({ logs });
    } catch (err) {
        return handleError(res, err, 'Failed to fetch PR logs');
    }
};

exports.addPRLog = async (req, res) => {
    const { error, value } = prLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const [log] = await knex('pr_logs').insert(value).returning('*');
        return res.status(201).json({ message: 'PR log added successfully', log });
    } catch (err) {
        return handleError(res, err, 'Failed to add PR log');
    }
};

exports.updatePRLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    const { error, value } = updatePRLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const updated = await knex('pr_logs')
            .where({ id: logId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'PR log not found' });
        }

        return res.status(200).json({ message: 'PR log updated successfully' });
    } catch (err) {
        return handleError(res, err, 'Failed to update PR log');
    }
};

exports.deletePRLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    try {
        const deleted = await knex('pr_logs')
            .where({ id: logId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'PR log not found' });
        }

        return res.status(200).json({ message: 'PR log deleted successfully' });
    } catch (err) {
        return handleError(res, err, 'Failed to delete PR log');
    }
};
