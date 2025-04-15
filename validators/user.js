const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().optional(),
    bio: Joi.string().allow('').optional(),
    dob: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
}).min(1).unknown(false);

module.exports = {
    updateProfileSchema
};
