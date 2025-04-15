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
  const filePath = req.file.path;

  try {
    await knex('users')
      .where({ id: userId })
      .update({ profile_photo: filePath, updated_at: new Date() });

    res.json({ message: 'Profile photo updated', path: filePath });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading photo', error: err.message });
  }
};
