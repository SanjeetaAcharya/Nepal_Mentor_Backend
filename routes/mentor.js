const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const MentorProfile = require('../models/mentorProfile');
const User = require('../models/users');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Rename the file to include the user ID and current timestamp
    cb(null, req.user.id + '_' + Date.now() + path.extname(file.originalname));
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
  fileFilter: fileFilter,
});

// @route   POST /api/mentor/complete
// @desc    Complete Mentor Registration
// @access  Private (Only mentors)
router.post('/complete', [auth, upload.single('profileImage')], async (req, res) => {
  const { firstName, lastName, location, jobTitle, company, category, skills, bio, linkedin, availability } = req.body;
  
  // Validate required fields
  if (!firstName || !lastName || !location || !jobTitle || !category || !skills || !bio) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  try {
    // Check if the user is a mentor
    const user = await User.findById(req.user.id);
    if (user.role !== 'mentor') {
      return res.status(400).json({ msg: 'Only mentors can complete this action' });
    }

    // Check if the mentor profile already exists
    let mentorProfile = await MentorProfile.findOne({ user: req.user.id });
    if (mentorProfile) {
      return res.status(400).json({ msg: 'Mentor profile already exists' });
    }

    // Create new mentor profile
    mentorProfile = new MentorProfile({
      user: req.user.id,
      firstName,
      lastName,
      location,
      jobTitle,
      company,
      category,
      skills: skills.split(',').map(skill => skill.trim()), // Convert comma-separated skills to array
      bio,
      linkedin,
      availability: availability ? availability.split(',').map(time => time.trim()) : [],
      profileImage: req.file ? req.file.path : '',
    });

    await mentorProfile.save();

    res.status(201).json({ msg: 'Mentor profile created successfully', mentorProfile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/mentor/profile/:id
// @desc    Get Mentor Profile by ID
// @access  Publicc
router.get('/profile/:id', async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user: req.params.id }).populate('user', ['email', 'role']);
    if (!mentorProfile) {
      return res.status(404).json({ msg: 'Mentor profile not found' });
    }
    res.json(mentorProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mentor profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/mentor/profile/:id
// @desc    Update Mentor Profile
// @access  Private (Only the mentor themselves)
router.put('/profile/:id', [auth, upload.single('profileImage')], async (req, res) => {
  const { firstName, lastName, location, jobTitle, company, category, skills, bio, linkedin, availability } = req.body;

  // Build mentor profile object
  const mentorFields = {};
  if (firstName) mentorFields.firstName = firstName;
  if (lastName) mentorFields.lastName = lastName;
  if (location) mentorFields.location = location;
  if (jobTitle) mentorFields.jobTitle = jobTitle;
  if (company) mentorFields.company = company;
  if (category) mentorFields.category = category;
  if (skills) mentorFields.skills = skills.split(',').map(skill => skill.trim());
  if (bio) mentorFields.bio = bio;
  if (linkedin) mentorFields.linkedin = linkedin;
  if (availability) mentorFields.availability = availability.split(',').map(time => time.trim());
  if (req.file) mentorFields.profileImage = req.file.path;

  try {
    // Check if the user is a mentor
    const user = await User.findById(req.user.id);
    if (user.role !== 'mentor') {
      return res.status(400).json({ msg: 'Only mentors can update their profiles' });
    }

    // Find the mentor profile
    let mentorProfile = await MentorProfile.findOne({ user: req.params.id });
    if (!mentorProfile) {
      return res.status(404).json({ msg: 'Mentor profile not found' });
    }

    // Ensure that the user updating the profile is the owner
    if (mentorProfile.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update the mentor profile
    mentorProfile = await MentorProfile.findOneAndUpdate(
      { user: req.params.id },
      { $set: mentorFields },
      { new: true }
    );

    res.json({ msg: 'Mentor profile updated successfully', mentorProfile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
