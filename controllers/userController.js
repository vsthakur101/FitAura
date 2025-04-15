const knex = require('../config/db');

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

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
  const userId = req.params.id;
  const { name, bio, dob, gender } = req.body;

  try {
    await knex('users')
      .where({ id: userId })
      .update({ name, bio, dob, gender, updated_at: new Date() });

    res.json({ message: 'User profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'No file received' });
  }

  try {
    const imageUrl = req.file.path;

    await knex('users')
      .where({ id: userId })
      .update({ profile_photo: imageUrl, updated_at: new Date() });

    res.json({ message: 'Photo uploaded to Cloudinary', url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// ✅ Get Progress Logs
exports.getUserProgress = async (req, res) => {
  const userId = req.params.id;
  try {
    const logs = await knex('progress_logs')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    res.json({ progress: logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress logs', error: err.message });
  }
};

// ✅ Get Nutrition Logs
exports.getUserNutrition = async (req, res) => {
  const userId = req.params.id;
  try {
    const logs = await knex('nutrition_logs')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    res.json({ nutrition: logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching nutrition logs', error: err.message });
  }
};
