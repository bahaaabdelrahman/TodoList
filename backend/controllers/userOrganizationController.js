const UserOrganization = require('../models/UserOrganization');
const User = require('../models/User');
const Organization = require('../models/Organization');

// @desc    Get all users in an organization
// @route   GET /api/organizations/:organizationId/members
// @access  Private
exports.getOrganizationMembers = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    // Verify user has access to this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this organization'
      });
    }
    
    // Get all memberships for this organization
    const memberships = await UserOrganization.find({ organizationId })
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'invitedBy', select: 'name email' });
    
    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add user to organization
// @route   POST /api/organizations/:organizationId/members
// @access  Private/Admin
exports.addMember = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { email, name, password, role } = req.body;
    
    // Check if acting user is admin of this organization
    const adminMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId,
      role: 'admin'
    });
    
    if (!adminMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add users to this organization'
      });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user && password) {
      // If user doesn't exist and password is provided, create new user
      user = await User.create({
        name,
        email,
        password
      });
    } else if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User does not exist and no password provided to create one'
      });
    }
    
    // Check if user is already a member of this organization
    const existingMembership = await UserOrganization.findOne({
      userId: user._id,
      organizationId
    });
    
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this organization'
      });
    }
    
    // Create membership
    const membership = await UserOrganization.create({
      userId: user._id,
      organizationId,
      role: role || 'member',
      invitedBy: req.user.id
    });
    
    await membership.populate([
      { path: 'userId', select: 'name email' },
      { path: 'invitedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update member role in organization
// @route   PUT /api/organizations/:organizationId/members/:userId
// @access  Private/Admin
exports.updateMemberRole = async (req, res) => {
  try {
    const { organizationId, userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }
    
    // Check if acting user is admin of this organization
    const adminMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId,
      role: 'admin'
    });
    
    if (!adminMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update member roles'
      });
    }
    
    // Find the membership to update
    const membership = await UserOrganization.findOne({
      userId,
      organizationId
    });
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found'
      });
    }
    
    // If demoting from admin, check if it's the last admin
    if (membership.role === 'admin' && role === 'member') {
      const adminCount = await UserOrganization.countDocuments({
        organizationId,
        role: 'admin'
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot demote the last admin of an organization'
        });
      }
    }
    
    // Update role
    membership.role = role;
    await membership.save();
    
    await membership.populate([
      { path: 'userId', select: 'name email' },
      { path: 'invitedBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove member from organization
// @route   DELETE /api/organizations/:organizationId/members/:userId
// @access  Private/Admin
exports.removeMember = async (req, res) => {
  try {
    const { organizationId, userId } = req.params;
    
    // Check if acting user is admin of this organization
    const adminMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId,
      role: 'admin'
    });
    
    if (!adminMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove members from this organization'
      });
    }
    
    // Find the membership to remove
    const membership = await UserOrganization.findOne({
      userId,
      organizationId
    });
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'Membership not found'
      });
    }
    
    // If removing an admin, check if it's the last admin
    if (membership.role === 'admin') {
      const adminCount = await UserOrganization.countDocuments({
        organizationId,
        role: 'admin'
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove the last admin from organization'
        });
      }
    }
    
    // Remove membership
    await membership.deleteOne();

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

// @desc    Get user's organizations
// @route   GET /api/users/organizations
// @access  Private
exports.getUserOrganizations = async (req, res) => {
  try {
    // Get all memberships for this user
    const memberships = await UserOrganization.find({ userId: req.user.id })
      .populate('organizationId');
    
    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Set active organization
// @route   POST /api/users/organizations/active
// @access  Private
exports.setActiveOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;
    
    // Verify user is a member of this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not a member of this organization'
      });
    }
    
    // Generate new JWT with active organization context
    const token = req.user.getSignedJwtToken(organizationId, membership.role);

    res.status(200).json({
      success: true,
      data: {
        organizationId,
        role: membership.role,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
