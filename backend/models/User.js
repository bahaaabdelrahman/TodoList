const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  // Only run this if password was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Virtual for organizationMemberships
UserSchema.virtual('organizationMemberships', {
  ref: 'UserOrganization',
  localField: '_id',
  foreignField: 'userId',
  justOne: false
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(activeOrgId = null, activeOrgRole = null) {
  // Base token payload
  const payload = { 
    id: this._id
  };
  
  // If active organization is provided, include it in the token
  if (activeOrgId) {
    payload.activeOrgId = activeOrgId;
    if (activeOrgRole) {
      payload.activeOrgRole = activeOrgRole;
    }
  }
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
