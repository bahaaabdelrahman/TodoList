const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Public
exports.createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if organization exists
    const existingOrg = await Organization.findOne({ name });
    
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        error: 'Organization with this name already exists'
      });
    }
    
    // Create organization
    const organization = await Organization.create({
      name,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    
    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    // If user is not admin and not in the org, deny access
    if (req.user.role !== 'admin' && req.user.organizationId.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this organization'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
exports.updateOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    let organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    // Make sure user is admin of this organization
    if (req.user.role !== 'admin' || req.user.organizationId.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this organization'
      });
    }
    
    organization.name = name || organization.name;
    organization.description = description || organization.description;
    
    await organization.save();

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    // Make sure user is admin of this organization
    if (req.user.role !== 'admin' || req.user.organizationId.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this organization'
      });
    }
    
    // Check if there are users in the organization
    const usersCount = await User.countDocuments({ organizationId: organization._id });
    
    if (usersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete organization with users. Remove all users first.'
      });
    }
    
    await organization.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add user to organization
// @route   POST /api/organizations/:id/users
// @access  Private/Admin
exports.addUserToOrganization = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    // Make sure user is admin of this organization
    if (req.user.role !== 'admin' || req.user.organizationId.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add users to this organization'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      organizationId: organization._id,
      role: role || 'member'
    });

    res.status(201).json({
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

// @desc    Remove user from organization
// @route   DELETE /api/organizations/:id/users/:userId
// @access  Private/Admin
exports.removeUserFromOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    // Make sure user is admin of this organization
    if (req.user.role !== 'admin' || req.user.organizationId.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove users from this organization'
      });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Make sure user belongs to this organization
    if (user.organizationId.toString() !== organization._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'User does not belong to this organization'
      });
    }
    
    // Don't allow removing the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({
        organizationId: organization._id,
        role: 'admin'
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove the last admin from organization'
        });
      }
    }
    
    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
