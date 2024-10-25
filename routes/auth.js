const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/users');
const router = express.Router();

// POST /api/auth/login - Login Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials or role' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Create a reset token (JWT)
    const payload = { user: { id: user.id } };
    const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Set up Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'nepalmentors1@gmail.com',
        pass: 'cydhqbwotkocyuyz'
      }
    });

    // Construct reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
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
    const user = await User.findById(userId);
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
