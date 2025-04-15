const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const nutritionLogSchema = Joi.object({
    user_id: Joi.number().required(),
    date: Joi.date().required(),
    meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
    food_item: Joi.string().required(),
    calories: Joi.number().required(),
    protein: Joi.number().required(),
    carbs: Joi.number().required(),
    fat: Joi.number().required()
});

const updateLogSchema = Joi.object({
    date: Joi.date(),
    meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack'),
    food_item: Joi.string(),
    calories: Joi.number(),
    protein: Joi.number(),
    carbs: Joi.number(),
    fat: Joi.number()
});

exports.getNutritionLogs = async (req, res) => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const logs = await knex('nutrition_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch logs', detail: err.message });
    }
};

exports.addNutritionLog = async (req, res) => {
    const { error, value } = nutritionLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const [log] = await knex('nutrition_logs')
            .insert(value)
            .returning('*');

        res.status(201).json({ message: 'Nutrition log added', log });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add nutrition log', detail: err.message });
    }
};

exports.updateNutritionLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    const { error, value } = updateLogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    try {
        const updated = await knex('nutrition_logs')
            .where({ id: logId })
            .update(value);

        if (updated === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        res.json({ message: 'Nutrition log updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update nutrition log', detail: err.message });
    }
};

exports.deleteNutritionLog = async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) return res.status(400).json({ message: 'Invalid log ID' });

    try {
        const deleted = await knex('nutrition_logs')
            .where({ id: logId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        res.json({ message: 'Nutrition log deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete nutrition log', detail: err.message });
    }
};
