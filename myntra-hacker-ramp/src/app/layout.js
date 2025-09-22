// src/app/layout.js
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { CartWishlistProvider } from "@/contexts/CartWishlistContext";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  // Listen for cart and wishlist open events
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    const handleOpenWishlist = () => setIsWishlistOpen(true);
    
    window.addEventListener('openCart', handleOpenCart);
    window.addEventListener('openWishlist', handleOpenWishlist);
    
    return () => {
      window.removeEventListener('openCart', handleOpenCart);
      window.removeEventListener('openWishlist', handleOpenWishlist);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartWishlistProvider>
          <div className="bg-gray-50 font-sans">
            <Header onCartOpen={openCart} onWishlistOpen={openWishlist} />
            <main>{children}</main> {/* Page content will be rendered here */}
            <Footer />
            
            {/* Drawers */}
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
            <WishlistDrawer isOpen={isWishlistOpen} onClose={closeWishlist} />
          </div>
        </CartWishlistProvider>
      </body>
    </html>
  );
}