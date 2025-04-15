const express = require('express');
const router = express.Router();

const {
    getProgressLogs,
    addProgressLog,
    updateProgressLog,
    deleteProgressLog
} = require('../controllers/progressController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 📈 Progress Log Routes
// ─────────────────────────────────────────────

// Fetch all logs for a user
router.get('/:userId', verifyToken, getProgressLogs);

// CRUD operations
router.post('/', verifyToken, addProgressLog);
router.put('/:id', verifyToken, updateProgressLog);
router.delete('/:id', verifyToken, deleteProgressLog);

module.exports = router;
