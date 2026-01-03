import dotenv from 'dotenv'; // Must be at the very top
dotenv.config(); // Load environment variables as early as possible

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import './config/firebaseAdmin.js'; // Ensure Firebase Admin is initialized early
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import reviewRoutes from './routes/reviews.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';

// Debug: Check if critical env vars are loaded (remove in production)
console.log('Environment check:');
console.log('- MongoDB URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT Secret:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('- Firebase Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Missing');
console.log('- Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing');
console.log('- Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Gift Shop API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


