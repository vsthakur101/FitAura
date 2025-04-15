const express = require('express');
const router = express.Router();

const {
    getPRLogs,
    addPRLog,
    updatePRLog,
    deletePRLog
} = require('../controllers/prController');

const { verifyToken } = require('../middlewares/authMiddleware');

// ─────────────────────────────────────────────
// 🏋️‍♂️ Personal Record (PR) Log Routes
// ─────────────────────────────────────────────

// Fetch all PR logs for a user
router.get('/:userId', verifyToken, getPRLogs);

// CRUD operations
router.post('/', verifyToken, addPRLog);
router.put('/:id', verifyToken, updatePRLog);
router.delete('/:id', verifyToken, deletePRLog);

module.exports = router;
