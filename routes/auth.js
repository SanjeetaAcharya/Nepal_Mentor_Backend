const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Ensure this line is correct
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

module.exports = router;
