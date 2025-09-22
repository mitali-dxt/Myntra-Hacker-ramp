"use client";

import { X, Heart, ShoppingCart, Trash2, Star, Plus, Palette, Move, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useCartWishlistContext } from '../contexts/CartWishlistContext';

export default function WishlistDrawer({ isOpen, onClose }) {
  const { cart, wishlist } = useCartWishlistContext();
  const { addToCart } = cart;
  const { 
    wishlistItems, 
    moods,
    removeFromWishlist, 
    clearWishlist, 
    getTotalItems,
    moveToCart,
    moveToMood,
    createMood,
    deleteMood,
    getItemsByMood
  } = wishlist;
  
  const [activeMood, setActiveMood] = useState('general');
  const [showCreateMood, setShowCreateMood] = useState(false);
  const [showMoveProduct, setShowMoveProduct] = useState(null);
  const [newMoodName, setNewMoodName] = useState('');
  const [newMoodColor, setNewMoodColor] = useState('#6b7280');
  
  const totalItems = getTotalItems();
  const activeMoodItems = getItemsByMood(activeMood);
  const activeMoodData = moods.find(mood => mood.id === activeMood);

  const moodColors = [
    '#6b7280', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', 
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
  ];

  const handleMoveToCart = (productId) => {
    moveToCart(productId, addToCart);
  };

  const handleCreateMood = () => {
    if (newMoodName.trim()) {
      createMood(newMoodName.trim(), newMoodColor);
      setNewMoodName('');
      setNewMoodColor('#6b7280');
      setShowCreateMood(false);
    }
  };

  const handleMoveProduct = (productId, newMoodId) => {
    moveToMood(productId, newMoodId);
    setShowMoveProduct(null);
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

        {/* Mood Tabs */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Moods</h3>
            <button
              onClick={() => setShowCreateMood(true)}
              className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeMood === mood.id
                    ? 'bg-slate-800 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: mood.color }}
                />
                <span>{mood.name}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                  {mood.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {activeMoodItems.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No items in {activeMoodData?.name}
              </h3>
              <p className="text-slate-600 mb-6">
                {activeMood === 'general' 
                  ? 'Save items you love for later!' 
                  : `Add items to your ${activeMoodData?.name} Mood`}
              </p>
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
                {activeMoodItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 p-4 bg-slate-50 rounded-2xl relative">
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
                          onClick={() => setShowMoveProduct(item.product._id)}
                          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                        >
                          <Move className="w-3 h-3" />
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
                {/* Clear Collection Button */}
                {activeMoodItems.length > 0 && (
                  <button
                    onClick={() => {
                      activeMoodItems.forEach(item => removeFromWishlist(item.product._id));
                    }}
                    className="w-full text-red-600 text-sm font-semibold hover:text-red-700 transition-colors"
                  >
                    Clear {activeMoodData?.name} Mood
                  </button>
                )}

                {/* Move All to Cart */}
                {activeMoodItems.length > 0 && (
                  <button 
                    onClick={() => {
                      activeMoodItems.forEach(item => {
                        addToCart(item.product);
                        removeFromWishlist(item.product._id);
                      });
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Move All to Bag</span>
                  </button>
                )}

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

        {/* Create Mood Modal */}
        {showCreateMood && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 w-80 mx-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Moods</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mood Name</label>
                  <input
                    type="text"
                    value={newMoodName}
                    onChange={(e) => setNewMoodName(e.target.value)}
                    placeholder="e.g., Date Night, Vacation"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                  <div className="flex space-x-2">
                    {moodColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewMoodColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newMoodColor === color ? 'border-slate-800' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateMood(false)}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMood}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Product Modal */}
        {showMoveProduct && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 w-80 mx-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Move to Wishlist💓</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {moods.filter(mood => mood.id !== activeMood).map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoveProduct(showMoveProduct, mood.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: mood.color }}
                    />
                    <span className="font-medium text-slate-900">{mood.name}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {mood.items.length} items
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowMoveProduct(null)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}