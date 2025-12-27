import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.js';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartSubtotal, getShippingFeeAmount, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: ''
  });

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSlipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentSlip(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please fill in all shipping address fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Creating order with data:', { 
        items: cart.length, 
        paymentMethod, 
        shippingAddress: !!shippingAddress 
      });
      
      const items = cart.map(item => ({
        productId: item.product._id || item.product,
        quantity: item.quantity
      }));

      // Create order first (without payment slip if it's large)
      const orderData = {
        items,
        shippingAddress,
        paymentMethod
      };

      console.log('Order data:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('Order created successfully:', response.data);
      console.log('Payment method:', paymentMethod);
      console.log('Checkout URL:', response.data.checkoutUrl);
      
      // If payment slip exists and payment method is bank_transfer, upload it separately
      if (paymentSlip && paymentMethod === 'bank_transfer' && response.data.order?._id) {
        try {
          // Convert base64 to blob
          const base64Data = paymentSlip.split(',')[1] || paymentSlip;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray]);
          
          // Get file name from the original file input if available
          const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
          const fileName = fileInput?.files[0]?.name || 'payment-slip.jpg';
          
          const formData = new FormData();
          formData.append('paymentSlip', blob, fileName);
          
          await api.post(`/orders/${response.data.order._id}/payment-slip`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('Payment slip uploaded successfully');
        } catch (uploadError) {
          console.error('Failed to upload payment slip:', uploadError);
          // Order is already created, so we continue even if slip upload fails
        }
      }
      
      // If stripe payment, redirect to Stripe Checkout
      if (paymentMethod === 'stripe') {
        if (response.data.checkoutUrl) {
          console.log('Redirecting to Stripe Checkout:', response.data.checkoutUrl);
          // Redirect to Stripe Checkout page
          window.location.href = response.data.checkoutUrl;
          return; // Important: exit function to prevent code below from executing
        } else {
          console.error('Stripe checkout URL not received');
          setError('Failed to initialize payment. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // For other payment methods, clear cart and navigate to confirmation
        clearCart();
        navigate(`/orders/${response.data.order._id}?success=true`);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to place order';
      console.error('Full error details:', JSON.stringify(err.response?.data, null, 2));
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive the order</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Bank Transfer</div>
                    <div className="text-sm text-gray-600">Upload payment slip after transfer</div>
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePaymentSlipChange}
                          className="text-sm"
                        />
                        {paymentSlip && (
                          <p className="text-xs text-green-600 mt-1">Payment slip uploaded</p>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Pay securely with Stripe</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                {cart.map((item) => {
                  const product = item.product;
                  const price = product.discountPrice || product.originalPrice || 0;
                  return (
                    <div key={product._id || product} className="flex justify-between text-sm">
                      <span>
                        {product.name} x {item.quantity}
                      </span>
                      <span>Rs. {(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {getCartSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={getShippingFeeAmount() > 0 ? '' : 'text-green-600'}>
                    {getShippingFeeAmount() > 0 ? `Rs. ${getShippingFeeAmount().toLocaleString()}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">Rs. {getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

