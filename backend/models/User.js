const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'owner' },
  
  // THE FIX: Removed "required: true" so brand new users can register 
  // before they create their first workspace in the Onboarding step!
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  
  // ALL workspaces the user has access to
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
  
  // Password Reset Tokens
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, 
{ 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);