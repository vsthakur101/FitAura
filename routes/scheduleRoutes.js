const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getUserSchedule, createReminder, updateReminder, deleteReminder } = require('../controllers/scheduleController');

// ─────────────────────────────────────────────
// 🗓️ User Schedule Routes
// ─────────────────────────────────────────────
router.get('/:userId', verifyToken, getUserSchedule);
router.post('/', verifyToken, createReminder);
router.put('/:id', verifyToken, updateReminder);
router.delete('/:id', verifyToken, deleteReminder);

module.exports = router;
