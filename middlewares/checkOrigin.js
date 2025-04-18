const userPanel = process.env.CLIENT_URL;
const trainerPanel = process.env.TRAINER_URL;

exports.checkOrigin = (req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    return res.status(403).json({ message: 'Missing origin' });
  }

  if (![userPanel, trainerPanel].includes(origin)) {
    return res.status(403).json({ message: 'Blocked: Unknown origin' });
  }

  req.allowedOrigin = origin; // store for controller use
  next();
};
