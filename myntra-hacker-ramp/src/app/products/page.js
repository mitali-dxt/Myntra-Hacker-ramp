"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Filter, Heart, ShoppingCart, Star, Grid, List, X, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCartId, setAddedToCartId] = useState(null);
  
  // Cart and Wishlist hooks
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedGender, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = "/api/products";
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedGender) params.append("gender", selectedGender);
      if (searchQuery) params.append("q", searchQuery);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };
  
  const handleAddToCart = (product, size = "", color = "", qty = 1) => {
    try {
      addToCart(product, size, color, qty);
      // Show success feedback
      setAddedToCartId(product._id);
      setTimeout(() => setAddedToCartId(null), 2000); // Clear after 2 seconds
      console.log(`Added ${product.title} to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || "");
    setSelectedColor(product.colors?.[0] || "");
    setQuantity(1);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const getDiscountPercentage = (price, mrp) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const categories = ["Tops", "Bottoms", "Dresses", "Footwear", "Accessories", "Jackets"];
  const genders = ["MEN", "WOMEN", "UNISEX"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-slate-300 mt-2">Discover amazing products from our collection</p>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:bg-white/20 focus:border-white/40 focus:outline-none w-64"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Filters:</span>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Genders</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-amber-500 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-amber-500 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
                <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {products.map(product => (
              <div key={product._id} className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400/e2e8f0/64748b?text=Product';
                      }}
                    />
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-20"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        isInWishlist(product._id) 
                          ? "text-red-500 fill-current" 
                          : "text-slate-600"
                      }`} 
                    />
                  </button>

                  {/* Discount Badge */}
                  {getDiscountPercentage(product.price, product.mrp) > 0 && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold z-20">
                      {getDiscountPercentage(product.price, product.mrp)}% OFF
                    </div>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center space-x-2 shadow-lg ${
                        addedToCartId === product._id 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white text-slate-900 hover:bg-amber-500 hover:text-white"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{addedToCartId === product._id ? "Added!" : "Add to Cart"}</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm text-slate-500 mb-1">{product.brand}</div>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                  
                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                      <span className="text-sm text-slate-500">({product.ratingCount || 0})</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold text-slate-900">₹{product.price?.toLocaleString()}</span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-slate-500 line-through text-sm">₹{product.mrp?.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.sizes.slice(0, 4).map((size, index) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="text-xs text-slate-500">+{product.sizes.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button 
                    onClick={() => openProductModal(product)}
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedGender("");
                fetchProducts();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold text-slate-900">Product Details</h2>
              <button
                onClick={closeProductModal}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
                    {selectedProduct.images?.[0] && (
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x500/e2e8f0/64748b?text=Product';
                        }}
                      />
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleWishlist(selectedProduct)}
                      className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <Heart 
                        className={`w-6 h-6 transition-colors ${
                          isInWishlist(selectedProduct._id) 
                            ? "text-red-500 fill-current" 
                            : "text-slate-600"
                        }`} 
                      />
                    </button>

                    {/* Discount Badge */}
                    {getDiscountPercentage(selectedProduct.price, selectedProduct.mrp) > 0 && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold">
                        {getDiscountPercentage(selectedProduct.price, selectedProduct.mrp)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                          <Image
                            src={image}
                            alt={`${selectedProduct.title} ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                  {/* Brand and Title */}
                  <div>
                    <div className="text-lg font-medium text-slate-600 mb-1">{selectedProduct.brand}</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">{selectedProduct.title}</h1>
                    <p className="text-slate-700 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedProduct.rating || 0) 
                              ? "text-amber-500 fill-current" 
                              : "text-slate-300"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-slate-600">
                      {selectedProduct.rating || 0} ({selectedProduct.ratingCount || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-slate-900">₹{selectedProduct.price?.toLocaleString()}</span>
                    {selectedProduct.mrp && selectedProduct.mrp > selectedProduct.price && (
                      <>
                        <span className="text-xl text-slate-500 line-through">₹{selectedProduct.mrp?.toLocaleString()}</span>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                          {getDiscountPercentage(selectedProduct.price, selectedProduct.mrp)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Colors */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                              selectedColor === color
                                ? "border-amber-500 bg-amber-50 text-amber-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Size</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.sizes.map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 rounded-xl border-2 font-medium transition-all ${
                              selectedSize === size
                                ? "border-amber-500 bg-amber-50 text-amber-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Quantity</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decrementQuantity}
                        className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, index) => (
                          <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedProduct.inStock ? "bg-emerald-500" : "bg-red-500"}`}></div>
                    <span className={`font-medium ${selectedProduct.inStock ? "text-emerald-700" : "text-red-700"}`}>
                      {selectedProduct.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      disabled={!selectedProduct.inStock}
                      onClick={() => handleAddToCart(selectedProduct, selectedSize, selectedColor, quantity)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span>{isInCart(selectedProduct._id, selectedSize, selectedColor) ? 'Update Cart' : 'Add to Cart'}</span>
                    </button>
                    
                    <button className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105">
                      Buy Now
                    </button>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-slate-900">Free Delivery</div>
                      <div className="text-xs text-slate-600">On orders above ₹499</div>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-slate-900">Easy Returns</div>
                      <div className="text-xs text-slate-600">15 days return policy</div>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-slate-900">Secure Payment</div>
                      <div className="text-xs text-slate-600">100% secure payments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


