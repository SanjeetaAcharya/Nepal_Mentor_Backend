const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/users');
const MenteeProfile = require('../models/menteeProfile');
const nodemailer = require('nodemailer');

// transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false,
    auth: {
        user: 'nepalmentors1@gmail.com', 
        pass: 'cydhqbwotkocyuyz' 
    }
});

// Function to send email after registration
function sendRegistrationEmail(userEmail, firstName) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Registration Successful',
        text: `Hello ${firstName},\n\nYou have successfully registered. Now you can log in using your credentials.\n\nThanks,\nNepal Mentors Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Mentee Registration
router.post('/mentee', async (req, res) => {
    const { firstName, lastName, email, password, age, institution, location } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !age || !institution || !location) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'mentee', // Role is 'mentee'
            age,
            institution,
            location,
        });

        // Save the new user to the database
        await newUser.save();

        // Create Mentee Profile
        const menteeProfile = new MenteeProfile({
            user: newUser._id,  // Reference to the User model
            firstName,
            lastName,
            email,
            age,
            institution,
            location,
        });

        // Save the mentee profile to the database
        await menteeProfile.save();

        // Send registration email
        sendRegistrationEmail(email, firstName);

        // Respond with success
        res.status(201).json({ msg: 'Mentee registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;