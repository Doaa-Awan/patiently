const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['patient', 'caregiver'],
    default: 'patient'
  },
  name: {
    type: String,
    required: true
  },
  phone: String, // Optional
  address: String, // Optional
  
  // Patient-specific fields
  patientInfo: {
    dateOfBirth: Date,
    conditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // TODO: POssible extension for later!!
//   caregiverInfo: {
//     qualifications: [String],
//     licenseNumber: String,
//     yearsExperience: Number
//   },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);