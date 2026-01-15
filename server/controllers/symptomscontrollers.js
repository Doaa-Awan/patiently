const SymptomEntry = require('../models/symptoms');
const mongoose = require('mongoose');
const User = require('../models/users');

exports.createSymptomEntry = async (req, res) => {
  try {
    const { patient, symptom, severity, startTime, notes, category } = req.body;
    const currentUser = req.user;
    const currentUserId = req.userId.toString();

    // Basic validation
    if (!symptom || !severity || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Symptom, severity, and start time are required'
      });
    }

    // Determine patient ID
    let patientId;
    if (patient) {
      // If patient ID is provided, validate it
      if (!mongoose.Types.ObjectId.isValid(patient)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format. Patient ID must be a valid MongoDB ObjectId.',
          error: `Received: ${patient}`
        });
      }
      patientId = patient;
    } else {
      // If no patient ID provided, use current user's ID (if they're a patient)
      if (currentUser.role !== 'patient') {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required for caregivers'
        });
      }
      patientId = currentUserId;
    }

    // Authorization: Patients can only create entries for themselves
    if (currentUser.role === 'patient' && patientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only create symptom entries for themselves'
      });
    }

    // Check if patient exists
    const patientExists = await User.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please ensure the patient exists in the database.',
        error: `Patient with ID ${patientId} does not exist`
      });
    }

    // Ensure the patient is actually a patient
    if (patientExists.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Symptom entries can only be created for patients'
      });
    }

    const symptomEntry = await SymptomEntry.create({
      patient: patientId, 
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
    const currentUser = req.user;
    const currentUserId = req.userId.toString();
    
    // Determine which patient's symptoms to fetch
    let targetPatientId;
    if (patientId) {
      // If patient ID is provided, validate it
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }
      targetPatientId = patientId;
    } else {
      // If no patient ID provided, use current user's ID (if they're a patient)
      if (currentUser.role !== 'patient') {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required for caregivers'
        });
      }
      targetPatientId = currentUserId;
    }

    // Authorization: Patients can only view their own symptoms
    if (currentUser.role === 'patient' && targetPatientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only view their own symptoms'
      });
    }

    // Verify the target is actually a patient
    const targetPatient = await User.findById(targetPatientId);
    if (!targetPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (targetPatient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Can only fetch symptoms for patients'
      });
    }

    const symptoms = await SymptomEntry.find({ patient: targetPatientId })
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

// Update a symptom entry
exports.updateSymptomEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const currentUserId = req.userId.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid symptom entry ID format'
      });
    }

    const entry = await SymptomEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Symptom entry not found'
      });
    }

    if (currentUser.role === 'patient' && entry.patient.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only update their own symptom entries'
      });
    }

    const { symptom, severity, startTime, notes, category } = req.body || {};
    const updates = {};

    if (symptom !== undefined) updates.symptom = symptom;
    if (severity !== undefined) updates.severity = severity;
    if (category !== undefined) updates.category = category;
    if (notes !== undefined) updates.notes = notes;
    if (startTime !== undefined) updates.startTime = new Date(startTime);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const updatedEntry = await SymptomEntry.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('patient', 'name email role');

    return res.json({
      success: true,
      message: 'Symptom entry updated',
      data: updatedEntry
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating symptom entry',
      error: error.message
    });
  }
};

// Delete a symptom entry
exports.deleteSymptomEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const currentUserId = req.userId.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid symptom entry ID format'
      });
    }

    const entry = await SymptomEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Symptom entry not found'
      });
    }

    if (currentUser.role === 'patient' && entry.patient.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only delete their own symptom entries'
      });
    }

    await SymptomEntry.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Symptom entry deleted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting symptom entry',
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
