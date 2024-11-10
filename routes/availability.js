const express = require('express');
const router = express.Router();
const Availability = require('../models/availability'); // Import the Availability model

// POST route to create availability for a mentor
router.post('/:mentorId', async (req, res) => {
  const { mentorId } = req.params;
  const { slots } = req.body; // Expecting an array of strings (time slots only)

  // Input validation
  if (!slots || !Array.isArray(slots)) {
    return res.status(400).json({ msg: 'Please provide an array of time slots' });
  }

  try {
    // Check if availability already exists for this mentor
    let availability = await Availability.findOne({ mentor: mentorId });

    if (availability) {
      return res.status(400).json({ msg: 'Availability already exists for this mentor' });
    }

    // Create new availability entry
    availability = new Availability({ mentor: mentorId, slots });
    await availability.save();
    return res.status(201).json({ msg: 'Availability created successfully', availability });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT route to update availability for a mentor
router.put('/:mentorId', async (req, res) => {
  const { mentorId } = req.params;
  const { slots } = req.body; // Expecting an array of strings (time slots only)

  // Input validation
  if (!slots || !Array.isArray(slots)) {
    return res.status(400).json({ msg: 'Please provide an array of time slots' });
  }

  try {
    // Find existing availability for the mentor
    let availability = await Availability.findOne({ mentor: mentorId });

    if (!availability) {
      return res.status(404).json({ msg: 'Availability not found for this mentor' });
    }

    // Update existing availability
    availability.slots = slots;
    await availability.save();
    return res.status(200).json({ msg: 'Availability updated successfully', availability });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET route to retrieve availability for a specific mentor
router.get('/:mentorId', async (req, res) => {
  const { mentorId } = req.params;

  try {
    const availability = await Availability.findOne({ mentor: mentorId });
    if (!availability) {
      return res.status(404).json({ msg: 'Availability not found for this mentor' });
    }
    res.json(availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
