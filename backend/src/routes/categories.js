import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyJWT } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// Public route - get all categories
router.get('/', getCategories);

// Admin routes
router.post('/', verifyJWT, isAdmin, createCategory);
router.put('/:id', verifyJWT, isAdmin, updateCategory);
router.delete('/:id', verifyJWT, isAdmin, deleteCategory);

export default router;



