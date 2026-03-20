const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String, // Useful if you want custom domains later (e.g., company.yoursaas.com)
    unique: true,
    sparse: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Tenant', tenantSchema);