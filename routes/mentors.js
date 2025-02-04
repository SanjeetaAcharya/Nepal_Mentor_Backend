const express = require('express');
const MentorProfile = require('../models/mentorProfile');
const User=require('../models/users');
const router = express.Router();

router.get('/', async (req, res) => {
  console.log("Received request with query:", req.query);

  const { category, classLevel, subject, fieldOfStudy } = req.query;
  console.log("Received query parameters:", { category, classLevel, subject, fieldOfStudy });

  try {
    let query = {};

    // Ensure category is provided
    if (!category) {
      return res.status(400).json({ msg: 'Category is required.' });
    }

    // Handle Primary and Secondary categories
    if (['Primary Level', 'Secondary Level', 'Diploma'].includes(category)) {
      if (!classLevel || !subject) {
        return res.status(400).json({
          msg: 'Class Level and Subject are required for Primary, Secondary, or Diploma categories.',
        });
      }

      // Validating class level based on category
      if (category === 'Primary Level' && !['Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'].includes(classLevel)) {
        return res.status(400).json({ msg: 'Invalid class level for Primary category.' });
      }
      if (category === 'Secondary Level' && !['Class 9', 'Class 10', 'Class 11', 'Class 12',].includes(classLevel)) {
        return res.status(400).json({ msg: 'Invalid class level for Secondary category.' });
      }
      if (category === 'Diploma' && !['Diploma 1', 'Diploma 2', 'Diploma 3'].includes(classLevel)) {
        return res.status(400).json({ msg: 'Invalid class level for Diploma category.' });
      }

      // Build query for Primary/Secondary
      query.category = category;
      query.classLevel = classLevel;
      query.subjects = { $in: [subject] }; // Match mentors with the given subject
    }

    // Handle Bachelors and Masters categories
    if (['Bachelors', 'Masters'].includes(category)) {
      if (!fieldOfStudy || !classLevel || !subject) {
        return res.status(400).json({
          msg: 'Field of Study, Class Level, and Subject are required for Bachelors and Masters categories.',
        });
      }

      // Build query for Bachelors/Masters
      query.category = category;
      query.fieldOfStudy = fieldOfStudy;
      query.classLevel = classLevel;
      query.subjects = { $in: [subject] }; // Match mentors with the given subject
    }

    // Debugging: Check the query object before execution
    console.log("Constructed query object:", query);

    // Fetch mentors based on the query
    const mentors = await MentorProfile.find(query).populate('user', ['email', 'role']);

    // If no mentors are found
    if (!mentors.length) {
      return res.status(404).json({ msg: 'No mentors found matching the criteria.' });
    }

    res.json(mentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});





// @route   GET /api/mentors/:userId
// @desc    Get a specific mentor profile by userId
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    // Try finding the mentor using the 'user' field (userId)
    let mentor = await MentorProfile.findOne({ user: req.params.userId }).populate('user', [
      'email',
      'role',
    ]);

    // If not found, try finding by mentor's _id field
    if (!mentor) {
      mentor = await MentorProfile.findOne({ _id: req.params.userId }).populate('user', [
        'email',
        'role',
      ]);
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