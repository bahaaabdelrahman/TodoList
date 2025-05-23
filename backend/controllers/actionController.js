const Action = require('../models/Action');
const Task = require('../models/Task');

// @desc    Create new action for a task
// @route   POST /api/tasks/:taskId/actions
// @access  Private
exports.createAction = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verify task exists and user has access to it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user has access to this task (must be in same organization)
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add actions to this task'
      });
    }
    
    // Set action properties
    req.body.taskId = taskId;
    req.body.userId = req.user.id;
    
    // If action is marking task as complete, set completedAt
    if (req.body.type === 'status-change' && 
        req.body.metadata && 
        req.body.metadata.newStatus === 'completed') {
      req.body.completedAt = Date.now();
      
      // Also update the task status
      await Task.findByIdAndUpdate(taskId, {
        status: 'completed',
        completedAt: Date.now()
      });
    }
    
    // Create action
    const action = await Action.create(req.body);
    
    // Populate action with user data
    await action.populate({ path: 'userId', select: 'name email' });

    res.status(201).json({
      success: true,
      data: action
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all actions for a task
// @route   GET /api/tasks/:taskId/actions
// @access  Private
exports.getActions = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verify task exists and user has access to it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user has access to this task (must be in same organization)
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view actions for this task'
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Get actions for the task
    const actions = await Action.find({ taskId })
      .populate({ path: 'userId', select: 'name email' })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Action.countDocuments({ taskId });
    
    res.status(200).json({
      success: true,
      count: actions.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: actions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single action
// @route   GET /api/actions/:id
// @access  Private
exports.getAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id)
      .populate({ path: 'userId', select: 'name email' });
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found'
      });
    }
    
    // Get the associated task to check organization
    const task = await Task.findById(action.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Associated task not found'
      });
    }
    
    // Check if user has access to this task (must be in same organization)
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this action'
      });
    }

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update action
// @route   PUT /api/actions/:id
// @access  Private
exports.updateAction = async (req, res) => {
  try {
    let action = await Action.findById(req.params.id);
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found'
      });
    }
    
    // Get the associated task to check organization
    const task = await Task.findById(action.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Associated task not found'
      });
    }
    
    // Check if user has access to this task (must be in same organization)
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this action'
      });
    }
    
    // Only creator or admin can update action
    if (action.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this action'
      });
    }
    
    // Do not allow changing taskId or userId
    if (req.body.taskId) delete req.body.taskId;
    if (req.body.userId) delete req.body.userId;
    
    // Update action
    action = await Action.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({ path: 'userId', select: 'name email' });

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete action
// @route   DELETE /api/actions/:id
// @access  Private
exports.deleteAction = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Action not found'
      });
    }
    
    // Get the associated task to check organization
    const task = await Task.findById(action.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Associated task not found'
      });
    }
    
    // Check if user has access to this task (must be in same organization)
    if (task.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this action'
      });
    }
    
    // Only creator or admin can delete action
    if (action.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this action'
      });
    }
    
    await action.deleteOne();

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
