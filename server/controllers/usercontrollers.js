const User = require('../models/users');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

exports.getAllUsers = async (req, res) => {
  try {
    // 1. Get query parameters
    const { role, page = 1, limit = 10 } = req.query;
    
    // 2. Build query
    const query = {};
    if (role) query.role = role;
    
    // 3. Execute database operation
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password'); // Don't send password
    
    const total = await User.countDocuments(query);
    
    // 4. Format response
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users
    });
    
  } catch (error) {
    // 5. Handle errors
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('patientInfo.emergencyContact');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    // Validation
    if (!email || !password || !role || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, role, and name are required'
      });
    }

    if (!['patient', 'caregiver'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "patient" or "caregiver"'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user based on role
    const userData = {
      email,
      password: hashedPassword,
      role,
      name
    };
    
    if (role === 'patient') {
      userData.patientInfo = {
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
        conditions: req.body.conditions || [],
        medications: req.body.medications || [],
        emergencyContact: req.body.emergencyContact || undefined
      };
    } else if (role === 'caregiver') {
      userData.caregiverInfo = {
        qualifications: req.body.qualifications || []
      };
    }
    
    const user = await User.create(userData);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
      token
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current authenticated user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user based on role
    const userData = {
      email,
      password,
      role,
      name
    };
    
    if (role === 'patient') {
      userData.patientInfo = {
        conditions: req.body.conditions || [],
        medications: req.body.medications || []
      };
    } else if (role === 'caregiver') {
      userData.caregiverInfo = {
        qualifications: req.body.qualifications || []
      };
    }
    
    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      conditions = [], 
      medications = [], 
      emergencyContact,
      email,
      phone,
      address
    } = req.body;
    
    // Get caregiver ID from authenticated user
    const caregiverId = req.user.id;
    
    // 1. Validate caregiver
    const caregiver = await User.findById(caregiverId);
    if (!caregiver || caregiver.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Only caregivers can create patients'
      });
    }
    
    // 2. Check if patient email already exists
    if (email) {
      const existingPatient = await User.findOne({ email: email.toLowerCase() });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this email already exists'
        });
      }
    }
    
    const patientEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@caregiver.com`;
    
    const patientData = {
      email: patientEmail,
      password: 'Temporary123!',
      name: `${firstName} ${lastName}`,
      role: 'patient',
      phone: phone || '',
      address: address || '',
      patientInfo: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        conditions,
        medications,
        emergencyContact: emergencyContact || {}
      }
    };
    
    const patient = await User.create(patientData);
    
    if (!caregiver.assignedPatients.includes(patient._id)) {
      caregiver.assignedPatients.push(patient._id);
      await caregiver.save();
    }
    
    if (!patient.assignedCaregivers.includes(caregiver._id)) {
      patient.assignedCaregivers.push(caregiver._id);
      await patient.save();
    }
    
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Patient created and assigned successfully',
      data: {
        patient: patientResponse,
        assignedTo: {
          caregiverId: caregiver._id,
          caregiverName: caregiver.name
        }
      }
    });
    
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
};