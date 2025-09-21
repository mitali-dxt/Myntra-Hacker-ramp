"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, Eye, Users, TrendingUp, Calendar, 
  Edit3, ShoppingBag, Clock, DollarSign 
} from 'lucide-react';

export default function ViewDrop() {
  const params = useParams();
  const router = useRouter();
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check creator authentication
    const token = localStorage.getItem('creator_token');
    if (!token) {
      router.push('/creator/login');
      return;
    }

    fetchDropDetails();
  }, [params.id, router]);

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
        setDrop(data);
      } else {
        console.error('Failed to fetch drop details:', response.status);
        setDrop(null);
      }
    } catch (error) {
      console.error('Error fetching drop:', error);
      setDrop(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'upcoming': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Drop Not Found</h2>
          <p className="text-slate-600 mb-6">The drop you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/creator/dashboard')}
            className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300"
          >
            Back to Dashboard
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/creator/dashboard')}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{drop.title}</h1>
                <p className="text-slate-300">Drop Details & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(drop.status)}`}>
                {drop.status}
              </span>
              <button
                onClick={() => router.push(`/creator/drops/${params.id}/edit`)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Drop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Drop Banner */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-amber-100 overflow-hidden">
                {drop.imageUrl && (
                  <img 
                    src={drop.imageUrl} 
                    alt={drop.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{drop.title}</h2>
                <p className="text-slate-600 leading-relaxed">{drop.description}</p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Products in this Drop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drop.products?.map(product => (
                  <div key={product.id} className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors">
                    <h4 className="font-semibold text-slate-900 mb-2">{product.name}</h4>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                      <span className="text-sm text-slate-600">{product.sold}/{product.total} sold</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(product.sold / product.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Metrics</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">₹{drop.total_sales?.toLocaleString()}</div>
                    <div className="text-slate-600 text-sm">Total Sales</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{drop.views?.toLocaleString()}</div>
                    <div className="text-slate-600 text-sm">Total Views</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{drop.engagement_rate}%</div>
                    <div className="text-slate-600 text-sm">Engagement Rate</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{drop.sold_count}/{drop.total_items}</div>
                    <div className="text-slate-600 text-sm">Items Sold</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Launch Date</div>
                    <div className="text-slate-600 text-sm">{formatDate(drop.launch_datetime)}</div>
                  </div>
                </div>
                {drop.end_datetime && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">End Date</div>
                      <div className="text-slate-600 text-sm">{formatDate(drop.end_datetime)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}