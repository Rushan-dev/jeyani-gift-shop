import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Sort
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, originalPrice, discountPrice, shippingFee, stock } = req.body;

    if (!name || !description || !category || !originalPrice || stock === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Upload images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        images.push(result.secure_url);
      }
    }

    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = await Product.create({
      name,
      description,
      category,
      images,
      originalPrice: parseFloat(originalPrice),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      shippingFee: shippingFee ? parseFloat(shippingFee) : 0,
      stock: parseInt(stock)
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, category, originalPrice, discountPrice, shippingFee, stock } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (originalPrice) product.originalPrice = parseFloat(originalPrice);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (shippingFee !== undefined) product.shippingFee = parseFloat(shippingFee) || 0;
    if (stock !== undefined) product.stock = parseInt(stock);

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        newImages.push(result.secure_url);
      }
      product.images = [...product.images, ...newImages];
    }

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.json(populatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`giftshop/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await product.deleteOne();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

