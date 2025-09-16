"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, X, Calendar, Clock, DollarSign, 
  Package, Tag, Eye, Star, Image, Trash2, Edit3, AlertCircle,
  CheckCircle, Loader, Search, Filter
} from 'lucide-react';

export default function CreateDropPage() {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dropData, setDropData] = useState({
    title: '',
    description: '',
    launch_datetime: '',
    status: 'draft',
    price_range: { min: 0, max: 0 },
    tags: [],
    products: [],
    collection_image: '',
    is_featured: false,
    commission_rate: 15
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if creator is logged in
    const token = localStorage.getItem('creator_token');
    const creatorData = localStorage.getItem('creator_user');
    
    if (!token || !creatorData) {
      router.push('/creator/login');
      return;
    }

    setCreator(JSON.parse(creatorData));
    fetchAvailableProducts();
  }, [router]);

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const apiProducts = await response.json();
        console.log('Fetched products from API:', apiProducts);
        
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
        
        console.log('Mapped products:', mappedProducts);
        setAvailableProducts(mappedProducts);
      } else {
        // Mock products for demo
        const mockProducts = getMockProducts();
        console.log('Using mock products:', mockProducts);
        setAvailableProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const mockProducts = getMockProducts();
      console.log('Using mock products (fallback):', mockProducts);
      setAvailableProducts(mockProducts);
    }
  };

  const getMockProducts = () => [
    {
      _id: '1',
      name: 'Oversized Graphic T-Shirt',
      description: 'Comfortable cotton blend graphic tee with unique streetwear design',
      price: 1299,
      original_price: 1899,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      category: 'tops',
      brand: 'UrbanStyle',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Gray'],
      stock_quantity: 50
    },
    {
      _id: '2',
      name: 'Slim Fit Denim Jeans',
      description: 'Classic blue denim jeans with modern slim fit',
      price: 2499,
      original_price: 3499,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
      category: 'bottoms',
      brand: 'DenimCo',
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Blue', 'Black', 'Light Blue'],
      stock_quantity: 35
    },
    {
      _id: '3',
      name: 'Casual Sneakers',
      description: 'Comfortable white sneakers perfect for everyday wear',
      price: 3999,
      original_price: 5499,
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
      category: 'footwear',
      brand: 'SneakerHub',
      sizes: ['7', '8', '9', '10', '11'],
      colors: ['White', 'Black', 'Gray'],
      stock_quantity: 25
    },
    {
      _id: '4',
      name: 'Summer Floral Dress',
      description: 'Light and breezy floral dress perfect for summer',
      price: 1899,
      original_price: 2799,
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      category: 'dresses',
      brand: 'FloralFashion',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Pink', 'Blue', 'Yellow'],
      stock_quantity: 20
    },
    {
      _id: '5',
      name: 'Leather Crossbody Bag',
      description: 'Stylish leather crossbody bag with adjustable strap',
      price: 2799,
      original_price: 3999,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      category: 'accessories',
      brand: 'LeatherCraft',
      sizes: ['One Size'],
      colors: ['Brown', 'Black', 'Tan'],
      stock_quantity: 15
    },
    {
      _id: '6',
      name: 'Hooded Sweatshirt',
      description: 'Cozy cotton hooded sweatshirt with kangaroo pocket',
      price: 1799,
      original_price: 2499,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
      category: 'tops',
      brand: 'ComfyWear',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Gray', 'Navy', 'Black'],
      stock_quantity: 40
    }
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!dropData.title.trim()) newErrors.title = 'Title is required';
    if (!dropData.description.trim()) newErrors.description = 'Description is required';
    if (!dropData.launch_datetime) newErrors.launch_datetime = 'Launch date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (selectedProducts.length === 0) {
      newErrors.products = 'At least one product must be selected';
    } else {
      // Validate each selected product has required fields
      const invalidProducts = selectedProducts.filter(product => 
        !product.name || 
        !product.stock_quantity || 
        isNaN(product.price) || 
        isNaN(product.stock_quantity)
      );
      
      if (invalidProducts.length > 0) {
        newErrors.products = `Some selected products are missing required data (name, price, or stock quantity)`;
        console.error('Invalid products:', invalidProducts);
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setDropData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !dropData.tags.includes(newTag.trim().toLowerCase())) {
      setDropData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setDropData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleProductSelection = (product) => {
    // Validate product has required fields
    if (!product.name || !product.stock_quantity || isNaN(product.price)) {
      console.error('Invalid product data:', product);
      setErrors({ products: 'Selected product is missing required data' });
      return;
    }

    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p._id === product._id);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(p => p._id !== product._id);
      } else {
        newSelection = [...prev, product];
      }
      
      // Update price range based on selected products
      if (newSelection.length > 0) {
        const prices = newSelection.map(p => Number(p.price));
        setDropData(prevData => ({
          ...prevData,
          price_range: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          products: newSelection
        }));
      } else {
        setDropData(prevData => ({
          ...prevData,
          price_range: { min: 0, max: 0 },
          products: []
        }));
      }
      
      // Clear any previous errors
      if (errors.products) {
        setErrors(prev => ({ ...prev, products: '' }));
      }
      
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

  const handleSaveDrop = async (isDraft = true) => {
    setLoading(true);
    
    try {
      // Debug: Log selected products
      console.log('Selected products:', selectedProducts);
      
      // Properly format products for database validation
      const formattedProducts = selectedProducts.map(product => {
        const formatted = {
          name: product.name || '',  // Ensure name is included
          description: product.description || '',
          price: Number(product.price) || 0,
          original_price: Number(product.original_price || product.price) || 0,
          image_url: product.image_url || '',
          category: product.category || '',
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          stock_quantity: Number(product.stock_quantity) || 0,  // Ensure it's a number, not null
          sold_quantity: 0,
          is_exclusive: false,
          limited_quantity: false,
          rating: Number(product.rating) || 0
        };
        
        // Debug: Log each formatted product
        console.log('Original product:', product);
        console.log('Formatted product:', formatted);
        return formatted;
      });

      const dropPayload = {
        title: dropData.title,
        description: dropData.description,
        launch_datetime: dropData.launch_datetime,
        status: isDraft ? 'draft' : 'scheduled',
        products: formattedProducts,  // Use the formatted products
        tags: dropData.tags,
        collection_image: dropData.collection_image,
        is_featured: dropData.is_featured,
        commission_rate: dropData.commission_rate
      };

      // Debug: Log the complete payload
      console.log('Drop payload:', dropPayload);

      const response = await fetch('/api/creator/drops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('creator_token')}`
        },
        body: JSON.stringify(dropPayload)
      });

      if (response.ok) {
        const drop = await response.json();
        console.log('Drop created successfully:', drop);
        router.push('/creator/dashboard?tab=drops');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to save drop');
      }
    } catch (error) {
      console.error('Error saving drop:', error);
      setErrors({ submit: `Failed to save drop: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-slate-600 animate-spin mx-auto mb-4" />
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Create New Drop</h1>
              <p className="text-slate-300">Build your exclusive collection</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-8">
            {[
              { step: 1, title: 'Basic Info', icon: Package },
              { step: 2, title: 'Select Products', icon: Star },
              { step: 3, title: 'Review', icon: CheckCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white/10 text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${
                  currentStep >= step ? 'text-white' : 'text-slate-300'
                }`}>
                  {title}
                </span>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ${
                    currentStep > step ? 'bg-amber-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    value={dropData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="e.g., Midnight Vibes Collection"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={dropData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-slate-200'
                    }`}
                    rows="4"
                    placeholder="Describe your collection and what makes it special..."
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Launch Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={dropData.launch_datetime}
                    onChange={(e) => handleInputChange('launch_datetime', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.launch_datetime ? 'border-red-300' : 'border-slate-200'
                    }`}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.launch_datetime && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.launch_datetime}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={dropData.commission_rate}
                    onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <p className="text-slate-600 text-sm mt-1">Your earning percentage per sale</p>
                </div>
              </div>

              {/* Collection Image */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Collection Cover Image URL
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={dropData.collection_image}
                    onChange={(e) => handleInputChange('collection_image', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/collection-cover.jpg"
                  />
                  {dropData.collection_image && (
                    <div className="relative">
                      <img 
                        src={dropData.collection_image} 
                        alt="Collection cover preview"
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x300/e2e8f0/64748b?text=Collection+Cover';
                        }}
                      />
                      <button
                        onClick={() => setDropData(prev => ({ ...prev, collection_image: '' }))}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dropData.tags.map(tag => (
                    <span key={tag} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Add tag (e.g., streetwear, summer)"
                  />
                  <button
                    onClick={addTag}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={dropData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded"
                />
                <label htmlFor="featured" className="text-slate-900 font-medium">
                  Feature this drop on homepage
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Select Products */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Select Products</h2>
                <div className="text-sm text-slate-600">
                  {selectedProducts.length} products selected
                </div>
              </div>

              {errors.products && (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.products}</span>
                </p>
              )}

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Selected Products ({selectedProducts.length})</h3>
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
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-amber-800">
                      Price Range: ₹{dropData.price_range.min.toLocaleString()} - ₹{dropData.price_range.max.toLocaleString()}
                    </span>
                    <span className="text-amber-800">
                      Total Stock: {selectedProducts.reduce((sum, p) => sum + p.stock_quantity, 0)} items
                    </span>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="w-full h-48 object-cover rounded-xl mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x500/e2e8f0/64748b?text=No+Image';
                        }}
                      />

                      {/* Product Info */}
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-slate-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                          {product.original_price > product.price && (
                            <span className="text-slate-500 line-through text-sm">₹{product.original_price.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{product.brand}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600">
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
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No products found</h3>
                  <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Launch</h2>

              {/* Drop Summary */}
              <div className="border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Drop Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                    <div className="text-slate-900">{dropData.title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Launch Date</label>
                    <div className="text-slate-900">
                      {new Date(dropData.launch_datetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Total Products</label>
                    <div className="text-slate-900">{selectedProducts.length} items</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Price Range</label>
                    <div className="text-slate-900">
                      ₹{dropData.price_range.min.toLocaleString()} - ₹{dropData.price_range.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Products Preview */}
              <div className="border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Selected Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProducts.map(product => (
                    <div key={product._id} className="border border-slate-200 rounded-xl p-3">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200/e2e8f0/64748b?text=No+Image';
                        }}
                      />
                      <h4 className="font-medium text-slate-900 text-sm mb-1">{product.name}</h4>
                      <div className="text-sm text-slate-600">₹{product.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-red-800">{errors.submit}</div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === 3 && (
                <button
                  onClick={() => handleSaveDrop(true)}
                  disabled={loading}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save as Draft</span>
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => handleSaveDrop(false)}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Schedule Drop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}