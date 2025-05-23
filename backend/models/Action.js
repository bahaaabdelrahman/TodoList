const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['note', 'status-change', 'assignment', 'priority-change', 'due-date-change', 'other'],
    default: 'note'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster querying
ActionSchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model('Action', ActionSchema);
