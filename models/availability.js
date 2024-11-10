// models/availability.js

const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorProfile', // or 'User' if you prefer
        required: true
    },
    slots: {
        type: [String], // Array of time slots, e.g., ["Monday 9-11 AM", "Tuesday 3-5 PM"]
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);
