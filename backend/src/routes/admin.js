import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  verifyPayment,
  updateTracking,
  getShippingFee,
  updateShippingFee,
  getDashboardStats
} from '../controllers/adminController.js';
import { verifyJWT } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// All routes require admin access
router.use(verifyJWT);
router.use(isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', verifyPayment);
router.put('/orders/:id/tracking', updateTracking);
router.get('/settings/shipping-fee', getShippingFee);
router.put('/settings/shipping-fee', updateShippingFee);

export default router;


