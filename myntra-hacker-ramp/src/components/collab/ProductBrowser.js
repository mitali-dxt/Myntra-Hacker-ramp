"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';

export default function ProductBrowser({ session, currentProduct, onProductChange, userName, onCartUpdate, addItem }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.slice(0, 20)); // Limit for demo
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async (product, e) => {
    e.stopPropagation(); // Prevent product selection
    setAddingToCart(product._id);
    
    try {
      await addItem(product); // Pass the full product object as productData
      // Show success feedback
      setTimeout(() => setAddingToCart(null), 1000);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setTimeout(() => setAddingToCart(null), 2000);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search & Filter Bar */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products together..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchQuery ? 'No products found matching your search.' : 'No products available.'}
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => onProductChange(product)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">👗</div>
                        <div className="text-sm">No Image</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-green-600">
                    ₹{product.price?.toLocaleString() || '0'}
                  </div>
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => addToCartHandler(product, e)}
                      disabled={addingToCart === product._id}
                      className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      {addingToCart === product._id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        '+ Add to Cart'
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3">
                    {product.brand}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-bold text-lg">
                      ₹{product.price?.toLocaleString() || '0'}
                    </span>
                    <button 
                      onClick={(e) => addToCartHandler(product, e)}
                      disabled={addingToCart === product._id}
                      className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product._id ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding</span>
                        </div>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                  </div>
                  
                  {/* Product Stats */}
                  {product.discount && (
                    <div className="mt-2 inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}