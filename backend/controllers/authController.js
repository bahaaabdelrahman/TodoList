const User = require('../models/User');
const Organization = require('../models/Organization');
const UserOrganization = require('../models/UserOrganization');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, organizationName, organizationDescription } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // 1. Create user
    const newUser = await User.create({
      name,
      email,
      password
      // organizationId and role are removed as per new model structure
    });

    // 2. Create or find organization
    let organization = await Organization.findOne({ name: organizationName });
    
    if (!organization) {
      organization = await Organization.create({
        name: organizationName,
        description: organizationDescription || '',
        createdBy: newUser._id // Use newUser._id here
      });
    }

    // 3. Create UserOrganization link
    const userOrgRole = 'admin'; // First user in a new org is admin
    await UserOrganization.create({
        userId: newUser._id,
        organizationId: organization._id,
        role: userOrgRole,
        invitedBy: newUser._id // User is self-creating/joining this first org
    });

    // 4. Send token response with active organization context
    sendTokenResponse(newUser, 201, res, organization._id, userOrgRole);
  } catch (error) {
    console.error('Registration Error:', error); // For better debugging
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'organizationId',
      select: 'name description'
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, activeOrgId, activeOrgRole) => {
  // Create token with active organization context
  const token = user.getSignedJwtToken(activeOrgId, activeOrgRole);

  // const options = { // Options for setting a cookie, not used here as token is in JSON response
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true
  // };
  // if (process.env.NODE_ENV === 'production') {
  //   options.secure = true;
  // }

  res.status(statusCode)
    // .cookie('token', token, options) // Example if sending token as a cookie
    .json({
      success: true,
      token
    });
};
