// models/availability.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AvailabilitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // or 'User'
        required: true
    },
    slots: {
        type: [String], // Array of time slots, e.g., ["Monday 9-11 AM", "Tuesday 3-5 PM"]
        default: []
    }
}, { timestamps: true });




module.exports = mongoose.model('Availability', AvailabilitySchema);
