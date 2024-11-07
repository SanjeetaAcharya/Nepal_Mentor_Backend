const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
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
        enum: ['mentor', 'mentee'],
        required: true
    },
    location: {
        type: String,
        default: null
    },
    qualifications: {
        type: String,
        default: null
    },
    skills: {
        type: String,
        default: null
    },
    jobTitle: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    age: {
        type: Number,
        default: null
    },
    institution: {
        type: String,
        default: null
    },
    classLevel: { 
        type: String 
    },  // Added classLevel field
    subjects: [{ type: String }], 
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
