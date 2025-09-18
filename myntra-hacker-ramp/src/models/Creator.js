import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  profile_image: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  social_links: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  followers: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_drops: {
    type: Number,
    default: 0
  },
  total_sales: {
    type: Number,
    default: 0
  },
  commission_rate: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 50
  },
  created_by_admin: {
    type: String,
    required: true
  },
  last_login: {
    type: Date,
    default: null
  },
  login_attempts: {
    type: Number,
    default: 0
  },
  locked_until: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
creatorSchema.index({ username: 1 });
creatorSchema.index({ email: 1 });
creatorSchema.index({ status: 1 });
creatorSchema.index({ created_by_admin: 1 });

// Virtual for creator's drops
creatorSchema.virtual('drops', {
  ref: 'Drop',
  localField: '_id',
  foreignField: 'creator_id'
});

// Method to check if account is locked
creatorSchema.methods.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

// Method to increment login attempts
creatorSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock and it's expired, restart at 1
  if (this.locked_until && this.locked_until < Date.now()) {
    return this.updateOne({
      $unset: { locked_until: 1 },
      $set: { login_attempts: 1 }
    });
  }
  
  const updates = { $inc: { login_attempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { locked_until: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
creatorSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { login_attempts: 1, locked_until: 1 },
    $set: { last_login: new Date() }
  });
};

// Pre-save middleware to hash password
creatorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
creatorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate secure random password
creatorSchema.statics.generatePassword = function() {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export default mongoose.models.Creator || mongoose.model('Creator', creatorSchema);