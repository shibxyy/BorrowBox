const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Disputes can be filed by any logged in user
router.post('/disputes', authenticateToken, createReport);

// All other endpoints require Admin role
router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/verify', toggleUserVerification);
router.delete('/users/:userId', deleteUser);
router.get('/listings', getAllListingsForAdmin);
router.patch('/listings/:itemId/status', updateItemStatusAdmin);
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/status', updateDisputeStatus);

module.exports = router;

