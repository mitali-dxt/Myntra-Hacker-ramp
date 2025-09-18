import { useState, useEffect } from 'react';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('myntra-wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever wishlistItems changes
  useEffect(() => {
    try {
      localStorage.setItem('myntra-wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(item => item.product._id === product._id);
      
      if (existingItem) {
        return prevItems; // Don't add duplicate
      }

      return [...prevItems, {
        id: `wishlist-${product._id}-${Date.now()}`,
        product,
        addedAt: new Date().toISOString()
      }];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => 
      prevItems.filter(item => item.product._id !== productId)
    );
  };

  // Toggle item in wishlist
  const toggleWishlist = (product) => {
    const isInWishlist = wishlistItems.some(item => item.product._id === product._id);
    
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Get total items count
  const getTotalItems = () => {
    return wishlistItems.length;
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  // Move item from wishlist to cart
  const moveToCart = (productId, addToCartFunction) => {
    const wishlistItem = wishlistItems.find(item => item.product._id === productId);
    if (wishlistItem) {
      addToCartFunction(wishlistItem.product);
      removeFromWishlist(productId);
    }
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    getTotalItems,
    isInWishlist,
    moveToCart
  };
};