const { queryOne, queryAll, execute } = require('../config/db');

// Create a new borrow request
const createRequest = async (req, res) => {
  try {
    const { item_id, start_date, return_date, purpose } = req.body;
    const borrower_id = req.user.id;

    if (!item_id || !start_date || !return_date) {
      return res.status(400).json({ success: false, message: 'Please provide item, start date, and return date.' });
    }

    // Verify item
    const item = await queryOne('SELECT * FROM items WHERE id = ?', [item_id]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.owner_id === borrower_id) {
      return res.status(400).json({ success: false, message: 'You cannot borrow your own item.' });
    }

    if (!item.is_available) {
      return res.status(400).json({ success: false, message: 'This item is currently unavailable or already borrowed.' });
    }

    // Date validation
    const start = new Date(start_date);
    const end = new Date(return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }

    if (end < start) {
      return res.status(400).json({ success: false, message: 'Return date must be on or after the start date.' });
    }

    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (item.max_duration_days && durationDays > item.max_duration_days) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed borrowing duration for this item is ${item.max_duration_days} days. Requested: ${durationDays} days.`
      });
    }

    // Prevent duplicate pending request
    const existing = await queryOne(
      "SELECT id FROM borrow_requests WHERE item_id = ? AND borrower_id = ? AND status = 'Requested'",
      [item_id, borrower_id]
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this item.' });
    }

    const result = await execute(
      `INSERT INTO borrow_requests (
        item_id, borrower_id, owner_id, start_date, return_date, purpose, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Requested')`,
      [item_id, borrower_id, item.owner_id, start_date, return_date, purpose || '']
    );

    // Notify item owner
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'request', ?)`,
      [
        item.owner_id,
        'New Borrowing Request',
        `${req.user.name} requested to borrow "${item.title}" from ${start_date} to ${return_date}.`,
        `/dashboard/lending`
      ]
    );

    const newRequest = await queryOne('SELECT * FROM borrow_requests WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Borrowing request sent to owner for approval!',
      request: newRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit borrow request.' });
  }
};

// Get requests sent by the authenticated user (Borrower view)
const getBorrowerRequests = async (req, res) => {
  try {
    const requests = await queryAll(
      `SELECT br.*, 
              i.title as item_title, i.image_url as item_image, i.security_deposit, i.condition as item_condition,
              c.name as category_name,
              u.name as owner_name, u.phone as owner_phone, u.email as owner_email, u.avatar as owner_avatar,
              u.location as owner_location, u.trust_score as owner_trust_score,
              (SELECT COUNT(*) FROM reviews r WHERE r.request_id = br.id AND r.reviewer_id = ?) as has_reviewed
       FROM borrow_requests br
       JOIN items i ON br.item_id = i.id
       JOIN categories c ON i.category_id = c.id
       JOIN users u ON br.owner_id = u.id
       WHERE br.borrower_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.id, req.user.id]
    );

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Get borrower requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your borrowing requests.' });
  }
};

// Get requests received by the authenticated user (Owner / Lender view)
const getOwnerRequests = async (req, res) => {
  try {
    const requests = await queryAll(
      `SELECT br.*, 
              i.title as item_title, i.image_url as item_image, i.security_deposit,
              c.name as category_name,
              u.name as borrower_name, u.phone as borrower_phone, u.email as borrower_email, u.avatar as borrower_avatar,
              u.location as borrower_location, u.trust_score as borrower_trust_score, u.is_verified as borrower_verified,
              (SELECT COUNT(*) FROM reviews r WHERE r.request_id = br.id AND r.reviewer_id = ?) as has_reviewed
       FROM borrow_requests br
       JOIN items i ON br.item_id = i.id
       JOIN categories c ON i.category_id = c.id
       JOIN users u ON br.borrower_id = u.id
       WHERE br.owner_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.id, req.user.id]
    );

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Get owner requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve incoming requests.' });
  }
};

// Update request status (Approve, Reject, Active / Handover, Returned, Completed, Cancelled)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const request = await queryOne(
      `SELECT br.*, i.title as item_title, i.owner_id as item_owner_id
       FROM borrow_requests br
       JOIN items i ON br.item_id = i.id
       WHERE br.id = ?`,
      [id]
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const isOwner = request.owner_id === userId;
    const isBorrower = request.borrower_id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isBorrower && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this request.' });
    }

    // Role-specific allowed transitions
    if (status === 'Approved' || status === 'Rejected') {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the item owner can approve or reject.' });
      }
      if (request.status !== 'Requested') {
        return res.status(400).json({ success: false, message: `Cannot change status to ${status} from current status "${request.status}".` });
      }

      await execute(
        'UPDATE borrow_requests SET status = ?, owner_notes = COALESCE(?, owner_notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, notes, id]
      );

      // Notification to borrower
      const notifyMsg = status === 'Approved'
        ? `Great news! Your request for "${request.item_title}" was approved by the owner.`
        : `Your request for "${request.item_title}" was declined by the owner.`;

      await execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, '/dashboard/borrowing')`,
        [request.borrower_id, `Request ${status}`, notifyMsg, status === 'Approved' ? 'approval' : 'system']
      );
    } else if (status === 'Active') {
      // Handover confirmed
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the owner can confirm handover.' });
      }

      await execute(
        `UPDATE borrow_requests 
         SET status = 'Active', handover_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );

      // Set item availability to 0
      await execute('UPDATE items SET is_available = 0 WHERE id = ?', [request.item_id]);

      // Notification to borrower
      await execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Handover Confirmed — Item Active', ?, 'active', '/dashboard/borrowing')`,
        [
          request.borrower_id,
          `Handover of "${request.item_title}" is confirmed. Remember to return it by ${request.return_date}.`
        ]
      );
    } else if (status === 'Returned') {
      // Returned by borrower / confirmed by owner
      await execute(
        `UPDATE borrow_requests 
         SET status = 'Returned', actual_return_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );

      // Make item available again
      await execute('UPDATE items SET is_available = 1 WHERE id = ?', [request.item_id]);

      // Notify owner or borrower
      const targetUser = isOwner ? request.borrower_id : request.owner_id;
      await execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Item Returned', ?, 'return', '/dashboard/lending')`,
        [
          targetUser,
          `"${request.item_title}" has been marked as returned. Please rate your experience to build community trust!`
        ]
      );
    } else if (status === 'Completed') {
      // Completed after inspection
      await execute(
        `UPDATE borrow_requests 
         SET status = 'Completed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );

      // Make sure item is available
      await execute('UPDATE items SET is_available = 1 WHERE id = ?', [request.item_id]);

      // Notify both parties to leave ratings
      await execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Transaction Completed', ?, 'review', '/dashboard/borrowing')`,
        [
          request.borrower_id,
          `Transaction for "${request.item_title}" completed! Please leave a review for the owner.`
        ]
      );
      await execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Transaction Completed', ?, 'review', '/dashboard/lending')`,
        [
          request.owner_id,
          `Transaction for "${request.item_title}" completed! Please leave a review for the borrower.`
        ]
      );
    } else if (status === 'Cancelled') {
      if (!isBorrower && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only borrower can cancel their request.' });
      }
      if (request.status === 'Active' || request.status === 'Completed') {
        return res.status(400).json({ success: false, message: 'Cannot cancel an ongoing or completed borrow.' });
      }

      await execute(
        `UPDATE borrow_requests SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
      );

      // If it was active or approved, restore item availability
      await execute('UPDATE items SET is_available = 1 WHERE id = ?', [request.item_id]);

      await execute(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Request Cancelled', ?, 'system')`,
        [request.owner_id, `Borrow request for "${request.item_title}" was cancelled by borrower.`]
      );
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status transition.' });
    }

    const updatedRequest = await queryOne('SELECT * FROM borrow_requests WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};

module.exports = {
  createRequest,
  getBorrowerRequests,
  getOwnerRequests,
  updateRequestStatus
};

