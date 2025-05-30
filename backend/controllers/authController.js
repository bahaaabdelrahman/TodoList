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
    // 1. Fetch basic user details
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let activeOrganizationDetails = null;
    let currentUserRoleInActiveOrg = req.user.activeOrgRole; // Role from token

    // 2. Check if there's an active organization context from the token
    if (req.user.activeOrgId) {
      // 3a. Fetch active organization details
      const organization = await Organization.findById(req.user.activeOrgId).select('name description');
      if (organization) {
        activeOrganizationDetails = organization;
        // Optionally, re-verify role from DB if needed, though token should be source of truth for active session role
        // const userOrgMembership = await UserOrganization.findOne({
        //   userId: user._id,
        //   organizationId: req.user.activeOrgId
        // });
        // if (userOrgMembership) {
        //   currentUserRoleInActiveOrg = userOrgMembership.role;
        // }
      } else {
        // This case means activeOrgId in token refers to a non-existent/deleted org
        // Decide how to handle: clear activeOrgId, return error, or just proceed without org details
        console.warn(`User ${user._id} has activeOrgId ${req.user.activeOrgId} in token, but organization not found.`);
        currentUserRoleInActiveOrg = null; // Clear role if org not found
      }
    }

    // 4. Construct response
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Include organization memberships if needed for a full profile view
      // organizationMemberships: await UserOrganization.find({ userId: user._id }).populate('organizationId', 'name'), 
      activeOrganization: activeOrganizationDetails,
      activeOrganizationRole: currentUserRoleInActiveOrg
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('GetMe Error:', error);
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
