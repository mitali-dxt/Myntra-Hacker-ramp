"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Sparkles, Filter, Search, Star, Users, Zap } from 'lucide-react';
import DropCard from '../../components/drops/DropCard';
import CreatorSpotlight from '../../components/drops/CreatorSpotlight';

export default function DropsPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [drops, setDrops] = useState([]);
  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchDrops();
    fetchFeaturedCreators();
  }, []);

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/drops');
      if (response.ok) {
        const data = await response.json();
        setDrops(data);
      } else {
        // Fallback data for demo
        setDrops(getMockDrops());
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
      setDrops(getMockDrops());
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCreators = async () => {
    try {
      const response = await fetch('/api/creators/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedCreators(data);
      } else {
        setFeaturedCreators(getMockCreators());
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      setFeaturedCreators(getMockCreators());
    }
  };

  const getMockDrops = () => [
    {
      _id: '1',
      title: 'Midnight Vibes Collection',
      description: 'Dark academia meets streetwear in this exclusive capsule collection featuring oversized blazers, vintage tees, and statement accessories.',
      creator_name: 'Komal Pandey',
      creator_image: '/api/placeholder/80/80',
      status: 'live',
      launch_datetime: new Date().toISOString(),
      price_range: { min: 899, max: 4999 },
      total_items: 24,
      sold_count: 18,
      total_stock: 120,
      products: [
        { name: 'Oversized Blazer', price: 2999, image_url: '/api/placeholder/400/500', rating: 4.8 },
        { name: 'Vintage Band Tee', price: 899, image_url: '/api/placeholder/400/500', rating: 4.6 },
        { name: 'Statement Choker', price: 1299, image_url: '/api/placeholder/400/500', rating: 4.9 }
      ],
      tags: ['streetwear', 'dark academia', 'exclusive'],
      is_featured: true
    },
    {
      _id: '2',
      title: 'Summer Sunset Capsule',
      description: 'Vibrant summer pieces inspired by golden hour magic. Flowing dresses, crop tops, and accessories in warm sunset hues.',
      creator_name: 'Sejal Kumar',
      creator_image: '/api/placeholder/80/80',
      status: 'upcoming',
      launch_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      price_range: { min: 699, max: 3499 },
      total_items: 18,
      notification_count: 12450,
      products: [
        { name: 'Sunset Maxi Dress', price: 2499, image_url: '/api/placeholder/400/500' },
        { name: 'Golden Hour Crop Top', price: 899, image_url: '/api/placeholder/400/500' }
      ],
      tags: ['summer', 'bohemian', 'sunset'],
      is_featured: false
    },
    {
      _id: '3',
      title: 'Minimalist Essentials',
      description: 'Clean lines, neutral tones, and timeless silhouettes. Everyday pieces that elevate your wardrobe basics.',
      creator_name: 'Masoom Minawala',
      creator_image: '/api/placeholder/80/80',
      status: 'live',
      launch_datetime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      price_range: { min: 1299, max: 5999 },
      total_items: 15,
      sold_count: 12,
      total_stock: 75,
      products: [
        { name: 'Classic White Shirt', price: 1999, image_url: '/api/placeholder/400/500', rating: 4.7 },
        { name: 'Tailored Trousers', price: 2999, image_url: '/api/placeholder/400/500', rating: 4.8 }
      ],
      tags: ['minimalist', 'essentials', 'timeless'],
      is_featured: true
    }
  ];

  const getMockCreators = () => [
    {
      _id: '1',
      name: 'Komal Pandey',
      bio: 'Fashion content creator & stylist with 2M+ followers',
      image: '/api/placeholder/120/120',
      followers: 2100000,
      drops_count: 8,
      rating: 4.9,
      social_links: {
        instagram: 'komalpandeyofficial',
        youtube: 'komalpandey'
      },
      recent_drop: {
        title: 'Midnight Vibes Collection',
        status: 'live'
      }
    },
    {
      _id: '2',
      name: 'Sejal Kumar',
      bio: 'Lifestyle & fashion influencer spreading positive vibes',
      image: '/api/placeholder/120/120',
      followers: 1800000,
      drops_count: 6,
      rating: 4.8,
      social_links: {
        instagram: 'sejalkumar',
        youtube: 'sejal'
      },
      recent_drop: {
        title: 'Summer Sunset Capsule',
        status: 'upcoming'
      }
    }
  ];

  const filteredDrops = drops.filter(drop => {
    const matchesTab = activeTab === 'all' || drop.status === activeTab;
    const matchesSearch = drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drop.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drop.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const sortedDrops = [...filteredDrops].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.sold_count || 0) - (a.sold_count || 0);
      case 'price-low':
        return (a.price_range?.min || 0) - (b.price_range?.min || 0);
      case 'price-high':
        return (b.price_range?.max || 0) - (a.price_range?.max || 0);
      default:
        return new Date(b.launch_datetime) - new Date(a.launch_datetime);
    }
  });

  const liveDropsCount = drops.filter(d => d.status === 'live').length;
  const upcomingDropsCount = drops.filter(d => d.status === 'upcoming').length;

  const TabButton = ({ id, label, count, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
        activeTab === id
          ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg transform scale-105'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading exclusive drops...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-amber-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black">
                Creator <span className="text-amber-400">Drops</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-12 text-slate-200 max-w-3xl mx-auto">
              Discover exclusive fashion collections from India's most influential creators. 
              Limited-time drops that sell out fast.
            </p>
            
            {/* Creator Login CTA */}
            <div className="mb-8">
              <a
                href="/creator/login"
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <Users className="w-5 h-5" />
                <span>Creator? Login Here</span>
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black text-amber-400 mb-2">{drops.length}</div>
                <div className="text-slate-300 font-medium">Active Drops</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-amber-400 mb-2">89%</div>
                <div className="text-slate-300 font-medium">Sell-out Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-amber-400 mb-2">24H</div>
                <div className="text-slate-300 font-medium">Avg. Sell Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Creators Spotlight */}
      {featuredCreators.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-12">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <Star className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Creators</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredCreators.slice(0, 2).map(creator => (
                <CreatorSpotlight key={creator._id} creator={creator} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <TabButton
              id="live"
              label="Live Now"
              count={liveDropsCount}
              icon={TrendingUp}
            />
            <TabButton
              id="upcoming"
              label="Coming Soon"
              count={upcomingDropsCount}
              icon={Clock}
            />
            <TabButton
              id="all"
              label="All Drops"
              count={drops.length}
              icon={Calendar}
            />
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search drops, creators, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {sortedDrops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-16 h-16 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {searchQuery ? 'No matching drops found' : 'No drops available'}
            </h3>
            <p className="text-slate-600 text-lg">
              {searchQuery 
                ? 'Try adjusting your search or browse all drops' 
                : 'Check back soon for exciting new creator collections!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedDrops.map((drop, index) => (
              <DropCard 
                key={drop._id} 
                drop={drop} 
                layout={index === 0 && drop.is_featured ? 'featured' : 'grid'}
                className={index === 0 && drop.is_featured ? 'lg:col-span-2' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


