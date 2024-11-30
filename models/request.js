const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Mentee's userId
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Mentor's userId
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Corrected line: Use RequestSchema instead of requestSchema
const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;