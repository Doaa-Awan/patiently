const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  symptom: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true,
    default: 'Other'
  },
  
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  startTime: {
    type: Date,
    default: Date.now
  },
  
  notes: String
  
}, {
  timestamps: true
});

symptomSchema.index({ patientId: 1, createdAt: -1 });
symptomSchema.index({ name: 1 });

module.exports = mongoose.model('Symptom', symptomSchema);