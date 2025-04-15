const Joi = require('joi');

const progressLogSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    date: Joi.date().required(),
    weight: Joi.number().min(0).required(),
    body_fat: Joi.number().min(0).optional(),
    notes: Joi.string().allow('', null)
}).unknown(false);

const updateProgressLogSchema = Joi.object({
    date: Joi.date(),
    weight: Joi.number().min(0),
    body_fat: Joi.number().min(0),
    notes: Joi.string().allow('', null)
}).min(1).unknown(false);

module.exports = {
    progressLogSchema,
    updateProgressLogSchema
};
