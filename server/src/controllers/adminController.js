const { queryOne, queryAll, execute } = require('../config/db');

// Overall Admin Dashboard Statistics
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await queryOne('SELECT COUNT(*) as count FROM users');
    const verifiedUsers = await queryOne('SELECT COUNT(*) as count FROM users WHERE is_verified = 1');
    const totalItems = await queryOne('SELECT COUNT(*) as count FROM items');
    const activeItems = await queryOne("SELECT COUNT(*) as count FROM items WHERE status = 'active' AND is_available = 1");
    const activeBorrows = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE status = 'Active'");
    const completedTransactions = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE status = 'Completed'");
    const pendingDisputes = await queryOne("SELECT COUNT(*) as count FROM disputes WHERE status = 'pending'");

    const recentRequests = await queryAll(`
      SELECT br.*, 
             i.title as item_title, 
             borrower.name as borrower_name, 
             owner.name as owner_name
      FROM borrow_requests br
      JOIN items i ON br.item_id = i.id
      JOIN users borrower ON br.borrower_id = borrower.id
      JOIN users owner ON br.owner_id = owner.id
      ORDER BY br.created_at DESC
      LIMIT 8
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers?.count || 0,
        verifiedUsers: verifiedUsers?.count || 0,
        totalItems: totalItems?.count || 0,
        activeItems: activeItems?.count || 0,
        activeBorrows: activeBorrows?.count || 0,
        completedTransactions: completedTransactions?.count || 0,
        pendingDisputes: pendingDisputes?.count || 0
      },
      recentRequests
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};

// List all users with stats
const getAllUsers = async (req, res) => {
  try {
    const users = await queryAll(`
      SELECT u.id, u.name, u.email, u.phone, u.location, u.role, u.is_verified, u.trust_score, u.created_at,
             (SELECT COUNT(*) FROM items WHERE owner_id = u.id) as items_listed_count,
             (SELECT COUNT(*) FROM borrow_requests WHERE borrower_id = u.id) as borrow_count,
             (SELECT COUNT(*) FROM borrow_requests WHERE owner_id = u.id AND status = 'Completed') as lend_count
      FROM users u
      ORDER BY u.created_at DESC
    `);
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

// Toggle user verification status
const toggleUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await queryOne('SELECT id, is_verified, name FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = user.is_verified ? 0 : 1;
    await execute('UPDATE users SET is_verified = ? WHERE id = ?', [newStatus, userId]);

    // Send notification
    await execute(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Verification Status Updated', ?, 'system')`,
      [
        userId,
        newStatus === 1
          ? 'Congratulations! Your community identity has been officially verified by the BorrowBox Administrator.'
          : 'Your account verification status was modified by the administrator.'
      ]
    );

    return res.json({
      success: true,
      message: `User ${user.name} is now ${newStatus === 1 ? 'Verified' : 'Unverified'}.`,
      is_verified: newStatus
    });
  } catch (error) {
    console.error('Toggle verify error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user verification.' });
  }
};

// Delete user by Admin
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await execute('DELETE FROM reviews WHERE reviewer_id = ? OR reviewee_id = ?', [userId, userId]);
    await execute('DELETE FROM disputes WHERE reporter_id = ?', [userId]);
    await execute('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await execute('DELETE FROM borrow_requests WHERE borrower_id = ? OR owner_id = ?', [userId, userId]);
    await execute('DELETE FROM items WHERE owner_id = ?', [userId]);
    await execute('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ success: true, message: `User "${user.name}" removed successfully.` });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

// List all listings (moderation)
const getAllListingsForAdmin = async (req, res) => {
  try {
    const items = await queryAll(`
      SELECT i.*, 
             c.name as category_name,
             u.name as owner_name, u.email as owner_email, u.is_verified as owner_verified
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN users u ON i.owner_id = u.id
      ORDER BY i.created_at DESC
    `);
    return res.json({ success: true, items });
  } catch (error) {
    console.error('Admin get listings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve listings.' });
  }
};

// Update item status by admin (active, hidden, flagged)
const updateItemStatusAdmin = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body; // 'active', 'hidden', 'flagged'

    if (!['active', 'hidden', 'flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await execute('UPDATE items SET status = ? WHERE id = ?', [status, itemId]);
    return res.json({ success: true, message: `Item status set to ${status}.` });
  } catch (error) {
    console.error('Admin item status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update item status.' });
  }
};

// Manage categories: Create category
const addCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const result = await execute(
      'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
      [name.trim(), description || '', icon || 'Tag']
    );

    const newCat = await queryOne('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Category created.', category: newCat });
  } catch (error) {
    console.error('Add category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add category.' });
  }
};

// Manage categories: Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const itemsUsing = await queryOne('SELECT COUNT(*) as count FROM items WHERE category_id = ?', [id]);
    if (itemsUsing && itemsUsing.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because ${itemsUsing.count} items are currently assigned to it.`
      });
    }

    await execute('DELETE FROM categories WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

// User reports an item or transaction dispute
const createReport = async (req, res) => {
  try {
    const { item_id, request_id, reason, details } = req.body;
    const reporter_id = req.user.id;

    if (!reason || !details) {
      return res.status(400).json({ success: false, message: 'Please provide reason and description.' });
    }

    const result = await execute(
      `INSERT INTO disputes (reporter_id, item_id, request_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [reporter_id, item_id || null, request_id || null, reason.trim(), details.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Report submitted. The administrator will review and resolve this matter.',
      reportId: result.lastID
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
};

// Admin list disputes and reports
const getDisputes = async (req, res) => {
  try {
    const disputes = await queryAll(`
      SELECT d.*, 
             u.name as reporter_name, u.email as reporter_email,
             i.title as item_title
      FROM disputes d
      JOIN users u ON d.reporter_id = u.id
      LEFT JOIN items i ON d.item_id = i.id
      ORDER BY d.created_at DESC
    `);
    return res.json({ success: true, disputes });
  } catch (error) {
    console.error('Get disputes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
};

// Admin resolve dispute
const updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['pending', 'investigating', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await execute(
      `UPDATE disputes 
       SET status = ?, admin_notes = COALESCE(?, admin_notes)
       WHERE id = ?`,
      [status, admin_notes, id]
    );

    return res.json({ success: true, message: `Dispute marked as ${status}.` });
  } catch (error) {
    console.error('Update dispute error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update dispute.' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserVerification,
  deleteUser,
  getAllListingsForAdmin,
  updateItemStatusAdmin,
  addCategory,
  deleteCategory,
  createReport,
  getDisputes,
  updateDisputeStatus
};

