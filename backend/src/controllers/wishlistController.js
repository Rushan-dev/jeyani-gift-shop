import User from '../models/User.js';
import Product from '../models/Product.js';

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    console.log('Add to wishlist request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email } : 'No user');
    
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if product is already in wishlist (handle both string and ObjectId comparison)
    const isInWishlist = user.wishlist.some(
      item => item.toString() === productId.toString()
    );
    
    if (isInWishlist) {
      console.log('Product already in wishlist');
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();
    console.log('Product added to wishlist successfully');

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: updatedUser.wishlist });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    console.log('Remove from wishlist request received');
    console.log('Product ID:', req.params.productId);
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email } : 'No user');
    
    const user = await User.findById(req.user._id);
    const initialLength = user.wishlist.length;
    
    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.productId.toString()
    );
    
    if (user.wishlist.length === initialLength) {
      console.log('Product not found in wishlist');
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    await user.save();
    console.log('Product removed from wishlist successfully');

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: updatedUser.wishlist });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};


