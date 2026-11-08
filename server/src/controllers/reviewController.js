const { queryOne, queryAll, execute } = require('../config/db');

// Add a review for a completed transaction
const addReview = async (req, res) => {
  try {
    const { request_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    if (!request_id || !rating) {
      return res.status(400).json({ success: false, message: 'Request ID and rating (1-5) are required.' });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Check request
    const request = await queryOne('SELECT * FROM borrow_requests WHERE id = ?', [request_id]);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Borrowing transaction not found.' });
    }

    if (request.status !== 'Returned' && request.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the item is Returned or Completed.'
      });
    }

    const isBorrower = request.borrower_id === reviewer_id;
    const isOwner = request.owner_id === reviewer_id;

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ success: false, message: 'You are not a participant in this transaction.' });
    }

    // Check for existing review by this user on this request
    const existing = await queryOne(
      'SELECT id FROM reviews WHERE request_id = ? AND reviewer_id = ?',
      [request_id, reviewer_id]
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this transaction.' });
    }

    const reviewee_id = isBorrower ? request.owner_id : request.borrower_id;
    const review_type = isBorrower ? 'borrower_to_owner' : 'owner_to_borrower';

    await execute(
      `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, item_id, rating, comment, review_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [request_id, reviewer_id, reviewee_id, request.item_id, numRating, comment || '', review_type]
    );

    // Recalculate reviewee trust score
    const reviewStats = await queryOne(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE reviewee_id = ?',
      [reviewee_id]
    );

    const completedTx = await queryOne(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE (owner_id = ? OR borrower_id = ?) AND status = 'Completed'",
      [reviewee_id, reviewee_id]
    );

    let newTrustScore = 5.0;
    if (reviewStats && reviewStats.review_count > 0) {
      // Bayesian average blend
      const avg = parseFloat(reviewStats.avg_rating);
      const count = parseInt(reviewStats.review_count);
      newTrustScore = ((5.0 * 2) + (avg * count)) / (2 + count);
    }
    newTrustScore = Math.min(5.0, Math.max(1.0, parseFloat(newTrustScore.toFixed(1))));

    await execute('UPDATE users SET trust_score = ? WHERE id = ?', [newTrustScore, reviewee_id]);

    // Notify reviewee
    await execute(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'New Review Received', ?, 'review')`,
      [
        reviewee_id,
        `${req.user.name} gave you a ${numRating}-star rating: "${comment ? comment.substring(0, 50) + '...' : 'Great exchange!'}"`
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your rating and review have been recorded.'
    });
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// Get reviews received by a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await queryAll(
      `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar, i.title as item_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN items i ON r.item_id = i.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
};

module.exports = {
  addReview,
  getUserReviews
};

