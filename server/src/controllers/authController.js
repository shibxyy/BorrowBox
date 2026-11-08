const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, queryAll, execute } = require('../config/db');
const { JWT_SECRET } = require('../middlewares/auth');

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, phone, password, location, bio } = req.body;

    if (!name || !email || !password || !location) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and location.' });
    }

    // Check if email already exists
    const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`;

    const result = await execute(
      `INSERT INTO users (name, email, phone, password, location, bio, avatar, role, is_verified, trust_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 0, 5.0)`,
      [name.trim(), email.trim().toLowerCase(), phone || '', hashedPassword, location.trim(), bio || '', avatar]
    );

    const token = jwt.sign({ userId: result.lastID }, JWT_SECRET, { expiresIn: '7d' });
    const user = await queryOne(
      'SELECT id, name, email, phone, location, bio, avatar, role, is_verified, trust_score, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    // Create welcome notification
    await execute(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Welcome to BorrowBox!', 'Thank you for joining our community sharing platform. Start borrowing or listing your idle items today!', 'system')`,
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const user = await queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password;
    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// 1-Click Demo Login for Viva / Evaluator
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'admin', 'owner', 'borrower'
    let user;

    if (role === 'admin') {
      user = await queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    } else if (role === 'borrower') {
      user = await queryOne("SELECT * FROM users WHERE email = 'rahul@example.com' LIMIT 1");
      if (!user) user = await queryOne("SELECT * FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 1");
    } else {
      // owner
      user = await queryOne("SELECT * FROM users WHERE email = 'priya@example.com' LIMIT 1");
      if (!user) user = await queryOne("SELECT * FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 1");
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo account not found. Please run database seed.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password;

    return res.json({
      success: true,
      message: `Logged in as Demo ${user.name} (${user.role})!`,
      token,
      user
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during demo login.' });
  }
};

// Get current user profile with extended statistics
const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Lending stats
    const itemsListed = await queryOne('SELECT COUNT(*) as count FROM items WHERE owner_id = ?', [user.id]);
    const itemsActive = await queryOne('SELECT COUNT(*) as count FROM items WHERE owner_id = ? AND is_available = 1', [user.id]);
    const loansCompleted = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE owner_id = ? AND status = 'Completed'", [user.id]);

    // Borrowing stats
    const borrowsActive = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE borrower_id = ? AND status IN ('Approved', 'Active')", [user.id]);
    const borrowsCompleted = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE borrower_id = ? AND status = 'Completed'", [user.id]);

    // Average rating from reviews
    const avgRating = await queryOne('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE reviewee_id = ?', [user.id]);

    const stats = {
      itemsListed: itemsListed?.count || 0,
      itemsActive: itemsActive?.count || 0,
      loansCompleted: loansCompleted?.count || 0,
      borrowsActive: borrowsActive?.count || 0,
      borrowsCompleted: borrowsCompleted?.count || 0,
      reviewCount: avgRating?.count || 0,
      calculatedRating: avgRating?.avg ? Number(avgRating.avg).toFixed(1) : user.trust_score
    };

    return res.json({
      success: true,
      user: {
        ...user,
        stats
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, avatar } = req.body;
    const userId = req.user.id;

    await execute(
      `UPDATE users
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           location = COALESCE(?, location),
           bio = COALESCE(?, bio),
           avatar = COALESCE(?, avatar)
       WHERE id = ?`,
      [name, phone, location, bio, avatar, userId]
    );

    const updated = await queryOne(
      'SELECT id, name, email, phone, location, bio, avatar, role, is_verified, trust_score, created_at FROM users WHERE id = ?',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

// Public profile of any user
const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await queryOne(
      'SELECT id, name, location, bio, avatar, is_verified, trust_score, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const items = await queryAll(
      `SELECT i.*, c.name as category_name
       FROM items i
       JOIN categories c ON i.category_id = c.id
       WHERE i.owner_id = ? AND i.status = 'active'`,
      [id]
    );

    const reviews = await queryAll(
      `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    const loansCompleted = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE owner_id = ? AND status = 'Completed'", [id]);
    const borrowsCompleted = await queryOne("SELECT COUNT(*) as count FROM borrow_requests WHERE borrower_id = ? AND status = 'Completed'", [id]);

    return res.json({
      success: true,
      user: {
        ...user,
        items,
        reviews,
        stats: {
          loansCompleted: loansCompleted?.count || 0,
          borrowsCompleted: borrowsCompleted?.count || 0,
          totalReviews: reviews.length
        }
      }
    });
  } catch (error) {
    console.error('Public profile error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user profile.' });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  getUserPublicProfile
};

