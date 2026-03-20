const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'], // Different access levels within a tenant
    default: 'member'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant', // We will create the Tenant model next!
    required: false // Set to false initially so we can create the very first user
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

module.exports = mongoose.model('User', userSchema);