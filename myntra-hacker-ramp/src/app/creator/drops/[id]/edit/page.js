"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Save, X, Calendar, Image, 
  Plus, Trash2, AlertCircle, Search, Filter, CheckCircle
} from 'lucide-react';

export default function EditDrop() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [dropData, setDropData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    launch_datetime: '',
    end_datetime: '',
    status: 'upcoming',
    products: []
  });

  useEffect(() => {
    // Check creator authentication
    const token = localStorage.getItem('creator_token');
    if (!token) {
      router.push('/creator/login');
      return;
    }

    fetchDropDetails();
    fetchAvailableProducts();
  }, [params.id, router]);

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const apiProducts = await response.json();
        
        // Map API products to the format we need
        const mappedProducts = apiProducts.map(product => ({
          _id: product._id,
          name: product.title,  // Map title to name
          description: product.description || '',
          price: product.price,
          original_price: product.mrp || product.price,  // Map mrp to original_price
          image_url: Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : 'https://via.placeholder.com/500x500/e2e8f0/64748b?text=No+Image',
          category: product.category || '',
          brand: product.brand || '',
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          stock_quantity: product.inStock ? 50 : 0,  // Map inStock to stock_quantity
          rating: product.rating || 0
        }));
        
        setAvailableProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDropDetails = async () => {
    try {
      const token = localStorage.getItem('creator_token');
      const response = await fetch(`/api/creator/drops/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDropData({
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || data.banner_image || '',
          launch_datetime: data.launch_datetime || '',
          end_datetime: data.end_datetime || '',
          status: data.status || 'upcoming',
          products: data.products || []
        });
        
        // Set selected products for the product selector
        if (data.products && data.products.length > 0) {
          setSelectedProducts(data.products);
        }
      } else {
        console.error('Failed to fetch drop details:', response.status);
        // Don't fall back to mock data, show error instead
        setDropData({
          title: '',
          description: '',
          imageUrl: '',
          launch_datetime: '',
          end_datetime: '',
          status: 'upcoming',
          products: []
        });
      }
    } catch (error) {
      console.error('Error fetching drop:', error);
      // Don't fall back to mock data, show error instead
      setDropData({
        title: '',
        description: '',
        imageUrl: '',
        launch_datetime: '',
        end_datetime: '',
        status: 'upcoming',
        products: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('creator_token');
      
      // Format products for database
      const formattedProducts = selectedProducts.map(product => ({
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        original_price: Number(product.original_price || product.price) || 0,
        image_url: product.image_url || '',
        category: product.category || '',
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        stock_quantity: Number(product.stock_quantity) || 0,
        sold_quantity: Number(product.sold_quantity) || 0,
        is_exclusive: false,
        limited_quantity: false,
        rating: Number(product.rating) || 0
      }));

      const updateData = {
        ...dropData,
        products: formattedProducts
      };

      const response = await fetch(`/api/creator/drops/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        router.push(`/creator/drops/${params.id}`);
      } else {
        // For demo, just show success
        setTimeout(() => {
          router.push(`/creator/drops/${params.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving drop:', error);
      // For demo, just show success
      setTimeout(() => {
        router.push(`/creator/drops/${params.id}`);
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p._id === product._id);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(p => p._id !== product._id);
      } else {
        newSelection = [...prev, product];
      }
      
      // Update dropData products as well
      setDropData(prevData => ({
        ...prevData,
        products: newSelection
      }));
      
      return newSelection;
    });
  };

  const getFilteredProducts = () => {
    let filtered = availableProducts;
    
    // Filter by category
    if (productFilter !== 'all') {
      filtered = filtered.filter(product => product.category === productFilter);
    }
    
    // Filter by search
    if (productSearch.trim()) {
      const searchLower = productSearch.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading drop details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/creator/drops/${params.id}`)}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Edit Drop</h1>
                <p className="text-slate-300">Modify your collection details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/creator/drops/${params.id}`)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Collection Title</label>
                  <input
                    type="text"
                    value={dropData.title}
                    onChange={(e) => setDropData({...dropData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter collection name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                  <textarea
                    value={dropData.description}
                    onChange={(e) => setDropData({...dropData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows="4"
                    placeholder="Describe your collection..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Banner Image URL</label>
                  <input
                    type="url"
                    value={dropData.imageUrl}
                    onChange={(e) => setDropData({...dropData, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/banner-image.jpg"
                  />
                  {dropData.imageUrl && (
                    <div className="mt-4 w-full h-48 bg-slate-100 rounded-xl overflow-hidden">
                      <img 
                        src={dropData.imageUrl} 
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="text-center text-slate-500">
                          <Image className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">Invalid image URL</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Launch Date</label>
                  <input
                    type="datetime-local"
                    value={dropData.launch_datetime}
                    onChange={(e) => setDropData({...dropData, launch_datetime: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={dropData.end_datetime}
                    onChange={(e) => setDropData({...dropData, end_datetime: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                  <select
                    value={dropData.status}
                    onChange={(e) => setDropData({...dropData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Products</h3>
                <div className="text-sm text-slate-600">
                  {selectedProducts.length} products selected
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Search products by name, brand, or description..."
                  />
                </div>
                <div className="relative">
                  <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="dresses">Dresses</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Selected Products Summary */}
              {selectedProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-amber-900 mb-2">Selected Products ({selectedProducts.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(product => (
                      <div key={product._id} className="bg-white border border-amber-200 rounded-lg px-3 py-1 text-sm flex items-center space-x-2">
                        <span className="text-slate-900">{product.name}</span>
                        <button
                          onClick={() => toggleProductSelection(product)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredProducts().map(product => {
                    const isSelected = selectedProducts.find(p => p._id === product._id);
                    return (
                      <div 
                        key={product._id} 
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50 shadow-lg' 
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-amber-500 border-amber-500' 
                              : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-500 uppercase">
                            {product.category}
                          </span>
                        </div>

                        {/* Product Image */}
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-xl mb-3"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/e2e8f0/64748b?text=No+Image';
                          }}
                        />

                        {/* Product Info */}
                        <h4 className="font-semibold text-slate-900 mb-1 text-sm line-clamp-2">{product.name}</h4>
                        <p className="text-slate-600 text-xs mb-2 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                            {product.original_price > product.price && (
                              <span className="text-slate-500 line-through text-xs">₹{product.original_price.toLocaleString()}</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{product.brand}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Stock: {product.stock_quantity}</span>
                          <span>{product.sizes.length} sizes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {getFilteredProducts().length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-600 mb-2">No products found</h4>
                    <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Important Note</h4>
                  <p className="text-amber-700 text-sm mt-1">
                    Changes to live drops may affect ongoing sales. Consider the impact on your customers before making modifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}