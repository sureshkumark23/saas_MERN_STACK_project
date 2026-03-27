const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5011;

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes// Define Routes

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks')); 
app.use('/api/team', require('./routes/team'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/workspaces', require('./routes/workspaces'));


//db connection

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'SaaS Backend is running smoothly!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});