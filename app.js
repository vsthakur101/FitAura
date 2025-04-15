const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerDocument } = require('./swagger');
require('dotenv').config();

const app = express();

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ROUTES
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const workoutExerciseRoutes = require('./routes/workoutExerciseRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const prRoutes = require('./routes/prRoutes');

// MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Apply rate limiter to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'FitAura backend running ✅' });
});

// MAIN ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workout-plans', workoutPlanRoutes);
app.use('/api/v1/workout-days', workoutExerciseRoutes);
app.use('/api/v1/nutrition-logs', nutritionRoutes);
app.use('/api/v1/progress-logs', progressRoutes);
app.use('/api/v1/pr-logs', prRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

module.exports = app;
