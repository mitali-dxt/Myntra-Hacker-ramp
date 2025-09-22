"use client";

import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCartWishlistContext } from '../contexts/CartWishlistContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart } = useCartWishlistContext();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = cart;

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

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
            <ShoppingCart className="w-6 h-6 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-900">
              Shopping Bag ({totalItems})
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
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your bag is empty</h3>
              <p className="text-slate-600 mb-6">Add some products to get started!</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.map((item) => (
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
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-slate-600 mb-1">{item.product.brand}</p>
                      
                      {/* Size and Color */}
                      <div className="flex space-x-2 text-xs text-slate-600 mb-2">
                        {item.selectedSize && (
                          <span className="bg-white px-2 py-1 rounded">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-white px-2 py-1 rounded">Color: {item.selectedColor}</span>
                        )}
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">₹{item.product.price?.toLocaleString()}</span>
                          {item.product.mrp && item.product.mrp > item.product.price && (
                            <span className="text-xs text-slate-500 line-through">₹{item.product.mrp?.toLocaleString()}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-6 space-y-4">
                {/* Clear Cart Button */}
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-red-600 text-sm font-semibold hover:text-red-700 transition-colors"
                  >
                    Clear All Items
                  </button>
                )}

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold text-slate-900 py-3 border-t border-slate-200">
                  <span>Total ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105">
                  Proceed to Checkout
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