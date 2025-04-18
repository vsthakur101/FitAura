const knex = require('../config/db');
const { logError } = require('../utils/helpers');
const { updateProfileSchema } = require('../validators/user');

exports.getUserById = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const user = await knex('users')
      .select('id', 'name', 'email', 'phone', 'role', 'profile_photo', 'bio', 'dob', 'gender')
      .where({ id: userId })
      .first();

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (err) {
    return logError(res, err, 'Error fetching user');
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updated = await knex('users')
      .where({ id: userId })
      .update({ ...value, updated_at: new Date() });

    if (updated === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User profile updated successfully' });
  } catch (err) {
    return logError(res, err, 'Error updating profile');
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  if (!req.file) {
    return res.status(400).json({ message: 'No file received' });
  }

  try {
    const imageUrl = req.file.path;

    const updated = await knex('users')
      .where({ id: userId })
      .update({ profile_photo: imageUrl, updated_at: new Date() });

    if (updated === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Photo uploaded successfully', url: imageUrl });
  } catch (err) {
    return logError(res, err, 'Upload failed');
  }
};

exports.getUserProgress = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const logs = await knex('progress_logs')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('date', 'desc');

    return res.status(200).json({ progress: logs });
  } catch (err) {
    return logError(res, err, 'Error fetching progress logs');
  }
};

exports.getUserNutrition = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const logs = await knex('nutrition_logs')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('date', 'desc');

    return res.status(200).json({ nutrition: logs });
  } catch (err) {
    return logError(res, err, 'Error fetching nutrition logs');
  }
};