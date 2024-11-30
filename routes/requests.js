const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/request'); // Request schema
const User = require('../models/users'); // User schema
const router = express.Router();

// POST /api/requests: Create a new request
router.post('/', async (req, res) => {
  const { mentor, userId } = req.body;

  try {
    // Validate input
    if (!mentor || !userId) {
      return res.status(400).json({ error: 'Mentor ID and User ID are required' });
    }

    // Convert to ObjectId format
    const mentorId = new mongoose.Types.ObjectId(mentor);
    const menteeId = new mongoose.Types.ObjectId(userId);

    // Check if the mentee exists
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ error: 'Mentee not found' });
    }

    // Check if the mentor exists
    const mentorUser = await User.findById(mentorId);
    if (!mentorUser) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Check for existing requests with pending or accepted status
    const existingRequest = await Request.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already exists for this mentor' });
    }

    // Create and save a new request
    const newRequest = new Request({
      mentee: menteeId,
      mentor: mentorId,
      status: 'pending', // Default status
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// GET /api/requests/mentee: Fetch all requests sent by a mentee
router.get('/mentee', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const menteeId = new mongoose.Types.ObjectId(userId);
    const requests = await Request.find({ mentee: menteeId })
      .populate('mentor', 'firstName lastName email') // Populate mentor details
      .populate('mentee', 'firstName lastName email'); // Populate mentee details

    // Filter out requests with null mentor or mentee references
    const validRequests = requests.filter(req => req.mentor && req.mentee);

    if (validRequests.length === 0) {
      return res.status(404).json({ error: 'No requests found for this mentee' });
    }

    res.status(200).json(validRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/mentor: Fetch all requests received by a mentor
router.get('/mentor', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Mentor ID (userId) is required' });
    }

    const mentorId = new mongoose.Types.ObjectId(userId);
    const requests = await Request.find({ mentor: mentorId, status: 'pending' })
      .populate('mentee', 'firstName lastName email') // Populate mentee details
      .populate('mentor', 'firstName lastName email'); // Populate mentor details

    // Filter out requests with null mentor or mentee references
    const validRequests = requests.filter(req => req.mentor && req.mentee);

    if (validRequests.length === 0) {
      return res.status(404).json({ error: 'No requests found for this mentor' });
    }

    res.status(200).json(validRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests for this mentor' });
  }
});

// PATCH /api/requests/:id: Update the status of a request
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the status value
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Ensure that the request is not already in the final status (accepted or rejected)
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed (accepted or rejected)' });
    }

    // Update the status and the timestamp
    request.status = status;
    request.updatedAt = Date.now(); // Update the timestamp

    await request.save();

    res.status(200).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// GET /api/requests/mentor/accepted: Fetch all accepted requests received by a mentor
router.get('/mentor/accepted', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Mentor ID (userId) is required' });
    }

    const mentorId = new mongoose.Types.ObjectId(userId);
    const requests = await Request.find({ mentor: mentorId, status: 'accepted' })
      .populate('mentor', 'firstName lastName email') // Populate mentor details
      .populate('mentee', 'firstName lastName email'); // Populate mentee details

    // Filter out requests with null mentor or mentee references
    const validRequests = requests.filter(req => req.mentor && req.mentee);

    if (validRequests.length === 0) {
      return res.status(404).json({ error: 'No accepted requests found' });
    }

    res.status(200).json(validRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accepted requests' });
  }
});

// DELETE /api/requests/:id: Delete a request
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Request ID' });
    }

    const deletedRequest = await Request.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ error: 'Request not found or invalid references' });
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
