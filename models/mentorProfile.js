const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const mentorProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true 
    },
    classLevel: { type: String, required: true },
    subjects: [{ type: String, required: true }],
});

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
