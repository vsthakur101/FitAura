const jwt = require('jsonwebtoken');

exports.generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.sendResetEmail = async (email, token) => {
    console.log(`Reset link to ${email}: ${token}`);
    // Hook to email service
};

exports.logError = (label, error) => {
    console.error(`[${label}]`, error.message);
};

exports.handleError = (res, error, fallbackMessage = 'Internal Server Error') => {
    console.error(error); // You can replace with winston/Sentry logger
    res.status(500).json({
        message: fallbackMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
