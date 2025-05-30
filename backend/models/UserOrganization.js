const mongoose = require('mongoose');

const UserOrganizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-org pairs
UserOrganizationSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model('UserOrganization', UserOrganizationSchema);
