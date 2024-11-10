// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Routes
const registerRoutes = require('./routes/register');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor');
const mentorsRoutes = require('./routes/mentors');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin'); // Make sure this is exported correctly from the 'admin.js' file
const availabilityRoutes = require('./routes/availability');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes); // Ensure adminRoutes is set up correctly
app.use('/api/availability', availabilityRoutes);


// Catch-all route for 404 - keeps other routes unaffected
app.use((req, res) => {
    res.status(404).send('Not Found');
});

module.exports = app;
