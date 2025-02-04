const express = require('express');
const User = require('../models/users');
const Request = require('../models/request');
const Notification = require('../models/notification');
const Review = require('../models/review');

const router = express.Router();

// Route to get all mentors
router.get('/mentors', async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' });
        res.json(mentors);
    } catch (error) {
        res.status(500).send("Error retrieving mentors");
    }
});

// Route to get all mentees
router.get('/mentees', async (req, res) => {
    try {
        const mentees = await User.find({ role: 'mentee' });
        res.json(mentees);
    } catch (error) {
        res.status(500).send("Error retrieving mentees");
    }
});

// Route to get user details by ID
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.json(user);
    } catch (error) {
        res.status(500).send("Error retrieving user");
    }
});

// Route to delete user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send("User not found");
        }

        res.send("User deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting user");
    }
});

// Route to update user by ID
router.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).send("Error updating user");
    }
});

// Route to get the count of mentors and mentees
router.get('/user-count', async (req, res) => {
    try {
        const mentorCount = await User.countDocuments({ role: 'mentor' });
        const menteeCount = await User.countDocuments({ role: 'mentee' });

        res.json({ mentorCount, menteeCount });
    } catch (error) {
        res.status(500).send("Error retrieving user counts");
    }
});

// Route to search for users
router.get('/search', async (req, res) => {
    const { query } = req.query;

    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        });

        res.json(users);
    } catch (error) {
        res.status(500).send("Error searching for users");
    }
});

// Route to get all requests
router.get('/requests', async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('mentee', 'firstName lastName email')
            .populate('mentor', 'firstName lastName email');
        res.json(requests);
    } catch (error) {
        res.status(500).send("Error retrieving requests");
    }
});

// Route to delete a request
router.delete('/requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        const deletedRequest = await Request.findByIdAndDelete(requestId);

        if (!deletedRequest) {
            return res.status(404).send("Request not found");
        }

        res.send("Request deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting request");
    }
});

// Route to get all notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).send("Error retrieving notifications");
    }
});

// Route to delete a notification by ID
router.delete('/notifications/:id', async (req, res) => {
    try {
        const notificationId = req.params.id;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).send("Notification not found");
        }

        res.send("Notification deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting notification");
    }
});

// Route to get all reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('mentor', 'firstName lastName email')
            .populate('mentee', 'firstName lastName email');
        res.json(reviews);
    } catch (error) {
        res.status(500).send("Error retrieving reviews");
    }
});

// Route to delete a review by ID
router.delete('/reviews/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;
        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).send("Review not found");
        }

        res.send("Review deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting review");
    }
});

// Route to get all unique roles
router.get('/roles', async (req, res) => {
    try {
        const roles = await User.distinct('role');
        res.json(roles);
    } catch (error) {
        res.status(500).send("Error retrieving roles");
    }
});

module.exports = router;
