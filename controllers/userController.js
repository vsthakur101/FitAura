const knex = require('../config/db');
const Joi = require('joi');

// Validation Schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  bio: Joi.string().allow('').optional(),
  dob: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional()
});

exports.getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const user = await knex('users')
      .select('id', 'name', 'email', 'phone', 'role', 'profile_photo', 'bio', 'dob', 'gender')
      .where({ id: userId })
      .first();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  try {
    const updated = await knex('users')
      .where({ id: userId })
      .update({ ...value, updated_at: new Date() });

    if (updated === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

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

    res.json({ message: 'Photo uploaded successfully', url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.getUserProgress = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const logs = await knex('progress_logs')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    res.json({ progress: logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress logs', error: err.message });
  }
};

exports.getUserNutrition = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const logs = await knex('nutrition_logs')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    res.json({ nutrition: logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching nutrition logs', error: err.message });
  }
};
