const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for members
OrganizationSchema.virtual('members', {
  ref: 'UserOrganization',
  localField: '_id',
  foreignField: 'organizationId',
  justOne: false
});

module.exports = mongoose.model('Organization', OrganizationSchema);
