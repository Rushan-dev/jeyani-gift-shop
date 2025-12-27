import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const PaymentVerification = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      // Filter only bank transfer orders with pending payment
      const bankTransferOrders = response.data.filter(
        order => order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending'
      );
      setOrders(bankTransferOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId) => {
    if (!window.confirm('Are you sure you want to confirm this payment?')) {
      return;
    }

    try {
      await api.put(`/admin/orders/${orderId}/payment`, { paymentStatus: 'paid' });
      fetchOrders();
      alert('Payment confirmed successfully');
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const declinePayment = async (orderId) => {
    if (!window.confirm('Are you sure you want to decline this payment? The order will be marked as failed.')) {
      return;
    }

    try {
      await api.put(`/admin/orders/${orderId}/payment`, { paymentStatus: 'failed' });
      fetchOrders();
      alert('Payment declined');
    } catch (error) {
      console.error('Failed to decline payment:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to decline payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Verification</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No pending bank transfer payments</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Order #{typeof order._id === 'string' ? order._id.slice(-8) : order._id.toString().slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: Rs. {(order.totalAmount || order.total || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => confirmPayment(typeof order._id === 'string' ? order._id : order._id.toString())}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                    >
                      Confirm Payment
                    </button>
                    <button
                      onClick={() => declinePayment(typeof order._id === 'string' ? order._id : order._id.toString())}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
                    >
                      Decline Payment
                    </button>
                  </div>
                </div>

                {order.paymentSlip && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Payment Slip:</p>
                    <img
                      src={order.paymentSlip}
                      alt="Payment slip"
                      className="max-w-md border rounded-md"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;

