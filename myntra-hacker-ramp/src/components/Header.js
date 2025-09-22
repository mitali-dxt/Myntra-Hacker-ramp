"use client";

import { useEffect, useRef, useState } from 'react';
import { Heart, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link'; // Use Next.js Link for navigation
import { useCartWishlistContext } from '../contexts/CartWishlistContext';

export default function Header({ onCartOpen, onWishlistOpen }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Cart and Wishlist context
  const { cart, wishlist } = useCartWishlistContext();
  const { getTotalItems: getCartItemsCount } = cart;
  const { getTotalItems: getWishlistItemsCount } = wishlist;
  
  const cartCount = getCartItemsCount();
  const wishlistCount = getWishlistItemsCount();

  useEffect(() => {
    // fetch current user
    fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'me' }) })
      .then(r => r.json())
      .then(d => setUser(d.user || null))
      .catch(() => {});
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  async function handleProfileClick() {
    if (!user) { window.location.href = '/auth/login'; return; }
    setMenuOpen((o) => !o);
  }

  async function signOut() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
    setUser(null);
    setMenuOpen(false);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Side: Logo & Nav */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-3xl font-extrabold text-pink-500 italic">
              myntra
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">Products</Link>
              <Link href="/tribes" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">Tribes</Link>
              <Link href="/drops" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">Drops</Link>
              <Link href="/quests" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">Quests</Link>
              <Link href="/collab" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">Collab</Link>
            </nav>
          </div>

          {/* Middle: Search Bar */}
          <div className="hidden lg:flex flex-grow max-w-xl mx-8 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="text-gray-400" size={20} />
            </span>
            <input 
              type="text" 
              placeholder="Search for products, brands and more"
              className="w-full h-12 bg-gray-100 rounded-md pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          
          {/* Right Side: Icons */}
          <div className="flex items-center space-x-6">
            {/* Creator/Admin Quick Access */}
            <div className="hidden md:flex items-center space-x-3">
              <Link 
                href="/creator/login" 
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors font-semibold"
              >
                Creator
              </Link>
              <Link 
                href="/admin" 
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors font-semibold"
              >
                Admin
              </Link>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button onClick={handleProfileClick} className="flex flex-col items-center text-gray-700 hover:text-pink-500">
                <User size={24} />
                <span className="text-xs font-semibold">{user ? (user.displayName || user.username) : 'Profile'}</span>
              </button>
              {user && menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md py-2">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <Link href="/my-tribes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Tribes</Link>

                  {user.role === "ADMIN" && (
                    <>
                      <div className="border-t border-gray-200 my-1"></div>
                      <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold">
                        🔧 Admin Dashboard
                      </Link>
                    </>
                  )}
                  
                  {/* Creator Access for All Users */}
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link href="/creator/login" className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-semibold">
                    🎨 Creator Portal
                  </Link>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign out</button>
                </div>
              )}
            </div>
            <button 
              onClick={onWishlistOpen}
              className="flex flex-col items-center text-gray-700 hover:text-pink-500 relative"
            >
              <Heart size={24} />
              <span className="text-xs font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
            <button 
              onClick={onCartOpen}
              className="flex flex-col items-center text-gray-700 hover:text-pink-500 relative"
            >
              <ShoppingBag size={24} />
              <span className="text-xs font-semibold">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}