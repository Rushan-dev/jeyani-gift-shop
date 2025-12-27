import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Stripe from 'stripe';
import { uploadToCloudinary } from '../config/cloudinary.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Create order
export const createOrder = async (req, res) => {
  try {
    console.log('Create order request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email } : 'No user');
    
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      console.log('Order creation failed: Cart is empty');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!shippingAddress || !paymentMethod) {
      console.log('Order creation failed: Missing shipping address or payment method');
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    // Validate payment method
    const validPaymentMethods = ['cod', 'bank_transfer', 'stripe'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      console.log('Order creation failed: Invalid payment method:', paymentMethod);
      return res.status(400).json({ message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}` });
    }

    // Get user cart
    const user = await User.findById(req.user._id).populate('cart.product');

    // Calculate subtotal, shipping fee, and validate items
    let subtotal = 0;
    let shippingFee = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountPrice || product.originalPrice;
      subtotal += price * item.quantity;
      
      // Add shipping fee from product (once per product, not per quantity)
      const productShippingFee = product.shippingFee || 0;
      shippingFee += productShippingFee;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price
      });
    }

    // Calculate total amount
    const totalAmount = subtotal + shippingFee;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      totalAmount,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending'
    });

    // Save order first (before creating Stripe session)
    await order.save();

    // Handle Stripe payment - create checkout session
    let checkoutSession = null;
    if (paymentMethod === 'stripe') {
      try {
        // Validate Stripe configuration
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error('Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
        }

        // Create Stripe Checkout Session
        // Using USD as default currency (LKR may not be supported in all Stripe accounts)
        // Conversion rate: 1 USD ≈ 300 LKR (adjust as needed)
        const currency = 'usd'; // Using USD for compatibility
        const conversionRate = 300; // LKR to USD conversion rate
        const stripeAmount = Math.round((totalAmount / conversionRate) * 100); // Convert LKR to USD cents

        console.log('Creating Stripe checkout session...');
        console.log('Order total (LKR):', totalAmount);
        console.log('Stripe amount (USD cents):', stripeAmount);
        console.log('Stripe secret key configured:', !!process.env.STRIPE_SECRET_KEY);

        checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: currency,
              product_data: {
                name: `Order #${order._id.toString().slice(-8)}`,
                description: `${orderItems.length} item(s) - Total: Rs. ${totalAmount.toLocaleString()} (≈ $${(totalAmount / conversionRate).toFixed(2)} USD)`,
              },
              unit_amount: stripeAmount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id.toString()}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?canceled=true`,
          metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString(),
            originalAmount: totalAmount.toString(), // Store original LKR amount
          },
          customer_email: req.user.email || undefined,
        });

        console.log('Stripe checkout session created successfully');
        console.log('Session ID:', checkoutSession.id);
        console.log('Checkout URL:', checkoutSession.url);
        
        if (!checkoutSession.url) {
          throw new Error('Stripe checkout session created but no URL returned');
        }
        
        order.stripePaymentIntentId = checkoutSession.id;
        await order.save();
      } catch (error) {
        console.error('Stripe error details:', error);
        console.error('Error message:', error.message);
        console.error('Error type:', error.type);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        // Delete the order if Stripe session creation fails
        await Order.findByIdAndDelete(order._id);
        return res.status(500).json({ 
          message: 'Payment processing failed', 
          error: error.message || 'Unknown Stripe error',
          details: error.type || error.code || 'Unknown error'
        });
      }
    }

    // Only update stock and clear cart if NOT Stripe payment (for Stripe, we'll do this after payment confirmation)
    if (paymentMethod !== 'stripe') {
      // Update product stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear user cart
      user.cart = [];
      await user.save();
    }

    const populatedOrder = await Order.findById(order._id).populate('items.product');

    console.log('Order created successfully:', order._id);
    console.log('Checkout session:', checkoutSession ? 'Created' : 'Not created');
    
    const responseData = {
      order: populatedOrder
    };
    
    if (checkoutSession && checkoutSession.url) {
      responseData.checkoutUrl = checkoutSession.url;
      responseData.sessionId = checkoutSession.id;
      console.log('Returning checkout URL:', checkoutSession.url);
    } else if (paymentMethod === 'stripe') {
      // This shouldn't happen, but handle it just in case
      console.error('ERROR: Stripe payment method but no checkout URL!');
    }
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Upload payment slip (for bank transfer)
export const uploadPaymentSlip = async (req, res) => {
  try {
    console.log('Upload payment slip request received for order:', req.params.id);
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.paymentMethod !== 'bank_transfer') {
      return res.status(400).json({ message: 'Payment method is not bank transfer' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment slip image is required' });
    }

    console.log('Uploading payment slip to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer);
    order.paymentSlip = result.secure_url;
    await order.save();

    console.log('Payment slip uploaded successfully:', result.secure_url);
    const populatedOrder = await Order.findById(order._id).populate('items.product');
    res.json(populatedOrder);
  } catch (error) {
    console.error('Upload payment slip error:', error);
    res.status(500).json({ message: 'Failed to upload payment slip', error: error.message });
  }
};

// Verify Stripe payment (using Checkout Session)
export const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    console.log('Verifying Stripe payment for session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || !session.metadata.orderId) {
      return res.status(400).json({ message: 'Invalid session metadata' });
    }

    const order = await Order.findById(session.metadata.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      
      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      // Clear user cart
      const user = await User.findById(order.user);
      if (user) {
        user.cart = [];
        await user.save();
      }

      await order.save();
      console.log('Payment verified and order updated:', order._id);
    }

    const populatedOrder = await Order.findById(order._id).populate('items.product');
    res.json({ order: populatedOrder, paymentStatus: session.payment_status });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

