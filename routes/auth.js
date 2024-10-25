const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Added for sending email
const User = require('../models/users'); // Should match to the model name
const router = express.Router();

// POST /api/auth/login - Login Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if user exists with the provided email
    let user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials or role' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Create a reset token (JWT)
    const payload = { user: { id: user.id } };
    const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Set up Nodemailer for sending the email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Use SMTP host
      port: 587, // Use port 587 for TLS
      secure: false,
      auth: {
        user: 'nepalmentors1@gmail.com', 
        pass: 'cydhqbwotkocyuyz'
      }
    });

    transporter.verify((error, success) => {
      if (error) {
          console.log('Server is not ready to take our messages: ', error);
      } else {
          console.log('Server is ready to take our messages');
      }
  });
  
    
    

    // Construct reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}`
    };



    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Password:', process.env.EMAIL_PASS);

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log after sending the email
    console.log('Email sent successfully to:', user.email);
    res.json({ msg: 'Password reset link sent to your email' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// POST /api/auth/reset-password/:token - Reset the password
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid token or user does not exist' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: 'Password has been reset successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;
