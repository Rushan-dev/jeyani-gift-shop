import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.js';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (isAuthenticated && product?._id) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, product?._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.get('/wishlist');
      const wishlistItems = response.data.wishlist || [];
      const productInWishlist = wishlistItems.some(
        item => item._id === product._id || item._id?._id === product._id
      );
      setInWishlist(productInWishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const price = product.discountPrice || product.originalPrice;
  const originalPrice = product.discountPrice ? product.originalPrice : null;
  const discountPercentage = product.discountPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/remove/${product._id}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist/add', { productId: product._id });
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
    setWishlistLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {discountPercentage > 0 && (
            <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              -{discountPercentage}% OFF
            </span>
          )}
          <button
            onClick={handleAddToWishlist}
            disabled={wishlistLoading || !isAuthenticated}
            className={`absolute top-3 left-3 p-2.5 rounded-full backdrop-blur-sm ${
              inWishlist 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            } transition-all duration-300 transform hover:scale-110 shadow-md`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } transition-all duration-200`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500 font-medium">
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">Rs. {price?.toLocaleString()}</span>
            {originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

