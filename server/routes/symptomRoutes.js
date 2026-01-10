const express = require('express');
const router = express.Router();
const symptomsController = require('../controllers/symptomscontrollers');
// const { authenticate, authorize } = require('../middleware/auth');

router.post('/add', symptomsController.createSymptomEntry);

// (ToDO later!!) Apply authentication middleware to all routes below
// router.use(authenticate);

// GET /api/users/me - Get current user's profile
// router.get('/me', userController.getCurrentUser);

module.exports = router;