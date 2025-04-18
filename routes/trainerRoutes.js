const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    getTrainerClients,
    getTrainerWithClients,
    assignPlanToClient,
    addTrainerNote,
    getTrainerNotesForClient,
    deleteTrainerNote,
    getUpcomingSchedule,
    getDashboardStats,
    addClientByTrainer
} = require('../controllers/trainerController');
const upload = require('../middlewares/upload');

// ─────────────────────────────────────────────
// 👨‍🏫 Trainer Routes
// ─────────────────────────────────────────────

router.get('/clients', verifyToken(['trainer']), getTrainerClients);
router.post('/clients',verifyToken(['trainer']),upload.single('profile_photo'),addClientByTrainer);
// router.get('/clients/:id', verifyToken, getTrainerWithClients);
// router.post('/assign-plan', verifyToken, assignPlanToClient);
// router.post('/notes', verifyToken, addTrainerNote);
// router.get('/notes/:clientId', verifyToken, getTrainerNotesForClient);
// router.delete('/notes/:id', verifyToken, deleteTrainerNote);
router.get('/dashboard-stats', verifyToken(['trainer']), getDashboardStats);
router.get('/schedule/upcoming', verifyToken(['trainer']), getUpcomingSchedule);
module.exports = router;
