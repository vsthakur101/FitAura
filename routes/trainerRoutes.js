const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    getTrainerClients,
    assignClient,
    getTrainerWithClients,
    assignPlanToClient,
    addTrainerNote,
    getTrainerNotesForClient,
    deleteTrainerNote
} = require('../controllers/trainerController');

// ─────────────────────────────────────────────
// 👨‍🏫 Trainer Routes
// ─────────────────────────────────────────────

router.get('/clients', verifyToken, getTrainerClients);
router.post('/clients', verifyToken, assignClient);
router.get('/clients/:id', verifyToken, getTrainerWithClients);
router.post('/assign-plan', verifyToken, assignPlanToClient);
router.post('/notes', verifyToken, addTrainerNote);
router.get('/notes/:clientId', verifyToken, getTrainerNotesForClient);
router.delete('/notes/:id', verifyToken, deleteTrainerNote);

module.exports = router;
