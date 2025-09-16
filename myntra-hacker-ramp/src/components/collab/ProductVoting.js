"use client";

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, Heart, User, Award } from 'lucide-react';

export default function ProductVoting({ session, userName, voteOnItem }) {
  const [votingItem, setVotingItem] = useState(null);
  
  const cartItems = session.items || [];
  
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

  const getVoteScore = (item) => {
    return (item.votes || []).reduce((total, vote) => total + vote.value, 0);
  };

  const getUserVote = (item) => {
    const userVote = (item.votes || []).find(vote => vote.user === userName);
    return userVote ? userVote.value : null;
  };

  const getTopRatedItems = () => {
    return [...cartItems]
      .sort((a, b) => getVoteScore(b) - getVoteScore(a))
      .slice(0, 3);
  };

  const topItems = getTopRatedItems();

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Product Voting
        </h3>
        <p className="text-xs text-gray-500">Vote on products to help your group decide</p>
      </div>

      {/* Top Rated Products */}
      {topItems.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Top Rated in Cart
          </h4>
          <div className="space-y-3">
            {topItems.map((item, index) => {
              const productData = item.productData || item.product || {};
              const voteScore = getVoteScore(item);
              
              return (
                <div key={item._id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {productData.images?.[0] ? (
                        <img
                          src={productData.images[0]}
                          alt={productData.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          👕
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {productData.title || 'Product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Added by {item.addedBy}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Heart className={`w-4 h-4 ${voteScore > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold ${voteScore > 0 ? 'text-red-500' : voteScore < 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                        {voteScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Cart Items for Voting */}
      {cartItems.length > 0 ? (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Vote on Cart Items</h4>
          <div className="space-y-3">
            {cartItems.map((item) => {
              const productData = item.productData || item.product || {};
              const userVote = getUserVote(item);
              const voteScore = getVoteScore(item);
              const isVoting = votingItem === item._id;
              
              return (
                <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {productData.images?.[0] ? (
                        <img
                          src={productData.images[0]}
                          alt={productData.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          👕
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {productData.title || 'Product Name'}
                      </h5>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span>Added by {item.addedBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-green-600">
                          ₹{productData.price?.toLocaleString() || '0'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center space-x-1">
                          <Heart className={`w-3 h-3 ${voteScore > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                          <span className={`text-xs font-bold ${voteScore > 0 ? 'text-red-500' : voteScore < 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                            {voteScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Controls */}
                  {userVote ? (
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
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
                        className="flex items-center justify-center space-x-1 bg-green-100 text-green-700 py-2 px-2 rounded-lg hover:bg-green-200 transition-all duration-300 text-xs font-semibold disabled:opacity-50"
                      >
                        {isVoting ? (
                          <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <ThumbsUp className="w-3 h-3" />
                            <span>Love</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleVote(item._id, -1)}
                        disabled={isVoting}
                        className="flex items-center justify-center space-x-1 bg-red-100 text-red-700 py-2 px-2 rounded-lg hover:bg-red-200 transition-all duration-300 text-xs font-semibold disabled:opacity-50"
                      >
                        {isVoting ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <ThumbsDown className="w-3 h-3" />
                            <span>Pass</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Items to Vote On</h4>
          <p className="text-gray-500 text-sm">Add some products to the cart to start voting!</p>
        </div>
      )}
    </div>
  );
}