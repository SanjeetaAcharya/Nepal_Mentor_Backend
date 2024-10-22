const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/users');

// @route   POST api/register
// @desc    Register user
// @access  Public
router.post('/', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        user = new User({ email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
