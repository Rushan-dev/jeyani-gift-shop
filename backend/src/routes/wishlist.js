import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/wishlistController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Routes must be defined in correct order
router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);

// Debug: Log route registration
console.log('Wishlist routes registered:', {
  GET: '/api/wishlist/',
  POST: '/api/wishlist/add',
  DELETE: '/api/wishlist/remove/:productId'
});

export default router;


