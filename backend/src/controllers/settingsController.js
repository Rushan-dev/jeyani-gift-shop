import Settings from '../models/Settings.js';

// Get shipping fee (public endpoint for cart/checkout)
export const getShippingFee = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'shippingFee' });
    if (!settings) {
      // Return default if settings don't exist
      return res.json({ enabled: false, amount: 0 });
    }
    res.json(settings.value);
  } catch (error) {
    console.error('Get shipping fee error:', error);
    res.status(500).json({ message: 'Failed to fetch shipping fee', error: error.message });
  }
};


