const express = require('express');
const router = express.Router();
const MenteeProfile = require('../models/menteeProfile');
const User = require('../models/users');

// Route to fetch mentee profile by userId
router.get('/:userId', async (req, res) => {
    try {
        // Find the user by userId
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the mentee profile based on the user's userId
        const mentee = await MenteeProfile.findOne({ user: req.params.userId });

        if (!mentee) {
            return res.status(404).json({ message: 'Mentee profile not found' });
        }

        // Return the mentee profile
        res.json(mentee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching mentee profile' });
    }
});

module.exports = router;
