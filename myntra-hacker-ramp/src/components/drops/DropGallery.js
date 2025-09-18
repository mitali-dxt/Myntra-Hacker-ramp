"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Heart, Zap, Star } from 'lucide-react';

export default function DropGallery({ drop, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  if (!drop.products || drop.products.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % drop.products.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + drop.products.length) % drop.products.length);
  };

  const currentProduct = drop.products[currentIndex];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Main Product Display */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation Arrows */}
        {drop.products.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </>
        )}

        {/* Product Image */}
        <div className="relative w-full h-full group">
          <img
            src={currentProduct.image_url || '/api/placeholder/400/500'}
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h4 className="font-bold text-slate-900 mb-2">{currentProduct.name}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{currentProduct.price?.toLocaleString()}
                  </span>
                  {currentProduct.original_price && currentProduct.original_price > currentProduct.price && (
                    <span className="text-gray-500 line-through text-sm">
                      ₹{currentProduct.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <Heart className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {drop.status === 'live' && (
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Live Now</span>
              </div>
            )}
            {currentProduct.is_exclusive && (
              <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Exclusive
              </div>
            )}
            {currentProduct.limited_quantity && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Limited
              </div>
            )}
          </div>

          {/* Rating */}
          {currentProduct.rating && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <span className="text-xs font-semibold text-slate-700">{currentProduct.rating}</span>
            </div>
          )}
        </div>

        {/* Pagination Dots */}
        {drop.products.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {drop.products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Thumbnails */}
      {drop.products.length > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-4 gap-3">
            {drop.products.slice(0, 4).map((product, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                onMouseEnter={() => setHoveredProduct(index)}
                onMouseLeave={() => setHoveredProduct(null)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-amber-500 scale-105'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img
                  src={product.image_url || '/api/placeholder/150/150'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hoveredProduct === index && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-xs font-semibold text-center px-2">
                      <div>{product.name}</div>
                      <div>₹{product.price?.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {drop.products.length > 4 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-slate-600">
                +{drop.products.length - 4} more items
              </span>
            </div>
          )}
        </div>
      )}

      {/* Collection Summary */}
      <div className="p-6 bg-white border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">{drop.title} Collection</h3>
            <p className="text-gray-600 text-sm">
              {drop.products.length} exclusive pieces
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Starting from</div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{Math.min(...drop.products.map(p => p.price || 0)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-gradient-to-r from-slate-600 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105">
            View Collection
          </button>
          <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}