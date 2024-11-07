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

// @route   GET /api/mentors/:id
// @desc    Get Mentor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const mentor = await MentorProfile.findOne({ user: req.params.id }).populate('user', ['email', 'role']);
    if (!mentor) {
      return res.status(404).json({ msg: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mentor not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
