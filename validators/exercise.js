const Joi = require('joi');

const exerciseSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    sets: Joi.number().integer().min(1).required(),
    reps: Joi.number().integer().min(1).required(),
    rest_period: Joi.number().min(0).required(),
    notes: Joi.string().allow('', null)
}).unknown(false);

const updateExerciseSchema = Joi.object({
    name: Joi.string().trim().min(1),
    sets: Joi.number().integer().min(1),
    reps: Joi.number().integer().min(1),
    rest_period: Joi.number().min(0),
    notes: Joi.string().allow('', null)
}).min(1).unknown(false);

module.exports = { exerciseSchema, updateExerciseSchema };
