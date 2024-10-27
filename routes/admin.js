const express = require('express');
const User = require('../models/users'); 
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
        const userId = req.params.id; // Get the ID from the URL
        const user = await User.findById(userId); // Find user by ID
        
        if (!user) {
            return res.status(404).send("User not found"); // If no user is found, send a 404 error
        }

        res.json(user); // Send back the user's details
    } catch (error) {
        res.status(500).send("Error retrieving user"); // If there's an error, send a 500 status
    }
});

// Route to delete user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id; // Get the ID from the URL

        const deletedUser = await User.findByIdAndDelete(userId); // Delete the user

        if (!deletedUser) {
            return res.status(404).send("User not found"); // If no user is found, send a 404 error
        }

        res.send("User deleted successfully"); // Send back a success message
    } catch (error) {
        res.status(500).send("Error deleting user"); // If there's an error, send a 500 status
    }
});

// Route to view all info of a mentor by ID
router.get('/mentors/:id', async (req, res) => {
    try {
        const mentorId = req.params.id;
        const mentor = await User.findById(mentorId);

        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).send("Mentor not found");
        }

        res.json(mentor);
    } catch (error) {
        res.status(500).send("Error retrieving mentor");
    }
});

// Route to view all info of a mentee by ID
router.get('/mentees/:id', async (req, res) => {
    try {
        const menteeId = req.params.id;
        const mentee = await User.findById(menteeId);

        if (!mentee || mentee.role !== 'mentee') {
            return res.status(404).send("Mentee not found");
        }

        res.json(mentee);
    } catch (error) {
        res.status(500).send("Error retrieving mentee");
    }
});

// Route to update user by ID
router.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id; // Get the ID from the URL
        const updatedData = req.body; // Get the updated user data from the request body

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }); // Update the user and return the new data

        if (!updatedUser) {
            return res.status(404).send("User not found"); // If no user is found, send a 404 error
        }

        res.json(updatedUser); // Send back the updated user details
    } catch (error) {
        res.status(500).send("Error updating user"); // If there's an error, send a 500 status
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
    const { query } = req.query; // Get search query from the request

    try {
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Search by name
                { email: { $regex: query, $options: 'i' } } // Search by email
            ]
        });

        res.json(users);
    } catch (error) {
        res.status(500).send("Error searching for users");
    }
});

// Route to get all unique roles
router.get('/roles', async (req, res) => {
    try {
        const roles = await User.distinct('role'); // Get unique roles from the User collection
        res.json(roles);
    } catch (error) {
        res.status(500).send("Error retrieving roles");
    }
});

module.exports = router;
