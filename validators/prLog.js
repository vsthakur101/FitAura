const Joi = require('joi');

const prLogSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    exercise: Joi.string().trim().min(1).required(),
    weight: Joi.number().min(0).required(),
    reps: Joi.number().integer().min(1).required(),
    date: Joi.date().required(),
    notes: Joi.string().allow('', null)
}).unknown(false);

const updatePRLogSchema = Joi.object({
    exercise: Joi.string().trim().min(1),
    weight: Joi.number().min(0),
    reps: Joi.number().integer().min(1),
    date: Joi.date(),
    notes: Joi.string().allow('', null)
}).min(1).unknown(false);

module.exports = {
    prLogSchema,
    updatePRLogSchema
};
