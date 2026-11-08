const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyListings,
  getCategories
} = require('../controllers/itemController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', getAllItems);
router.get('/categories', getCategories);
router.get('/my/listings', authenticateToken, getMyListings);
router.get('/:id', getItemById);
router.post('/', authenticateToken, createItem);
router.put('/:id', authenticateToken, updateItem);
router.delete('/:id', authenticateToken, deleteItem);

module.exports = router;

