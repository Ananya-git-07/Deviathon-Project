const User = require('../models/User');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create a new User instance
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    // 4. Save the new user to the database
    const savedUser = await newUser.save();

    // 5. Send the token response
    sendTokenResponse(savedUser, 201, res);

  } catch (error) {
    console.error('REGISTRATION CRASH:', error); // Log the full error for debugging
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('LOGIN CRASH:', error); 
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const userData = {
    _id: user._id,
    email: user.email,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

module.exports = { register, login };