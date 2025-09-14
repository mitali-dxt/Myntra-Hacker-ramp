"use client";

import { Heart, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link'; // Use Next.js Link for navigation

export default function Header() {
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
              {['MEN', 'WOMEN', 'KIDS', 'HOME & LIVING', 'BEAUTY'].map(item => (
                <Link key={item} href="#" className="font-bold text-sm text-gray-700 uppercase tracking-wider border-b-4 border-transparent hover:border-pink-500 pb-1 transition-all">
                  {item}
                </Link>
              ))}
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
            <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-pink-500">
              <User size={24} />
              <span className="text-xs font-semibold">Profile</span>
            </Link>
            <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-pink-500">
              <Heart size={24} />
              <span className="text-xs font-semibold">Wishlist</span>
            </Link>
            <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-pink-500">
              <ShoppingBag size={24} />
              <span className="text-xs font-semibold">Bag</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}