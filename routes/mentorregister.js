const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/users');
const MentorProfile = require('../models/mentorProfile');
const nodemailer = require('nodemailer');

// transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail SMTP server
    port: 587, // Port for TLS
    secure: false, // Use TLS
    auth: {
        user: 'nepalmentors1@gmail.com',   // email address (from .env),replace by process.env.Email_User
        pass: 'cydhqbwotkocyuyz'  // password (from .env)
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

// Mentor Registration
router.post('/mentor', async (req, res) => {
    console.log('Received Request Body:', req.body);
    const { firstName, lastName, email, password, location, qualifications, skills, jobTitle, category, bio, classLevel, subjects } = req.body;

    if (!firstName || !lastName || !email || !password || !location || !qualifications || !skills || !jobTitle || !category || !classLevel || !subjects) {
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
            classLevel,
            subjects,
        });

        await newUser.save();

        // Mentor profile with additional details
        const mentorProfile = new MentorProfile({
            user: newUser._id, // Reference to the User document
            firstName,
            lastName,
            location,
            qualifications,
            skills,
            jobTitle,
            category,
            bio,
            classLevel,
            subjects,
        });

        await mentorProfile.save();

        sendRegistrationEmail(email, firstName); // Send registration email to the mentor
        res.status(201).json({ msg: 'Mentor registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
