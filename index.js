const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const registerRoutes = require('./routes/register');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor');
const mentorsRoutes = require('./routes/mentors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Welcome route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Nepal Mentor API');
});

// Routes
app.use('/api/register', registerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentors', mentorsRoutes);

// Catch-all route for 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});
