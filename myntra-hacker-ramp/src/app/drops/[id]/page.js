"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Heart, Share2, ShoppingCart, Star, Clock, Users,
  Package, Tag, Calendar, TrendingUp, CheckCircle, AlertCircle,
  Eye, Zap, Instagram, Youtube, ExternalLink
} from 'lucide-react';

export default function DropDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchDropDetails(params.id);
    }
  }, [params.id]);

  const fetchDropDetails = async (dropId) => {
    try {
      const response = await fetch(`/api/drops/${dropId}`);
      if (response.ok) {
        const data = await response.json();
        setDrop(data);
        if (data.products && data.products.length > 0) {
          setSelectedProduct(data.products[0]);
        }
      } else {
        console.error('Drop not found');
      }
    } catch (error) {
      console.error('Error fetching drop:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-emerald-100 text-emerald-800';
      case 'upcoming': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (!drop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-slate-900 font-bold text-xl mb-2">Drop Not Found</div>
          <div className="text-slate-600 mb-4">The drop you're looking for doesn't exist or has been removed.</div>
          <button
            onClick={() => router.push('/drops')}
            className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300"
          >
            Back to Drops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/drops')}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{drop.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(drop.status)}`}>
                  {drop.status}
                </span>
              </div>
              <p className="text-slate-300">{drop.description}</p>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-4">
            <img
              src={drop.creator_image || 'https://via.placeholder.com/48x48/e2e8f0/64748b?text=👤'}
              alt={drop.creator_name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/48x48/e2e8f0/64748b?text=👤';
              }}
            />
            <div>
              <div className="font-semibold">{drop.creator_name}</div>
              <div className="text-slate-300 text-sm">Creator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Collection Image */}
            {drop.collection_image && (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
                <img
                  src={drop.collection_image}
                  alt={drop.title}
                  className="w-full h-64 object-cover rounded-2xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x300/e2e8f0/64748b?text=Collection';
                  }}
                />
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Products ({drop.products?.length || 0})</h2>
              
              {drop.products && drop.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {drop.products.map((product, index) => (
                    <div key={index} className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/300x300/e2e8f0/64748b?text=Product'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300/e2e8f0/64748b?text=Product';
                        }}
                      />
                      <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
                      <p className="text-slate-600 text-sm mb-3">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-slate-900">₹{product.price?.toLocaleString()}</span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-slate-500 line-through text-sm">₹{product.original_price?.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{product.category}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                        <span>Stock: {product.stock_quantity}</span>
                        <span>{product.sizes?.length || 0} sizes</span>
                      </div>

                      <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <div className="text-xl font-semibold text-slate-600 mb-2">No products available</div>
                  <div className="text-slate-500">This drop doesn't have any products yet.</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Drop Info */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Drop Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">Launch Date</div>
                    <div className="text-slate-600 text-sm">{formatDate(drop.launch_datetime)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">Total Items</div>
                    <div className="text-slate-600 text-sm">{drop.total_items} products</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">Price Range</div>
                    <div className="text-slate-600 text-sm">
                      ₹{drop.price_range?.min?.toLocaleString()} - ₹{drop.price_range?.max?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {drop.tags && drop.tags.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Tag className="w-5 h-5 text-slate-600 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {drop.tags.map((tag, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Stats</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Eye className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-slate-900">{drop.views || 0}</div>
                  <div className="text-slate-600 text-sm">Views</div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Users className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-slate-900">{drop.sold_count || 0}</div>
                  <div className="text-slate-600 text-sm">Sold</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}