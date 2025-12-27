import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product');

    res.json(populatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Verify payment (Admin)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid' && order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product');

    res.json(populatedOrder);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

// Update tracking details (Admin)
export const updateTracking = async (req, res) => {
  try {
    const { trackingNumber, status, location, description } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update tracking number if provided
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber || null;
    }

    // Add tracking history entry if status is provided
    if (status) {
      order.trackingHistory.push({
        status,
        location: location || '',
        description: description || '',
        timestamp: new Date()
      });
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product');

    res.json(populatedOrder);
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Failed to update tracking', error: error.message });
  }
};

// Get shipping fee settings
export const getShippingFee = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'shippingFee' });
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({ key: 'shippingFee', value: { enabled: false, amount: 0 } });
    }
    res.json(settings.value);
  } catch (error) {
    console.error('Get shipping fee error:', error);
    res.status(500).json({ message: 'Failed to fetch shipping fee', error: error.message });
  }
};

// Update shipping fee settings
export const updateShippingFee = async (req, res) => {
  try {
    const { enabled, amount } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({ message: 'Enabled status is required' });
    }

    if (enabled && (amount === undefined || amount < 0)) {
      return res.status(400).json({ message: 'Amount is required and must be >= 0 when enabled' });
    }

    const value = {
      enabled: enabled,
      amount: enabled ? (amount || 0) : 0
    };

    let settings = await Settings.findOne({ key: 'shippingFee' });
    if (settings) {
      settings.value = value;
      await settings.save();
    } else {
      settings = await Settings.create({ key: 'shippingFee', value });
    }

    res.json(settings.value);
  } catch (error) {
    console.error('Update shipping fee error:', error);
    res.status(500).json({ message: 'Failed to update shipping fee', error: error.message });
  }
};

// Get dashboard stats (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};


