const express = require('express');
const router = express.Router();


// Import models
const Review = require('../models/review'); // Review model
const User = require('../models/users'); // User model
const mongoose = require('mongoose');



router.get('/:userId', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const userId = req.params.userId;

    // Log the mentor ID to ensure it's correct
    console.log('Mentor ID:', userId);

    // Fetch reviews for the mentor
    const reviews = await Review.find({ mentorId: new mongoose.Types.ObjectId(userId) }) // Ensure ObjectId is used
      .populate('userId', 'firstName lastName') // Populate user details from User model
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log('Reviews:', reviews); // Log the reviews to check if they are correctly retrieved

    // Get total review count for pagination
    const total = await Review.countDocuments({ mentorId: new mongoose.Types.ObjectId(userId) });

    // If no reviews, set average rating to 0
    if (reviews.length === 0) {
      return res.status(200).json({
        reviews,
        averageRating: 0.00,
        totalPages: 1,
        currentPage: 1,
      });
    }

    // Calculate the average rating for the mentor
    const averageRatingResult = await Review.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(userId) } }, // Ensure ObjectId matching
      { $project: { rating: { $toDouble: "$rating" } } }, // Convert rating to Double
      { $group: { _id: null, averageRating: { $avg: "$rating" } } } // Calculate average rating
    ]);

    // Log the aggregation result for debugging
    console.log('Average Rating Result:', averageRatingResult);

    // If there are no reviews, set average rating to 0
    const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].averageRating : 0;

    // Return response including reviews and average rating
    res.status(200).json({
      reviews,
      averageRating: averageRating.toFixed(2), // Round to two decimal places
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error(err); // Log error for better debugging
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});


// POST new review
router.post('/', async (req, res) => {
  const { mentorId, userId, review, rating } = req.body;

  // Validate required fields
  if (!mentorId || !userId || !rating) {
      return res.status(400).json({ error: 'Mentor ID, User ID, and rating are required.' });
  }

  // Validate rating range
  if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5.' });
  }

  try {
      // Verify if the mentor exists
      const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
      if (!mentor) {
          return res.status(404).json({ error: 'Mentor not found.' });
      }

      // Verify if the user exists
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      // Create and save the new review
      const newReview = new Review({ mentorId, userId, review, rating });
      await newReview.save();

      res.status(201).json(newReview);
  } catch (err) {
      res.status(500).json({ error: 'Failed to submit review.' });
  }
});


// Edit an existing review
router.put('/:reviewId', async (req, res) => {
    const { review, rating } = req.body;

    try {
        // Update the review
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { review, rating },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }
        
        // After review update, re-calculate the mentor's average rating
    const averageRatingResult = await Review.aggregate([
      { $match: { mentorId: updatedReview.mentorId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ]);

    const averageRating = averageRatingResult.length
        ? averageRatingResult[0].averageRating
        : 0;

        res.status(200).json(updatedReview);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update review.' });
    }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
    try {
        // Delete the review
        const deletedReview = await Review.findByIdAndDelete(req.params.reviewId);

        if (!deletedReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete review.' });
    }
});


module.exports = router;
