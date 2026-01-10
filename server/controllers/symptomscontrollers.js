const SymptomEntry = require('../models/symptoms');
const mongoose = require('mongoose');
const User = require('../models/users');

exports.createSymptomEntry = async (req, res) => {
  try {
    const { patient, symptom, severity, startTime, notes, category } = req.body;
    // const recordedBy = req.user.id;

    // Basic validation
    if (!patient || !symptom || !severity || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Patient, symptom, severity, and start time are required'
      });
    }

    // Validate patient ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format. Patient ID must be a valid MongoDB ObjectId.',
        error: `Received: ${patient}`
      });
    }

    // Check if patient exists
    const patientExists = await User.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please ensure the patient exists in the database.',
        error: `Patient with ID ${patient} does not exist`
      });
    }

    const symptomEntry = await SymptomEntry.create({
      patient, 
      symptom,
      category: category || 'Other',
      severity,
      startTime: new Date(startTime),
      notes
    });

    // Populate patient and recorder info
    const populatedEntry = await SymptomEntry.findById(symptomEntry._id)
      .populate('patient', 'name email role')
      // .populate('recordedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Symptom entry created',
      data: populatedEntry
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating symptom entry',
      error: error.message
    });
  }
};

// Get symptoms for a patient
exports.getPatientSymptoms = async (req, res) => {
  try {
    const { patientId } = req.query;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const symptoms = await SymptomEntry.find({ patient: patientId })
      .populate('patient', 'name email role')
      .sort({ startTime: -1 });
    
    res.json({
      success: true,
      data: symptoms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get symptom trends
exports.getSymptomTrends = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await SymptomEntry.aggregate([
      {
        $match: {
          patient: mongoose.Types.ObjectId(patientId),
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            symptom: '$symptom',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
          },
          avgSeverity: { $avg: '$severity' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.symptom',
          dailyData: {
            $push: {
              date: '$_id.date',
              avgSeverity: { $round: ['$avgSeverity', 1] },
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trends',
      error: error.message
    });
  }
};

// Helper functions
function getSeverityDescription(severity) {
  if (severity <= 3) return 'mild';
  if (severity <= 6) return 'moderate';
  if (severity <= 8) return 'severe';
  return 'very severe';
}

async function calculateSymptomStats(patientId, startDate, endDate) {
  const matchStage = { patient: mongoose.Types.ObjectId(patientId) };
  if (startDate || endDate) {
    matchStage.startTime = {};
    if (startDate) matchStage.startTime.$gte = new Date(startDate);
    if (endDate) matchStage.startTime.$lte = new Date(endDate);
  }

  const stats = await SymptomEntry.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$symptom',
        avgSeverity: { $avg: '$severity' },
        maxSeverity: { $max: '$severity' },
        count: { $sum: 1 },
        lastOccurrence: { $max: '$startTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
}

module.exports = exports;