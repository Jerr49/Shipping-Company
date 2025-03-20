const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '15m' });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
};

// 📝 User Registration (Signup) with Email

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const user = new User({ email, password, role }); 
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 🔑 User Login with Email & Password
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store Refresh Token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send the tokens back to the client
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 🔄 Refresh Access Token Endpoint
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(403).json({ message: 'Refresh Token Required' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid Refresh Token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid or Expired Refresh Token' });
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken };
