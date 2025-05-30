const Organization = require('../models/Organization');
const User = require('../models/User');
const UserOrganization = require('../models/UserOrganization');

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
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
      description: description || '',
      createdBy: req.user.id
    });
    
    // Add the creator as an admin of the organization
    await UserOrganization.create({
      userId: req.user.id,
      organizationId: organization._id,
      role: 'admin'
    });
    
    // Generate JWT with active organization context
    const token = req.user.getSignedJwtToken(organization._id, 'admin');

    res.status(201).json({
      success: true,
      data: {
        organization,
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

// @desc    Get all organizations for the current user
// @route   GET /api/organizations
// @access  Private
exports.getOrganizations = async (req, res) => {
  try {
    // Get all organizations user is a member of
    const memberships = await UserOrganization.find({ userId: req.user.id })
      .populate('organizationId');
    
    // Extract organizations from memberships
    const organizations = memberships.map(membership => {
      const org = membership.organizationId.toObject();
      org.userRole = membership.role;
      return org;
    });
    
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
    
    // Check if user is a member of this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: organization._id
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this organization'
      });
    }
    
    // Add user's role to the response
    const orgData = organization.toObject();
    orgData.userRole = membership.role;

    res.status(200).json({
      success: true,
      data: orgData
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
    
    // Check if user is an admin of this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: organization._id,
      role: 'admin'
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this organization'
      });
    }
    
    organization.name = name || organization.name;
    organization.description = description || organization.description;
    
    await organization.save();
    
    // Add user's role to the response
    const orgData = organization.toObject();
    orgData.userRole = 'admin';

    res.status(200).json({
      success: true,
      data: orgData
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
    
    // Check if user is an admin of this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: organization._id,
      role: 'admin'
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this organization'
      });
    }
    
    // Check if there are other users in the organization
    const membersCount = await UserOrganization.countDocuments({ organizationId: organization._id });
    
    if (membersCount > 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete organization with members. Remove all members first.'
      });
    }
    
    // Delete the organization membership for this user
    await UserOrganization.deleteOne({ userId: req.user.id, organizationId: organization._id });
    
    // Delete the organization itself
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

// Functionality moved to userOrganizationController.js
// This method is deprecated
exports.addUserToOrganization = async (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'This endpoint is deprecated. Please use /api/organizations/:organizationId/members instead.'
  });
};

// Functionality moved to userOrganizationController.js
// This method is deprecated
exports.removeUserFromOrganization = async (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'This endpoint is deprecated. Please use /api/organizations/:organizationId/members/:userId instead.'
  });
};
