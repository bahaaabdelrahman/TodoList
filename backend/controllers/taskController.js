const Task = require('../models/Task');
const User = require('../models/User');
const UserOrganization = require('../models/UserOrganization');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags, organizationId } = req.body;
    
    // Set the userId to the current authenticated user
    req.body.userId = req.user.id;
    
    // Check if organizationId is provided, otherwise use activeOrgId from token
    const taskOrgId = organizationId || req.user.activeOrgId;
    
    if (!taskOrgId) {
      return res.status(400).json({
        success: false,
        error: 'No active organization. Please specify organizationId or set an active organization.'
      });
    }
    
    req.body.organizationId = taskOrgId;
    
    // Verify user is a member of this organization
    const userMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: taskOrgId
    });
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create tasks in this organization'
      });
    }
    
    // If task is assigned to someone, verify they're in the same organization
    if (assignedTo) {
      // Check if assigned user exists
      const assignedUser = await User.findById(assignedTo);
      
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
      
      // Check if assigned user is a member of this organization
      const assignedUserMembership = await UserOrganization.findOne({
        userId: assignedTo,
        organizationId: taskOrgId
      });
      
      if (!assignedUserMembership) {
        return res.status(400).json({
          success: false,
          error: 'Cannot assign task to user from another organization'
        });
      }
    }
    
    // Create task
    const task = await Task.create(req.body);
    
    // Populate task with user data
    await task.populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all tasks for the authenticated user or organization
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // Check if organizationId is provided in query or use activeOrgId from token
    const organizationId = req.query.organizationId || req.user.activeOrgId;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'No active organization. Please specify organizationId or set an active organization.'
      });
    }
    
    // Verify user is a member of this organization
    const userMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId
    });
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access tasks in this organization'
      });
    }
    
    let query = { organizationId };
    
    // If admin and showAll query param is true, show all tasks in the organization
    // Otherwise show tasks created by or assigned to the user
    if (!(userMembership.role === 'admin' && req.query.showAll === 'true')) {
      query.$or = [
        { userId: req.user.id },
        { assignedTo: req.user.id }
      ];
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Search by title or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      if (query.$or) {
        // We already have an $or operator for filtering by user
        // Create a compound query with $and to combine both conditions
        const userFilter = query.$or;
        delete query.$or;
        
        query.$and = [
          { $or: userFilter },
          { $or: [
            { title: searchRegex },
            { description: searchRegex }
          ]}
        ];
      } else {
        query.$or = [
          { title: searchRegex },
          { description: searchRegex }
        ];
      }
    }
    
    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const tasks = await Task.find(query)
      .populate([
        { path: 'userId', select: 'name email' },
        { path: 'assignedTo', select: 'name email' }
      ])
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Task.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate([
        { path: 'userId', select: 'name email' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'actions' }
      ]);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user has access to this task's organization
    const userMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: task.organizationId
    });
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user has access to this task's organization
    const userMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: task.organizationId
    });
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }
    
    // Only creator, assigned user, or admin can update task
    if (
      task.userId.toString() !== req.user.id && 
      (task.assignedTo ? task.assignedTo.toString() !== req.user.id : true) && 
      userMembership.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }
    
    // If changing assignedTo, verify the user exists and is in the same organization
    if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
      
      // Check if assigned user is a member of this organization
      const assignedUserMembership = await UserOrganization.findOne({
        userId: req.body.assignedTo,
        organizationId: task.organizationId
      });
      
      if (!assignedUserMembership) {
        return res.status(400).json({
          success: false,
          error: 'Cannot assign task to user from another organization'
        });
      }
    }
    
    // If status is completed and wasn't before, set completedAt date
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = Date.now();
    } else if (req.body.status && req.body.status !== 'completed') {
      // If changing to a non-completed status, remove completedAt
      req.body.completedAt = null;
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user has access to this task's organization
    const userMembership = await UserOrganization.findOne({
      userId: req.user.id,
      organizationId: task.organizationId
    });
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }
    
    // Only creator or admin can delete task
    if (task.userId.toString() !== req.user.id && userMembership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }
    
    await task.deleteOne();

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
