const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'owner' },
  
  // The workspace the user is CURRENTLY viewing
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // ALL workspaces the user has access to
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }] 
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);