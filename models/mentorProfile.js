const mongoose = require('mongoose');

const MentorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    location: { type: String, required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    category: { type: String, required: true },
    skills: { type: [String], required: true },
    bio: { type: String, required: true },
    linkedin: { type: String },
    availability: { type: [String] },
    profileImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', MentorProfileSchema);
