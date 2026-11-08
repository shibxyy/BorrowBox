const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getMe, updateProfile, getUserPublicProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.get('/user/:id', getUserPublicProfile);

module.exports = router;

