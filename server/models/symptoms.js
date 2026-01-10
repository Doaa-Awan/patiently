const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  location: {
    type: String,
    trim: true
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  endedAt: {
    type: Date
  },

  // How long it lasted (in minutes)
  duration: Number || null, // Make this optional?
  
  // Notes
  notes: {
    type: String,
    maxlength: 200
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'resolved', 'worsening', 'improving'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Auto-create createdAt and updatedAt
  timestamps: true
});

symptomSchema.index({ patientId: 1, createdAt: -1 });
symptomSchema.index({ name: 1 });

module.exports = mongoose.model('Symptom', symptomSchema);