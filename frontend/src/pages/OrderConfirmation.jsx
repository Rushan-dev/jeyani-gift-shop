import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api.js';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const success = searchParams.get('success') === 'true';

  const verifyStripePayment = async (sessionId) => {
    if (verifying) {
      console.log('Payment verification already in progress');
      return;
    }
    
    setVerifying(true);
    try {
      console.log('Verifying Stripe payment with session ID:', sessionId);
      const response = await api.post('/orders/verify-stripe', { sessionId });
      console.log('Payment verification response:', response.data);
      // Refresh order data to get updated payment status
      await fetchOrder();
    } catch (error) {
      console.error('Failed to verify Stripe payment:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setVerifying(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
      
      // After order is loaded, check if we need to verify Stripe payment
      const sessionId = searchParams.get('session_id');
      if (sessionId && success && response.data.paymentMethod === 'stripe' && response.data.paymentStatus === 'pending') {
        console.log('Order loaded, verifying Stripe payment...');
        verifyStripePayment(sessionId);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link to="/orders" className="text-primary-600 hover:text-primary-700">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <h2 className="text-xl font-bold mb-2">
              {order.paymentMethod === 'stripe' && order.paymentStatus === 'paid' 
                ? 'Payment Successful & Order Placed!' 
                : 'Order Placed Successfully!'}
            </h2>
            <p>
              {order.paymentMethod === 'stripe' && order.paymentStatus === 'paid'
                ? 'Your payment has been processed and your order is being prepared.'
                : 'Your order has been received and is being processed.'}
            </p>
          </div>
        )}
        
        {order.paymentMethod === 'stripe' && order.paymentStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <h2 className="text-xl font-bold mb-2">Payment Pending</h2>
            <p>Your order has been created. Please complete the payment to proceed.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order #{typeof order._id === 'string' ? order._id.slice(-8) : order._id.toString().slice(-8)}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <p className="font-semibold capitalize">{order.orderStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-semibold capitalize">{order.paymentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary-600">Rs. {(order.totalAmount || order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-semibold">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Tracking Information</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="text-lg font-semibold text-primary-600">#{order.trackingNumber}</p>
            </div>
            
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Tracking History</p>
                <div className="space-y-3">
                  {order.trackingHistory
                    .slice()
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((tracking, index) => (
                      <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{tracking.status}</p>
                            {tracking.location && (
                              <p className="text-sm text-gray-600 mt-1">📍 {tracking.location}</p>
                            )}
                            {tracking.description && (
                              <p className="text-sm text-gray-600 mt-1">{tracking.description}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(tracking.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-4">
          <Link
            to="/products"
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 text-center font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 text-center font-medium"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

