const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontrollers');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
// POST /api/users/register - Register new user
router.post('/register', userController.createUser);

// POST /api/users/login - Login user
router.post('/login', userController.login);

// Protected routes - require authentication
router.use(authenticate);

// GET /api/users/me - Get current user's profile
router.get('/me', userController.getCurrentUser);

// GET /api/users - Get all users (with optional role filter) - Admin/Caregiver only
router.get('/', authorize('caregiver'), userController.getAllUsers);

// GET /api/users/:id - Get user by ID - Admin/Caregiver only
router.get('/:id', authorize('caregiver'), userController.getUserById);

module.exports = router;