const express = require('express');
const router = express.Router();
const { addReview, getUserReviews } = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, addReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;

