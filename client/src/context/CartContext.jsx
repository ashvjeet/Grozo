import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      if (data.success) setCart(data.data);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartAPI.add(productId, quantity);
    if (data.success) { await fetchCart(); return true; }
    return false;
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await cartAPI.update(productId, quantity);
    if (data.success) await fetchCart();
  };

  const removeItem = async (productId) => {
    const { data } = await cartAPI.remove(productId);
    if (data.success) await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clear();
    await fetchCart();
  };

  const applyCoupon = async (code) => {
    const { data } = await cartAPI.applyCoupon(code);
    if (data.success) { await fetchCart(); return data; }
    throw new Error(data.message);
  };

  const removeCoupon = async () => {
    await cartAPI.removeCoupon();
    await fetchCart();
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addToCart, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
