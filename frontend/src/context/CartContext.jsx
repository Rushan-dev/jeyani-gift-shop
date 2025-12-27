import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from backend or localStorage
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromBackend();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated]);

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.cart || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      loadCartFromLocalStorage();
    }
  };

  // Load cart from localStorage
  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Add to cart
  const addToCart = async (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product._id === product._id || item.product === product._id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item =>
        (item.product._id === product._id || item.product === product._id)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }

    setCart(updatedCart);
    saveCartToLocalStorage(updatedCart);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await api.post('/cart', { productId: product._id, quantity });
        await loadCartFromBackend();
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter(item => 
      (item.product._id || item.product) !== productId
    );
    
    setCart(updatedCart);
    saveCartToLocalStorage(updatedCart);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        // Find the cart item by productId to get its _id
        const cartItem = cart.find(item => {
          const itemProductId = item.product?._id || item.product;
          return itemProductId === productId || itemProductId?.toString() === productId?.toString();
        });
        
        if (cartItem && cartItem._id) {
          await api.delete(`/cart/${cartItem._id}`);
        } else {
          // Reload cart from backend to get proper structure with _id
          const reloadedCart = await api.get('/cart');
          const itemToRemove = reloadedCart.data.cart.find(item => {
            const itemProductId = item.product?._id || item.product;
            return itemProductId === productId || itemProductId?.toString() === productId?.toString();
          });
          if (itemToRemove && itemToRemove._id) {
            await api.delete(`/cart/${itemToRemove._id}`);
          }
        }
        await loadCartFromBackend();
      } catch (error) {
        console.error('Failed to sync cart:', error);
        await loadCartFromBackend();
      }
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      (item.product._id || item.product) === productId
        ? { ...item, quantity }
        : item
    );

    setCart(updatedCart);
    saveCartToLocalStorage(updatedCart);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        // Find the cart item by productId to get its _id
        const cartItem = cart.find(item => {
          const itemProductId = item.product?._id || item.product;
          return itemProductId === productId || itemProductId?.toString() === productId?.toString();
        });
        
        if (cartItem && cartItem._id) {
          await api.put(`/cart/${cartItem._id}`, { quantity });
        } else {
          // Reload cart from backend to get proper structure with _id
          const reloadedCart = await api.get('/cart');
          const itemToUpdate = reloadedCart.data.cart.find(item => {
            const itemProductId = item.product?._id || item.product;
            return itemProductId === productId || itemProductId?.toString() === productId?.toString();
          });
          if (itemToUpdate && itemToUpdate._id) {
            await api.put(`/cart/${itemToUpdate._id}`, { quantity });
          }
        }
        await loadCartFromBackend();
      } catch (error) {
        console.error('Failed to sync cart:', error);
        await loadCartFromBackend();
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('cart');

    if (isAuthenticated) {
      try {
        await api.delete('/cart/clear');
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  // Get cart subtotal
  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      const product = item.product;
      const price = product.discountPrice || product.originalPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Get shipping fee amount (sum of all product shipping fees in cart)
  const getShippingFeeAmount = () => {
    if (!cart || cart.length === 0) return 0;
    
    const shippingTotal = cart.reduce((total, item) => {
      if (!item || !item.product) return total;
      
      const product = item.product;
      // Handle both populated product objects and product IDs
      if (typeof product === 'object' && product !== null) {
        // Check if shippingFee exists, handle undefined/null/0 cases
        const productShippingFee = (product.shippingFee !== undefined && product.shippingFee !== null) 
          ? parseFloat(product.shippingFee) || 0 
          : 0;
        // Shipping fee is added once per unique product (not per quantity)
        return total + productShippingFee;
      }
      return total;
    }, 0);
    
    return shippingTotal;
  };

  // Get cart total (subtotal + shipping)
  const getCartTotal = () => {
    return getCartSubtotal() + getShippingFeeAmount();
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSubtotal,
    getShippingFeeAmount,
    getCartTotal,
    getCartItemsCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

