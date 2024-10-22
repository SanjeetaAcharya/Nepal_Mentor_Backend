const mongoose = require('mongoose');

const MentorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: 'N/A',
  },
  category: {
    type: String,
    enum: ['Primary level', 'Secondary level', 'Diploma', 'Bachelors', 'Masters'],
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
    default: 'N/A',
  },
  profileImage: {
    type: String, // Path to the uploaded image
    default: '',
  },
  availability: {
    type: [String], // e.g., ['6:00 PM - 8:00 PM', '8:00 PM - 10:00 PM']
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', MentorProfileSchema);
