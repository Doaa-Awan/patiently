const User = require('../models/users');

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