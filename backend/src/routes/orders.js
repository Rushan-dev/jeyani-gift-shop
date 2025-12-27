import express from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  uploadPaymentSlip,
  verifyStripePayment
} from '../controllers/orderController.js';
import { verifyJWT } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.post('/:id/payment-slip', upload.single('paymentSlip'), uploadPaymentSlip);
router.post('/verify-stripe', verifyStripePayment);

export default router;



