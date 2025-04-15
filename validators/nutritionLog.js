const Joi = require('joi');

const nutritionLogSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    date: Joi.date().required(),
    meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
    food_item: Joi.string().trim().required(),
    calories: Joi.number().min(0).required(),
    protein: Joi.number().min(0).required(),
    carbs: Joi.number().min(0).required(),
    fat: Joi.number().min(0).required()
}).unknown(false);

const updateNutritionLogSchema = Joi.object({
    date: Joi.date(),
    meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack'),
    food_item: Joi.string().trim(),
    calories: Joi.number().min(0),
    protein: Joi.number().min(0),
    carbs: Joi.number().min(0),
    fat: Joi.number().min(0)
}).min(1).unknown(false);

module.exports = {
    nutritionLogSchema,
    updateNutritionLogSchema
};
