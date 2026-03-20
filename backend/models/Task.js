const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  
  // NEW: Priority Field
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{
    text: { type: String, required: true },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Task', taskSchema);