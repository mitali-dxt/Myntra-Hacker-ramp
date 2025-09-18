"use client";

import React, { createContext, useContext } from 'react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

const CartWishlistContext = createContext();

export const useCartWishlistContext = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlistContext must be used within a CartWishlistProvider');
  }
  return context;
};

export const CartWishlistProvider = ({ children }) => {
  const cartMethods = useCart();
  const wishlistMethods = useWishlist();

  const value = {
    cart: cartMethods,
    wishlist: wishlistMethods,
  };

  return (
    <CartWishlistContext.Provider value={value}>
      {children}
    </CartWishlistContext.Provider>
  );
};