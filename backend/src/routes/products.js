import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController.js';
import { verifyJWT } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin routes
router.post('/', verifyJWT, isAdmin, upload.array('images', 10), createProduct);
router.put('/:id', verifyJWT, isAdmin, upload.array('images', 10), updateProduct);
router.delete('/:id', verifyJWT, isAdmin, deleteProduct);

export default router;



