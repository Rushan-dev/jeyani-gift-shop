import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartSubtotal, getShippingFeeAmount, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-10 text-lg">Add some products to your cart to continue shopping</p>
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.product;
              const price = product.discountPrice || product.originalPrice || 0;
              return (
                <div key={product._id || product} className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to={`/products/${product._id || product}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={product.images?.[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={`/products/${product._id || product}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-primary-600 font-semibold mb-4">
                        Rs. {price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(product._id || product, item.quantity - 1)}
                            className="px-4 py-2 border-r border-gray-300 hover:bg-gray-100 transition-colors duration-200 font-semibold"
                          >
                            −
                          </button>
                          <span className="px-6 py-2 font-semibold bg-gray-50">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product._id || product, item.quantity + 1)}
                            className="px-4 py-2 border-l border-gray-300 hover:bg-gray-100 transition-colors duration-200 font-semibold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product._id || product)}
                          className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs. {getCartSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={`font-semibold ${getShippingFeeAmount() > 0 ? 'text-gray-900' : 'text-green-600'}`}>
                    {getShippingFeeAmount() > 0 ? `Rs. ${getShippingFeeAmount().toLocaleString()}` : 'Free'}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

