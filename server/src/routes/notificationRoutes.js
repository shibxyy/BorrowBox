const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, getMyNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);

module.exports = router;

