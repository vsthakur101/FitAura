const Joi = require('joi');

exports.signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'user', 'beginner').default('user')
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

exports.otpSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

exports.otpVerifySchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    otp: Joi.string().length(6).required()
});
