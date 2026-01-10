const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontrollers');
// const { authenticate, authorize } = require('../middleware/auth');

// POST /api/users/register - Register new user
router.post('/register', userController.createUser); // Uses createUser controller

// (ToDO later!!) Apply authentication middleware to all routes below
// router.use(authenticate);

// GET /api/users/me - Get current user's profile
// router.get('/me', userController.getCurrentUser);

module.exports = router;