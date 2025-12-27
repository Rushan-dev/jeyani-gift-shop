import express from 'express';
import { getShippingFee } from '../controllers/settingsController.js';

const router = express.Router();

// Public route - get shipping fee (for cart/checkout)
router.get('/shipping-fee', getShippingFee);

export default router;


