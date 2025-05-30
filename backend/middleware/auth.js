const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserOrganization = require('../models/UserOrganization');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user in req object
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Add active organization context from token if present
    if (decoded.activeOrgId) {
      req.user.activeOrgId = decoded.activeOrgId;
      req.user.activeOrgRole = decoded.activeOrgRole || 'member';
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles within the active organization
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    // Check if there's an active organization in the token
    if (!req.user.activeOrgId || !req.user.activeOrgRole) {
      return res.status(403).json({
        success: false,
        error: 'No active organization selected'
      });
    }
    
    // Check if the role is authorized
    if (!roles.includes(req.user.activeOrgRole)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.activeOrgRole} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Check if user belongs to the specified organization
exports.checkOrganizationAccess = async (req, res, next) => {
  // Get organization ID from params, body, or query
  const orgId = req.params.organizationId || req.params.id || req.body.organizationId || req.query.organizationId;
  
  if (!orgId) {
    // If no specific organization is being accessed, continue
    return next();
  }
  
  try {
    // Check if user is a member of this organization
    const membership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: orgId
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access resources from this organization'
      });
    }
    
    // Add membership info to the request
    req.membership = membership;
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error checking organization access'
    });
  }
};
