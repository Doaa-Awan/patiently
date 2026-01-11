const express = require('express');
const router = express.Router();
const symptomsController = require('../controllers/symptomscontrollers');
const { authenticate, authorize } = require('../middleware/auth');

// All symptom routes require authentication
router.use(authenticate);

// POST /api/symptoms/add - Create symptom entry
// Patients can only create entries for themselves, caregivers can create for any patient
router.post('/add', symptomsController.createSymptomEntry);

// GET /api/symptoms/getsymptoms - Get symptoms for a patient
// Patients can only view their own symptoms, caregivers can view any patient's symptoms
router.get('/getsymptoms', symptomsController.getPatientSymptoms);

module.exports = router;