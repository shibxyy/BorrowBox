const { queryOne, queryAll, execute } = require('../config/db');

// List items with multi-criteria search and filters
const getAllItems = async (req, res) => {
  try {
    const { search, category, location, condition, availableOnly, sort } = req.query;

    let sql = `
      SELECT i.*, 
             c.name as category_name, c.icon as category_icon,
             u.name as owner_name, u.avatar as owner_avatar, u.trust_score as owner_trust_score, u.is_verified as owner_verified
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN users u ON i.owner_id = u.id
      WHERE i.status = 'active'
    `;
    const params = [];

    if (search) {
      sql += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.location LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category) {
      sql += ` AND (c.id = ? OR LOWER(c.name) = LOWER(?))`;
      params.push(category, category);
    }

    if (location) {
      sql += ` AND LOWER(i.location) LIKE LOWER(?)`;
      params.push(`%${location.trim()}%`);
    }

    if (condition) {
      sql += ` AND i.condition = ?`;
      params.push(condition);
    }

    if (availableOnly === 'true' || availableOnly === '1') {
      sql += ` AND i.is_available = 1`;
    }

    // Sorting
    if (sort === 'deposit_low') {
      sql += ` ORDER BY i.security_deposit ASC`;
    } else if (sort === 'deposit_high') {
      sql += ` ORDER BY i.security_deposit DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY u.trust_score DESC`;
    } else {
      sql += ` ORDER BY i.created_at DESC`;
    }

    const items = await queryAll(sql, params);
    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Get all items error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve items.' });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await queryOne(
      `SELECT i.*, 
              c.name as category_name, c.icon as category_icon,
              u.id as owner_id, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
              u.avatar as owner_avatar, u.trust_score as owner_trust_score, u.is_verified as owner_verified,
              u.location as owner_location, u.created_at as owner_member_since
       FROM items i
       JOIN categories c ON i.category_id = c.id
       JOIN users u ON i.owner_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Get reviews for this item
    const reviews = await queryAll(
      `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.item_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    // Active requests count
    const activeRequests = await queryOne(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE item_id = ? AND status IN ('Requested', 'Approved', 'Active')",
      [id]
    );

    return res.json({
      success: true,
      item: {
        ...item,
        reviews,
        activeRequestsCount: activeRequests?.count || 0
      }
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve item details.' });
  }
};

// Create new item listing
const createItem = async (req, res) => {
  try {
    const {
      title,
      category_id,
      description,
      condition,
      location,
      security_deposit,
      max_duration_days,
      image_url
    } = req.body;

    if (!title || !category_id || !description || !condition || !location) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Default image if not provided
    const defaultImages = {
      1: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', // Electronics
      2: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&q=80', // Tools
      3: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', // Books
      4: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80', // Instruments
      5: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', // Camping
      6: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80', // Sports
    };

    const finalImage = image_url || defaultImages[category_id] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';

    const result = await execute(
      `INSERT INTO items (
        owner_id, category_id, title, description, condition,
        location, security_deposit, max_duration_days, image_url, is_available, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')`,
      [
        req.user.id,
        category_id,
        title.trim(),
        description.trim(),
        condition,
        location.trim(),
        parseFloat(security_deposit) || 0,
        parseInt(max_duration_days) || 7,
        finalImage
      ]
    );

    const newItem = await queryOne('SELECT * FROM items WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'Item listed successfully on BorrowBox!',
      item: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create item listing.' });
  }
};

// Update an item listing
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await queryOne('SELECT * FROM items WHERE id = ?', [id]);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Only owner or admin can update
    if (item.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this item.' });
    }

    const {
      title,
      category_id,
      description,
      condition,
      location,
      security_deposit,
      max_duration_days,
      image_url,
      is_available
    } = req.body;

    await execute(
      `UPDATE items
       SET title = COALESCE(?, title),
           category_id = COALESCE(?, category_id),
           description = COALESCE(?, description),
           condition = COALESCE(?, condition),
           location = COALESCE(?, location),
           security_deposit = COALESCE(?, security_deposit),
           max_duration_days = COALESCE(?, max_duration_days),
           image_url = COALESCE(?, image_url),
           is_available = COALESCE(?, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        category_id,
        description,
        condition,
        location,
        security_deposit !== undefined ? parseFloat(security_deposit) : null,
        max_duration_days !== undefined ? parseInt(max_duration_days) : null,
        image_url,
        is_available !== undefined ? (is_available ? 1 : 0) : null,
        id
      ]
    );

    const updatedItem = await queryOne('SELECT * FROM items WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Item updated successfully.', item: updatedItem });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update item.' });
  }
};

// Delete an item listing
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await queryOne('SELECT * FROM items WHERE id = ?', [id]);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this item.' });
    }

    // Check if currently active loan
    const activeLoan = await queryOne(
      "SELECT id FROM borrow_requests WHERE item_id = ? AND status = 'Active'",
      [id]
    );
    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item with an active ongoing borrowing session.'
      });
    }

    await execute('DELETE FROM items WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Item listing removed successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
};

// Get current user's listings
const getMyListings = async (req, res) => {
  try {
    const items = await queryAll(
      `SELECT i.*, c.name as category_name,
              (SELECT COUNT(*) FROM borrow_requests br WHERE br.item_id = i.id AND br.status = 'Requested') as pending_requests_count,
              (SELECT COUNT(*) FROM borrow_requests br WHERE br.item_id = i.id AND br.status = 'Active') as active_borrow_count
       FROM items i
       JOIN categories c ON i.category_id = c.id
       WHERE i.owner_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, items });
  } catch (error) {
    console.error('Get my listings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your listings.' });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await queryAll(`
      SELECT c.*, COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id AND i.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyListings,
  getCategories
};

