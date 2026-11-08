const { queryOne, queryAll, execute } = require('../config/db');

// Get current user's notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await queryAll(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [req.user.id]
    );

    const unreadCount = await queryOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    return res.json({
      success: true,
      unreadCount: unreadCount?.count || 0,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};

