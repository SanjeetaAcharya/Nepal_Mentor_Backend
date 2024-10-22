const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Ensure this path is correct

// @route   POST api/register
// @desc    Register user
// @access  Public
router.post('/', async (req, res) => {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create a new user
        user = new User({ email, password, role });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
