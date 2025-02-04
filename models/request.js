const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Mentee's userId
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Mentor's userId
  slot: { type: String, required: true }, // New field for slot information (e.g., "Home Tuition - 3:00 P.M - 5:00 P.M")
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Request = mongoose.model('Request', RequestSchema);
module.exports = Request;
