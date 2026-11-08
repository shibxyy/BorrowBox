const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'borrowbox_super_secret_jwt_key_2026_bca_mini_project';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await queryOne(
      'SELECT id, name, email, phone, location, bio, avatar, role, is_verified, trust_score, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session expired.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};

