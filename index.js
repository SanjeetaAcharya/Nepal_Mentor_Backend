const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http');
const WebSocket = require('ws');
//const { initializeSocket } = require('./socket');

// Routes
const registerRoutes = require('./routes/register');
const mentorregisterRoutes = require('./routes/mentorregister');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor');
const mentorsRoutes = require('./routes/mentors');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin'); 
const availabilityRoutes = require('./routes/availability');
const requestRoutes = require('./routes/requests');
const reviewRoutes = require('./routes/review');
const menteesRoutes = require('./routes/mentees');


// WebSocket clients map to store connected users
const clients = {};

dotenv.config();  

const app = express();
const server = http.createServer(app); // Initialize server here

// Initialize WebSockets after the server is created
//initializeSocket(server); 

const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// WebSocket logic
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.userId) {
                clients[data.userId] = ws;
                console.log(`User ${data.userId} connected`);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        for (const userId in clients) {
            if (clients[userId] === ws) {
                delete clients[userId];
                console.log(`User ${userId} disconnected`);
                console.log("Currently connected clients:", Object.keys(clients));
                break;
            }
        }
    });
});

// Helper function to send notifications
const getIO = () => {
    return {
        sendNotification: (userId, message) => {
            const userSocket = clients[userId];
            if (userSocket) {
                userSocket.send(JSON.stringify({ message }));
            } else {
                console.log(`User ${userId} is not connected`);
            }
        },
    };
};

// Attach getIO to app locals for use in routes
app.locals.getIO = getIO;

// Welcome route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Nepal Mentor API');
});

// Routes
app.use('/api/register', registerRoutes);
app.use('/api/mentorregister', mentorregisterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes); // Ensure adminRoutes is set up correctly
app.use('/api/availability', availabilityRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/mentees', menteesRoutes);


// Catch-all route for 404 - keeps other routes unaffected
app.use((_req, res) => {
    res.status(404).send('Not Found');
});

// Function to send notification to a mentee
function sendNotificationToMentee(menteeId, message) {
    if (clients[menteeId]) {
        clients[menteeId].send(JSON.stringify({ message }));
        console.log(`Notification sent to mentee ${menteeId}`);
    } else {
        console.log(`User ${menteeId} is not connected`);
    }
}


module.exports = { sendNotificationToMentee };

module.exports = server;