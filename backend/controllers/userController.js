const User = require('../models/User');

// @desc    Get all users in an organization
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user belongs to the same organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this user'
      });
    }

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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    let user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user belongs to the same organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }
    
    // Only admin can update role
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update user role'
      });
    }
    
    // Only update fields that were actually passed
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && req.user.role === 'admin') user.role = role;
    
    await user.save();

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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user belongs to the same organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this user'
      });
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
