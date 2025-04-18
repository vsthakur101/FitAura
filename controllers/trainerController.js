const knex = require('../config/db');
const { handleError } = require('../utils/helpers');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');

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
        logError(res, 'Failed to assign client', err);
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
        logError(res, 'Failed to fetch trainer and clients', err);
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
        logError(res, 'Failed to assign workout plan', err);
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
        logError(res, 'Failed to add note', err);
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
        logError(res, 'Failed to fetch notes', err);
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
        logError(res, 'Failed to delete note', err);
    }
};
exports.getUpcomingSchedule = async (req, res) => {
    const trainerId = req.user.id; // coming from token
    const today = dayjs().format('YYYY-MM-DD');

    try {
        const upcoming = await knex('schedule')
            .select('id', 'client_id', 'title', 'date', 'time')
            .where('trainer_id', trainerId)
            .andWhere('date', '>=', today)
            .orderBy('date', 'asc')
            .orderBy('time', 'asc');

        return res.status(200).json(upcoming);
    } catch (err) {
        console.error('Error fetching upcoming schedule:', err);
        return res.status(500).json({ message: 'Failed to fetch upcoming schedule' });
    }
};

exports.getDashboardStats = async (req, res) => {
    const trainerId = req.user.id;
    try {
        const [clientCount] = await knex('assigned_plans')
            .countDistinct('client_id as total')
            .where({ trainer_id: trainerId });

        const [sessionCount] = await knex('schedule')
            .count('id as total')
            .where({ trainer_id: trainerId })
            .andWhere('date', new Date().toISOString().split('T')[0]);

        const [activePlans] = await knex('assigned_plans')
            .count('id as total')
            .where({ trainer_id: trainerId });

        const [notesCount] = await knex('trainer_notes')
            .count('id as total')
            .where({ trainer_id: trainerId });
        return res.status(200).json({
            totalClients: parseInt(clientCount.total),
            totalSessionsToday: parseInt(sessionCount.total),
            totalActivePlans: parseInt(activePlans.total),
            totalNotes: parseInt(notesCount.total),
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

exports.addClientByTrainer = async (req, res) => {
    const {
        name,
        email,
        gender,
        goal,
        weight,
        height,
        password
    } = req.body;

    const trainerId = req.user.id;

    if (!name || !email || !gender || !goal || !weight || !height || !password) {
        return res.status(400).json({ message: 'All fields except profile photo are required' });
    }

    try {
        const existing = await knex('users').where({ email }).first();
        if (existing) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Cloudinary URL will be auto-attached by multer
        const profilePhoto = req.file?.path || null;

        const [createdUser] = await knex('users')
            .insert({
                name,
                email,
                gender,
                fitness_goal: goal,
                weight,
                height,
                password: hashedPassword,
                profile_photo: profilePhoto,
                role: 'member',
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning(['id', 'name', 'email', 'role', 'profile_photo']);

        // ✅ Assign to trainer
        await knex('assigned_plans').insert({
            trainer_id: trainerId,
            client_id: createdUser.id,
            created_at: new Date(),
            updated_at: new Date()
        });

        return res.status(201).json({
            message: 'Client created successfully',
            client: createdUser
        });

    } catch (err) {
        console.error('Error adding client:', err);
        return res.status(500).json({ message: 'Failed to create client' });
    }
};