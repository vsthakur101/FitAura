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

exports.handleError = (res, message, err) => {
    console.error(`[ERROR] ${message}:`, err); // for terminal
    return res.status(500).json({
        message,
        error: err.message
    });
};
