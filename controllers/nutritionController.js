const knex = require('../config/db');

exports.getNutritionLogs = async (req, res) => {
    const userId = req.params.userId;

    try {
        const logs = await knex('nutrition_logs')
            .where({ user_id: userId })
            .orderBy('date', 'desc');

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs', detail: err.message });
    }
};

exports.addNutritionLog = async (req, res) => {
    const {
        user_id,
        date,
        meal_type,
        food_item,
        calories,
        protein,
        carbs,
        fat
    } = req.body;

    try {
        const [log] = await knex('nutrition_logs')
            .insert({
                user_id,
                date,
                meal_type,
                food_item,
                calories,
                protein,
                carbs,
                fat
            })
            .returning('*');

        res.status(201).json({ message: 'Nutrition log added', log });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to add nutrition log',
            detail: err.message
        });
    }
};

exports.updateNutritionLog = async (req, res) => {
    const logId = req.params.id;
    const {
        date,
        meal_type,
        food_item,
        calories,
        protein,
        carbs,
        fat
    } = req.body;

    try {
        const updated = await knex('nutrition_logs')
            .where({ id: logId })
            .update({
                date,
                meal_type,
                food_item,
                calories,
                protein,
                carbs,
                fat
            });

        if (updated === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        res.json({ message: 'Nutrition log updated successfully' });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to update nutrition log',
            detail: err.message
        });
    }
};

exports.deleteNutritionLog = async (req, res) => {
    const logId = req.params.id;

    try {
        const deleted = await knex('nutrition_logs')
            .where({ id: logId })
            .del();

        if (deleted === 0) {
            return res.status(404).json({ message: 'Nutrition log not found' });
        }

        res.json({ message: 'Nutrition log deleted successfully' });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to delete nutrition log',
            detail: err.message
        });
    }
};
