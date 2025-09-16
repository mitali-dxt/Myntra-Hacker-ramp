"use client";

import { useState } from 'react';
import { Plus, Trash2, ThumbsUp, ThumbsDown, Gift, ShoppingBag, User, Heart } from 'lucide-react';

export default function SharedCart({ session, userName, removeItem, voteOnItem }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [votingItem, setVotingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    productId: '',
    size: '',
    color: '',
    notes: ''
  });

  const cartItems = session.items || [];
  const totalItems = cartItems.length;
  const totalValue = cartItems.reduce((sum, item) => {
    const price = item.productData?.price || item.product?.price || 0;
    return sum + price;
  }, 0);

  const handleAddItem = async () => {
    if (!newItem.productId.trim()) return;

    try {
      const res = await fetch("/api/collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addItem",
          code: session.code,
          productId: newItem.productId,
          size: newItem.size,
          color: newItem.color,
          notes: newItem.notes,
          userName
        })
      });

      if (res.ok) {
        const updatedSession = await res.json();
        onCartUpdate(updatedSession);
        setNewItem({ productId: '', size: '', color: '', notes: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleVote = async (itemId, value) => {
    setVotingItem(itemId);
    try {
      await voteOnItem(itemId, value);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const getVoteScore = (item) => {
    return (item.votes || []).reduce((total, vote) => total + vote.value, 0);
  };

  const hasUserVoted = (item) => {
    return (item.votes || []).some(vote => vote.user === userName);
  };

  const getUserVote = (item) => {
    const userVote = (item.votes || []).find(vote => vote.user === userName);
    return userVote ? userVote.value : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Shared Cart</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all duration-300 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{totalItems}</div>
            <div className="text-xs text-gray-600">Items</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Product URL or ID</label>
              <input
                type="text"
                value={newItem.productId}
                onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                placeholder="Paste Myntra product URL or ID"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Size</label>
                <input
                  type="text"
                  value={newItem.size}
                  onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                  placeholder="M, L, XL"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={newItem.color}
                  onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                  placeholder="Red, Blue"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                placeholder="For the party on Saturday..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300 font-semibold text-sm"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Empty Cart</h4>
            <p className="text-gray-500 text-sm mb-4">Start adding items to shop together!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cartItems.map((item) => {
              const productData = item.productData || item.product || {};
              const userVote = getUserVote(item);
              const voteScore = getVoteScore(item);
              const isVoting = votingItem === item._id;
              
              return (
                <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  {/* Item Header with Image */}
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {productData.images?.[0] ? (
                        <img
                          src={productData.images[0]}
                          alt={productData.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          👕
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {productData.title || 'Product Name'}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span>Added by {item.addedBy}</span>
                      </div>
                      {productData.brand && (
                        <div className="text-xs text-gray-600 mb-2">
                          Brand: {productData.brand}
                        </div>
                      )}
                      {(item.size || item.color) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.size && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Price and Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-green-600 mb-1">
                        ₹{productData.price?.toLocaleString() || '0'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className={`w-4 h-4 ${voteScore > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        <span className={`text-sm font-bold ${voteScore > 0 ? 'text-red-500' : voteScore < 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                          {voteScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r-lg">
                      <p className="text-sm text-yellow-800">💡 {item.notes}</p>
                    </div>
                  )}

                  {/* Voting Section */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">Community Vote</span>
                      <span className="text-xs text-gray-500">
                        {(item.votes || []).length} vote{(item.votes || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {userVote ? (
                      <div className="text-center py-2">
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          You voted: {userVote === 1 ? '❤️ Love it!' : '👎 Not for me'}
                        </div>
                        <button
                          onClick={() => handleVote(item._id, userVote === 1 ? -1 : 1)}
                          disabled={isVoting}
                          className="text-xs text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50"
                        >
                          {isVoting ? 'Changing...' : 'Change Vote'}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleVote(item._id, 1)}
                          disabled={isVoting}
                          className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg hover:bg-emerald-200 transition-all duration-300 text-sm font-semibold disabled:opacity-50"
                        >
                          {isVoting ? (
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <ThumbsUp className="w-4 h-4" />
                              <span>Love it!</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleVote(item._id, -1)}
                          disabled={isVoting}
                          className="flex items-center justify-center space-x-2 bg-rose-100 text-rose-700 py-2 px-3 rounded-lg hover:bg-rose-200 transition-all duration-300 text-sm font-semibold disabled:opacity-50"
                        >
                          {isVoting ? (
                            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <ThumbsDown className="w-4 h-4" />
                              <span>Pass</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {item.addedBy !== userName && (
                        <button className="flex items-center space-x-1 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg hover:bg-pink-200 transition-all duration-300 text-xs font-semibold">
                          <Gift className="w-3 h-3" />
                          <span>Gift This</span>
                        </button>
                      )}
                      <button 
                        onClick={() => window.open(productData.url || '#', '_blank')}
                        className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-all duration-300 text-xs font-semibold"
                      >
                        <span>View Product</span>
                      </button>
                    </div>

                    {item.addedBy === userName && (
                      <button 
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout Actions */}
      {cartItems.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-2xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Split & Checkout (₹{totalValue.toLocaleString()})
            </button>
            <button className="w-full bg-white text-gray-700 border-2 border-gray-200 py-2 px-4 rounded-xl font-semibold hover:border-gray-300 transition-all duration-300">
              Save for Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}