const express = require('express');
const router = express.Router();
const {
  createRequest,
  getBorrowerRequests,
  getOwnerRequests,
  updateRequestStatus
} = require('../controllers/requestController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, createRequest);
router.get('/borrower', authenticateToken, getBorrowerRequests);
router.get('/owner', authenticateToken, getOwnerRequests);
router.patch('/:id/status', authenticateToken, updateRequestStatus);

module.exports = router;

