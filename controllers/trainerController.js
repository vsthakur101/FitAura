const knex = require('../config/db');

exports.getTrainerClients = async (req, res) => {
    const trainerId = req.user.id; // assuming verifyToken middleware injects user info

    try {
        const clients = await knex('client_trainer_map as map')
            .join('users as u', 'map.client_id', 'u.id')
            .where('map.trainer_id', trainerId)
            .select('u.id', 'u.name', 'u.email', 'u.role', 'u.profile_photo');

        res.json({ clients });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trainer clients', detail: err.message });
    }
};
