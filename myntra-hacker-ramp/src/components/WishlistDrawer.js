"use client";

import { X, Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import Image from 'next/image';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

export default function WishlistDrawer({ isOpen, onClose }) {
  const { 
    wishlistItems, 
    removeFromWishlist, 
    clearWishlist, 
    getTotalItems,
    moveToCart 
  } = useWishlist();
  
  const { addToCart } = useCart();
  
  const totalItems = getTotalItems();

  const handleMoveToCart = (productId) => {
    moveToCart(productId, addToCart);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <h2 className="text-2xl font-bold text-slate-900">
              Wishlist ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {wishlistItems.length === 0 ? (
            /* Empty Wishlist */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your wishlist is empty</h3>
              <p className="text-slate-600 mb-6">Save items you love for later!</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Wishlist Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 p-4 bg-slate-50 rounded-2xl">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <Image
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/e2e8f0/64748b?text=Product';
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {item.product.mrp && item.product.price && item.product.mrp > item.product.price && (
                        <div className="absolute top-1 left-1 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {Math.round(((item.product.mrp - item.product.price) / item.product.mrp) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-slate-600 mb-1">{item.product.brand}</p>
                      
                      {/* Rating */}
                      {item.product.rating && (
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span className="text-xs text-slate-600">{item.product.rating}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="font-bold text-slate-900 text-sm">₹{item.product.price?.toLocaleString()}</span>
                        {item.product.mrp && item.product.mrp > item.product.price && (
                          <span className="text-xs text-slate-500 line-through">₹{item.product.mrp?.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMoveToCart(item.product._id)}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center space-x-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>
                        
                        <button
                          onClick={() => removeFromWishlist(item.product._id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-6 space-y-4">
                {/* Clear Wishlist Button */}
                {wishlistItems.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    className="w-full text-red-600 text-sm font-semibold hover:text-red-700 transition-colors"
                  >
                    Clear All Items
                  </button>
                )}

                {/* Move All to Cart */}
                <button 
                  onClick={() => {
                    wishlistItems.forEach(item => {
                      addToCart(item.product);
                    });
                    clearWishlist();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Move All to Bag</span>
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}