import Category from '../models/Category.js';
import slugify from 'slugify';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    console.log('Create category request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : 'No user');
    
    const { name, description } = req.body;

    if (!name) {
      console.log('Category creation failed: name is required');
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    console.log('Creating category with slug:', slug);

    const category = await Category.create({
      name,
      slug,
      description
    });

    console.log('Category created successfully:', category._id);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      console.log('Category creation failed: duplicate category');
      return res.status(400).json({ message: 'Category already exists' });
    }
    console.error('Create category error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description } = req.body;

    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) category.description = description;

    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};


