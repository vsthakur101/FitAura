const Joi = require('joi');

const planSchema = Joi.object({
    title: Joi.string().required(),
    goal: Joi.string().required(),
    duration_weeks: Joi.number().integer().min(1).required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    days: Joi.array().items(
        Joi.object({
            day_number: Joi.number().integer().required(),
            title: Joi.string().required(),
            notes: Joi.string().allow('', null),
            exercises: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    sets: Joi.number().integer().min(1).required(),
                    reps: Joi.number().integer().min(1).required(),
                    rest_period: Joi.number().min(0).required(),
                    notes: Joi.string().allow('', null)
                })
            ).min(1).required()
        })
    ).min(1).required()
}).unknown(false);

module.exports = { planSchema };
