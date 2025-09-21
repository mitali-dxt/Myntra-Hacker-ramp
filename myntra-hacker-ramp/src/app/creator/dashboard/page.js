"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Settings, BarChart3, Plus, Eye, Edit3, Trash2, Clock, 
  TrendingUp, ShoppingBag, Users, Star, LogOut,
  Save, X, Calendar, Zap, Package, DollarSign
} from 'lucide-react';

export default function CreatorDashboard() {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profile_image: '',
    social_links: {
      instagram: '',
      youtube: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    // Check if creator is logged in
    const token = localStorage.getItem('creator_token');
    const creatorData = localStorage.getItem('creator_user');
    
    if (!token || !creatorData) {
      router.push('/creator/login');
      return;
    }

    const parsedCreator = JSON.parse(creatorData);
    setCreator(parsedCreator);
    setProfileData({
      name: parsedCreator.name || '',
      bio: parsedCreator.bio || '',
      profile_image: parsedCreator.profile_image || '',
      social_links: parsedCreator.social_links || {
        instagram: '',
        youtube: '',
        twitter: '',
        website: ''
      }
    });

    fetchCreatorDrops();
  }, [router]);

  const fetchCreatorDrops = async () => {
    try {
      const token = localStorage.getItem('creator_token');
      console.log('Fetching drops with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/creator/drops', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched drops data:', data);
        console.log('Number of drops:', data.length);
        setDrops(data);
      } else {
        console.log('Response not ok, using mock data');
        // Mock data for demo
        setDrops(getMockDrops());
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
      setDrops(getMockDrops());
    } finally {
      setLoading(false);
    }
  };

  const getMockDrops = () => [
    {
      _id: '1',
      title: 'Midnight Vibes Collection',
      status: 'live',
      launch_datetime: new Date().toISOString(),
      total_items: 24,
      sold_count: 18,
      total_sales: 45000,
      views: 12500,
      engagement_rate: 8.5,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop'
    },
    {
      _id: '2',
      title: 'Summer Sunset Capsule',
      status: 'upcoming',
      launch_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_items: 18,
      notification_count: 8500,
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop'
    },
    {
      _id: '3',
      title: 'Minimalist Essentials',
      status: 'completed',
      launch_datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_items: 15,
      sold_count: 15,
      total_sales: 32000,
      views: 9800,
      engagement_rate: 12.3,
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('creator_token');
    localStorage.removeItem('creator_user');
    router.push('/creator/login');
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('creator_token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedCreator = await response.json();
        setCreator(updatedCreator);
        localStorage.setItem('creator_user', JSON.stringify(updatedCreator));
        setShowProfileEdit(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleViewDrop = (dropId) => {
    // Navigate to drop view page
    router.push(`/creator/drops/${dropId}`);
  };

  const handleEditDrop = (dropId) => {
    // Navigate to drop edit page  
    router.push(`/creator/drops/${dropId}/edit`);
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-emerald-100 text-emerald-800';
      case 'upcoming': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading dashboard...</div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-amber-200 rounded-2xl flex items-center justify-center overflow-hidden">
                {creator?.profile_image ? (
                  <img 
                    src={creator.profile_image} 
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-700">
                    {creator?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome, {creator?.name}</h1>
                <p className="text-slate-300">@{creator?.username} • Creator Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'drops', label: 'My Drops', icon: Package },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{drops.length}</div>
                    <div className="text-slate-600 text-sm">Total Drops</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{drops.reduce((sum, drop) => sum + (drop.total_sales || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-slate-600 text-sm">Total Sales</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {drops.reduce((sum, drop) => sum + (drop.views || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-slate-600 text-sm">Total Views</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {((drops.reduce((sum, drop) => sum + (drop.engagement_rate || 0), 0) / drops.length) || 0).toFixed(1)}%
                    </div>
                    <div className="text-slate-600 text-sm">Avg. Engagement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Drops */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Drops</h2>
                <button
                  onClick={() => setActiveTab('drops')}
                  className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-4 py-2 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Drop</span>
                </button>
              </div>

              <div className="space-y-4">
                {drops.slice(0, 3).map(drop => (
                  <div key={drop._id} className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-amber-200 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{drop.title}</h3>
                          <p className="text-slate-600 text-sm">
                            {drop.total_items} items • {formatDate(drop.launch_datetime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(drop.status)}`}>
                          {drop.status}
                        </span>
                        {drop.total_sales && (
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">₹{drop.total_sales.toLocaleString()}</div>
                            <div className="text-slate-600 text-sm">{drop.sold_count}/{drop.total_items} sold</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drops' && (
          <div className="space-y-8">
            {/* Drops Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">My Drops</h2>
              <button
                onClick={() => router.push('/creator/drops/create')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Drop</span>
              </button>
            </div>

            {/* Drops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drops.map(drop => (
                <div key={drop._id} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-amber-100 flex items-center justify-center overflow-hidden">
                    {drop.imageUrl || drop.banner_image ? (
                      <img 
                        src={drop.imageUrl || drop.banner_image} 
                        alt={drop.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-amber-100 flex items-center justify-center" style={{display: drop.imageUrl || drop.banner_image ? 'none' : 'flex'}}>
                      <Package className="w-12 h-12 text-slate-400" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900">{drop.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(drop.status)}`}>
                        {drop.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {drop.total_items} items • {formatDate(drop.launch_datetime)}
                    </p>
                    
                    {drop.status === 'live' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-800">Sales Progress</span>
                          <span className="font-semibold text-emerald-900">
                            {drop.sold_count}/{drop.total_items}
                          </span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${(drop.sold_count / drop.total_items) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDrop(drop._id)}
                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleEditDrop(drop._id)}
                        className="flex-1 bg-amber-100 text-amber-700 py-2 rounded-xl font-semibold hover:bg-amber-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Profile Settings</h2>
              <button
                onClick={() => setShowProfileEdit(true)}
                className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Display */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-start space-x-8">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-amber-200 rounded-3xl flex items-center justify-center overflow-hidden">
                  {creator?.profile_image ? (
                    <img 
                      src={creator.profile_image} 
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-slate-700">
                      {creator?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{creator?.name}</h3>
                  <p className="text-slate-600 mb-4">@{creator?.username}</p>
                  <p className="text-slate-700 mb-6">{creator?.bio || 'No bio added yet'}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Instagram</label>
                      <div className="text-slate-900">{creator?.social_links?.instagram || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">YouTube</label>
                      <div className="text-slate-900">{creator?.social_links?.youtube || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Profile Image URL</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-amber-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profileData.profile_image ? (
                        <img 
                          src={profileData.profile_image} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-slate-700">
                          {profileData.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={profileData.profile_image}
                        onChange={(e) => setProfileData({...profileData, profile_image: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://example.com/your-photo.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows="3"
                    placeholder="Tell your audience about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={profileData.social_links.instagram}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        social_links: {...profileData.social_links, instagram: e.target.value}
                      })}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Instagram username"
                    />
                    <input
                      type="text"
                      value={profileData.social_links.youtube}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        social_links: {...profileData.social_links, youtube: e.target.value}
                      })}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="YouTube channel"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowProfileEdit(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}