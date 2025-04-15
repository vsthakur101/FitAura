const knex = require('../config/db');
const { handleError } = require('../utils/helpers');

exports.getTrainerClients = async (req, res) => {
    const { id: trainerId, role } = req.user;
    debugger;

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied: Only trainers allowed' });
    }

    try {
        const clients = await knex('client_trainer_map as map')
            .join('users as u', 'map.client_id', 'u.id')
            .where('map.trainer_id', trainerId)
            .select('u.id', 'u.name', 'u.email', 'u.profile_photo', 'u.role');
        res.status(200).json({ clients });
    } catch (err) {
        handleError(res, 'Failed to fetch trainer clients', err);
    }
};

exports.assignClient = async (req, res) => {
    const { client_id } = req.body;
    const { id: trainer_id, role } = req.user;

    const user = await knex('users').where({ id: client_id }).first();
    if (!user) {
        return res.status(404).json({ message: 'Client not found in users table' });
    }

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied: Only trainers can assign clients' });
    }

    try {
        // check if already assigned
        const exists = await knex('client_trainer_map')
            .where({ trainer_id, client_id })
            .first();

        if (exists) {
            return res.status(400).json({ message: 'Client already assigned to this trainer' });
        }

        const [map] = await knex('client_trainer_map')
            .insert({ trainer_id, client_id })
            .returning('*');

        res.status(201).json({ message: 'Client assigned successfully', data: map });
    } catch (err) {
        handleError(res, 'Failed to assign client', err);
    }
};

exports.getTrainerWithClients = async (req, res) => {
    const trainerId = req.params.id;

    try {
        const trainer = await knex('users')
            .where({ id: trainerId, role: 'trainer' })
            .first();

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        const clients = await knex('client_trainer_map as map')
            .join('users as u', 'map.client_id', 'u.id')
            .where('map.trainer_id', trainerId)
            .select('u.id', 'u.name', 'u.email', 'u.profile_photo', 'u.role');

        res.status(200).json({
            trainer: {
                id: trainer.id,
                name: trainer.name,
                email: trainer.email,
                profile_photo: trainer.profile_photo
            },
            clients
        });
    } catch (err) {
        handleError(res, 'Failed to fetch trainer and clients', err);
    }
};
exports.assignPlanToClient = async (req, res) => {
    const { client_id, plan_id, notes } = req.body;
    const { id: trainer_id, role } = req.user;

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can assign plans' });
    }

    try {
        const [existing] = await knex('assigned_plans')
            .where({ trainer_id, client_id, plan_id });

        if (existing) {
            return res.status(400).json({ message: 'Plan already assigned to this client' });
        }

        const [assignment] = await knex('assigned_plans')
            .insert({
                trainer_id,
                client_id,
                plan_id,
                notes
            })
            .returning('*');

        res.status(201).json({ message: 'Plan assigned successfully', data: assignment });
    } catch (err) {
        handleError(res, 'Failed to assign workout plan', err);
    }
};
exports.addTrainerNote = async (req, res) => {
    const { client_id, note } = req.body;
    const { id: trainer_id, role } = req.user;

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can add notes' });
    }

    try {
        const [inserted] = await knex('trainer_notes')
            .insert({ trainer_id, client_id, note })
            .returning('*');

        res.status(201).json({
            message: 'Note added successfully',
            data: inserted
        });
    } catch (err) {
        handleError(res, 'Failed to add note', err);
    }
};
exports.getTrainerNotesForClient = async (req, res) => {
    const { clientId } = req.params;
    const { id: trainer_id, role } = req.user;

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied: Only trainers can view their notes' });
    }

    try {
        const notes = await knex('trainer_notes')
            .where({ trainer_id, client_id: clientId })
            .orderBy('created_at', 'desc');

        res.status(200).json({ notes });
    } catch (err) {
        handleError(res, 'Failed to fetch notes', err);
    }
};
exports.deleteTrainerNote = async (req, res) => {
    const noteId = req.params.id;
    const { id: trainer_id, role } = req.user;

    if (role !== 'trainer') {
        return res.status(403).json({ message: 'Access denied: Only trainers can delete notes' });
    }

    try {
        const deleted = await knex('trainer_notes')
            .where({ id: noteId, trainer_id }) // Only allow deleting own note
            .del();

        if (!deleted) {
            return res.status(404).json({ message: 'Note not found or access denied' });
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        handleError(res, 'Failed to delete note', err);
    }
};
