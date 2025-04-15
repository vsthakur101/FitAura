exports.signup = (req, res) => {
  res.json({ message: 'Signup success (sample response)' });
};

exports.login = (req, res) => {
  res.json({ token: 'dummy-jwt-token' });
};