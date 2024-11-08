const express = require('express');
const MentorProfile = require('../models/mentorProfile');
const router = express.Router();

// @route   GET /api/mentors
// @desc    Get mentors filtered by category and subject
// @access  Public
router.get('/', async (req, res) => {
  const { category, subject } = req.query;
  
  try {
    let query = {};

    // Filter by category (educational level)
    if (category) {
      query.category = category;
    }

    // Filter by subject
    if (subject) {
      query.subjects = subject;  // Assuming 'subjects' is the field storing subjects in MentorProfile model
    }

    const mentors = await MentorProfile.find(query).populate('user', ['email', 'role']);
    res.json(mentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/mentors/:userId
// @desc    Get mentor profile by user's _id or mentor's _id
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    // First, try finding the mentor using the 'user' field (mentor with 'user' object)
    let mentor = await MentorProfile.findOne({ 'user': req.params.userId }).populate('user', ['email', 'role']);

    // If not found, try finding the mentor using mentor's own '_id' field (mentor without 'user' object)
    if (!mentor) {
      mentor = await MentorProfile.findOne({ _id: req.params.userId }).populate('user', ['email', 'role']);
    }

    if (!mentor) {
      return res.status(404).json({ msg: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
