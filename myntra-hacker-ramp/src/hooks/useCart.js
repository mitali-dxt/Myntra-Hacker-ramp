import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('myntra-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('myntra-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, selectedSize = '', selectedColor = '', quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists with same size and color
      const existingItemIndex = prevItems.findIndex(
        item => 
          item.product._id === product._id && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, {
          id: `${product._id}-${selectedSize}-${selectedColor}-${Date.now()}`,
          product,
          selectedSize,
          selectedColor,
          quantity,
          addedAt: new Date().toISOString()
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total items count
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Check if product is in cart
  const isInCart = (productId, selectedSize = '', selectedColor = '') => {
    return cartItems.some(
      item => 
        item.product._id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
    );
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  };
};