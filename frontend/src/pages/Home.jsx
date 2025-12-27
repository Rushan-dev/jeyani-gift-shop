import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { limit: 8, sort: 'rating', order: 'desc' }
      });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Welcome to Our Gift Shop
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90">
            Find the perfect gift for your loved ones
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Premium decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            {/* Premium heading with proper line-height to prevent clipping */}
            <div className="inline-block mb-2">
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '0.1em' }}>
                  Shop by Category
                </span>
              </h2>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-2">
              Discover our curated collection of premium gifts
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
            {[
              { 
                name: 'Photo Frames', 
                slug: 'photo-frames',
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&q=80&auto=format'
              },
              { 
                name: 'Duro Frames', 
                slug: 'duro-frames',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&q=80&auto=format'
              },
              { 
                name: 'UV Frames', 
                slug: 'uv-frames',
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&q=80&auto=format'
              },
              { 
                name: 'Mugs', 
                slug: 'mugs',
                image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop&q=80&auto=format'
              },
              { 
                name: 'Other Gifts', 
                slug: 'other-gifts',
                image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&q=80&auto=format'
              }
            ].map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group relative bg-white p-4 rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 border border-gray-200 hover:border-primary-300 overflow-hidden"
              >
                {/* Simple gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/40 group-hover:to-primary-100/30 transition-all duration-300 rounded-2xl"></div>
                
                {/* Category Image with simple hover effect */}
                <div className="relative mb-3 h-28 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(category.name);
                    }}
                  />
                </div>
                
                {/* Category Name */}
                <div className="relative">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold text-lg group flex items-center space-x-2 transition-colors duration-200"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

