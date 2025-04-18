const knex = require('../config/db');
const { logError } = require('../utils/helpers');
const {
    nutritionLogSchema,
    updateNutritionLogSchema
} = require('../validators/nutritionLog');

exports.getNutritionLogs = async (req, res) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const logs = await knex('nutrition_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        return res.status(200).json({ logs });
    } catch (error) {
        return logError(res, error, 'Failed to fetch nutrition logs');
    }
};

exports.addNutritionLog = async (req, res) => {
    const { error, value } = nutritionLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const [log] = await knex('nutrition_logs')
            .insert(value)
            .returning('*');

        return res.status(201).json({ message: 'Nutrition log added successfully', log });
    } catch (error) {
        return logError(res, error, 'Failed to add nutrition log');
    }
};

exports.updateNutritionLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    const { error, value } = updateNutritionLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const updated = await knex('nutrition_logs')
            .where({ id: logId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        return res.status(200).json({ message: 'Nutrition log updated successfully' });
    } catch (error) {
        return logError(res, error, 'Failed to update nutrition log');
    }
};

exports.deleteNutritionLog = async (req, res) => {
    const logId = Number(req.params.id);
    if (!Number.isInteger(logId)) {
        return res.status(400).json({ message: 'Invalid log ID' });
    }

    try {
        const deleted = await knex('nutrition_logs')
            .where({ id: logId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        return res.status(200).json({ message: 'Nutrition log deleted successfully' });
    } catch (error) {
        return logError(res, error, 'Failed to delete nutrition log');
    }
};
