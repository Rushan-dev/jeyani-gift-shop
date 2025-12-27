import User from '../models/User.js';
import admin from '../config/firebaseAdmin.js';
import jwt from 'jsonwebtoken';

// Register with Firebase token
export const register = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized!');
      return res.status(500).json({ message: 'Server configuration error. Firebase Admin not initialized.' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUID: decodedToken.uid });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firebaseUID: decodedToken.uid,
      name: decodedToken.name || decodedToken.email || decodedToken.phone_number || 'User',
      email: decodedToken.email || null,
      phone: decodedToken.phone_number || null
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        firebaseUID: user.firebaseUID
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login with Firebase token
export const login = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized!');
      return res.status(500).json({ message: 'Server configuration error. Firebase Admin not initialized.' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    // Find or create user
    let user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUID: decodedToken.uid,
        name: decodedToken.name || decodedToken.email || decodedToken.phone_number || 'User',
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null
      });
    } else {
      // Update user info if needed
      if (decodedToken.email && !user.email) {
        user.email = decodedToken.email;
      }
      if (decodedToken.phone_number && !user.phone) {
        user.phone = decodedToken.phone_number;
      }
      if (decodedToken.name && !user.name) {
        user.name = decodedToken.name;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        firebaseUID: user.firebaseUID
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUID');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};



