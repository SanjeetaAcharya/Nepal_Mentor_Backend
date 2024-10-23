const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/users');

// Mentee Registration
router.post('/mentee', async (req, res) => {
    const { firstName, lastName, email, password, age, institution, location } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'mentee',
            age,
            institution,
            location,
        });

        await newUser.save();
        res.status(201).json({ msg: 'Mentee registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Mentor Registration
router.post('/mentor', async (req, res) => {
    const { firstName, lastName, email, password, location, qualifications, skills, jobTitle, category, bio } = req.body;

    if (!firstName || !lastName || !email || !password || !location || !qualifications || !skills || !jobTitle || !category) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'mentor',
            location,
            qualifications,
            skills,
            jobTitle,
            category,
            bio,
        });

        await newUser.save();
        res.status(201).json({ msg: 'Mentor registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
