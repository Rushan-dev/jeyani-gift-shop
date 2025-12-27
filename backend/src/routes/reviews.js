import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', verifyJWT, createReview);
router.put('/:id', verifyJWT, updateReview);
router.delete('/:id', verifyJWT, deleteReview);

export default router;



