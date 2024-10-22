const mongoose = require('mongoose');

// Define user schema for mentor/mentee
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['mentee', 'mentor'],
    required: true
  },
});

module.exports = mongoose.model('User', UserSchema);
