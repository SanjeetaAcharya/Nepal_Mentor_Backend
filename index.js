const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const registerRoutes = require('./routes/register'); // Import your register routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Port to run the server on

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// MongoDB connection
mongoose.connect(process.env.MONGO_URI) // Removed deprecated options
    .then(() => {
        console.log('MongoDB connected...');
        // Start the server only after a successful DB connection
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
app.use('/api/register', registerRoutes); // Register your routes

// Catch-all route for 404
app.get('*', (req, res) => {
    res.status(404).send('Not Found');
});
