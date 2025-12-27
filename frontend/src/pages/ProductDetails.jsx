import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewComponent from '../components/ReviewComponent';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (product && product.category) {
      fetchRecommendedProducts();
    }
  }, [product]);

  const checkWishlistStatus = async () => {
    if (!isAuthenticated) {
      setInWishlist(false);
      return;
    }
    try {
      const response = await api.get('/wishlist');
      const wishlistItems = response.data.wishlist || [];
      const productInWishlist = wishlistItems.some(
        item => {
          const itemId = item._id?._id || item._id;
          return itemId === id || itemId?.toString() === id?.toString();
        }
      );
      setInWishlist(productInWishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      // Don't set inWishlist to false on error, just log it
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setSelectedImage(0);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      if (!product || !product.category) {
        return;
      }

      // Get category slug for filtering
      const categorySlug = product.category?.slug || '';
      
      if (!categorySlug) {
        // If no category slug, fetch all products
        const response = await api.get('/products', {
          params: {
            limit: 8,
            page: 1
          }
        });
        
        const filtered = (response.data.products || [])
          .filter(p => p._id !== id)
          .slice(0, 4);
        
        setRecommendedProducts(filtered);
        return;
      }

      // Fetch products from the same category, excluding the current product
      const response = await api.get('/products', {
        params: {
          category: categorySlug,
          limit: 8,
          page: 1
        }
      });
      
      // Filter out the current product and limit to 4 products
      const filtered = (response.data.products || [])
        .filter(p => p._id !== id && p._id !== product._id)
        .slice(0, 4);
      
      setRecommendedProducts(filtered);
    } catch (error) {
      console.error('Failed to fetch recommended products:', error);
      setRecommendedProducts([]);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!product || !product._id) {
      console.error('Product or product ID is missing');
      alert('Product information is missing');
      return;
    }
    
    setWishlistLoading(true);
    try {
      console.log('Wishlist action - inWishlist:', inWishlist);
      console.log('Product ID:', product._id);
      
      if (inWishlist) {
        console.log('Removing from wishlist...');
        const response = await api.delete(`/wishlist/remove/${product._id}`);
        console.log('Remove response:', response);
        setInWishlist(false);
      } else {
        console.log('Adding to wishlist...');
        const response = await api.post('/wishlist/add', { productId: product._id });
        console.log('Add response:', response);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Wishlist error - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to update wishlist';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-primary-600 hover:text-primary-700"
          >
            Go back to products
          </button>
        </div>
      </div>
    );
  }

  const price = product.discountPrice || product.originalPrice;
  const originalPrice = product.discountPrice ? product.originalPrice : null;
  const discountPercentage = product.discountPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Images */}
            <div>
              <div className="aspect-square mb-4">
                <img
                  src={product.images[selectedImage] || '/placeholder-image.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.rating?.toFixed(1) || 0} ({product.numReviews || 0} reviews)
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {price?.toLocaleString()}
                </span>
                {originalPrice && (
                  <>
                    <span className="ml-3 text-xl text-gray-500 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                    <span className="ml-2 text-lg text-red-600 font-semibold">
                      ({discountPercentage}% off)
                    </span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Shipping Fee:</span>{' '}
                  {product.shippingFee && product.shippingFee > 0 ? (
                    <span className="text-orange-600 font-semibold">Rs. {Math.round(product.shippingFee).toLocaleString()}</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Free</span>
                  )}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {product.category?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Stock:</span>{' '}
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </p>
              </div>

              {product.stock > 0 ? (
                <>
                  <div className="flex items-center mb-4">
                    <label className="mr-4 font-medium">Quantity:</label>
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 border-r"
                      >
                        -
                      </button>
                      <span className="px-4 py-2">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 border-l"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      disabled={wishlistLoading}
                      className={`p-3 rounded-md border-2 ${
                        inWishlist
                          ? 'border-red-500 text-red-500 bg-red-50'
                          : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                      } transition-colors`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  This product is currently out of stock
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          <ReviewComponent productId={id} reviews={reviews} onReviewSubmit={fetchReviews} />
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct) => (
                <ProductCard key={recommendedProduct._id} product={recommendedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

