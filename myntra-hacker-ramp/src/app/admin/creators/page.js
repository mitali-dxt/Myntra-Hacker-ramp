"use client";

import { useState, useEffect } from 'react';
import { UserPlus, Users, Settings, Eye, Trash2, Edit3, Key, Shield, AlertTriangle, Download, Search, Filter, Plus, Copy, Check } from 'lucide-react';

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    social_links: {
      instagram: '',
      youtube: '',
      twitter: '',
      website: ''
    }
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators');
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      } else {
        // Mock data for demo
        setCreators(getMockCreators());
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      setCreators(getMockCreators());
    } finally {
      setLoading(false);
    }
  };

  const getMockCreators = () => [
    {
      _id: '1',
      name: 'Komal Pandey',
      username: 'komalpandey',
      email: 'komal@example.com',
      status: 'active',
      verified: true,
      total_drops: 8,
      total_sales: 25000,
      followers: 2100000,
      rating: 4.9,
      last_login: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      name: 'Sejal Kumar',
      username: 'sejalkumar',
      email: 'sejal@example.com',
      status: 'active',
      verified: true,
      total_drops: 6,
      total_sales: 18500,
      followers: 1800000,
      rating: 4.8,
      last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const generateUsername = (name) => {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  };

  const generateSecurePassword = () => {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleCreateCreator = async () => {
    try {
      const password = generateSecurePassword();
      const creatorData = {
        ...newCreator,
        password,
        username: newCreator.username || generateUsername(newCreator.name)
      };

      const response = await fetch('/api/admin/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creatorData)
      });

      if (response.ok) {
        const creator = await response.json();
        setCreators([creator, ...creators]);
        setGeneratedPassword(password);
        setNewCreator({
          name: '',
          email: '',
          username: '',
          bio: '',
          social_links: { instagram: '', youtube: '', twitter: '', website: '' }
        });
      } else {
        // For demo, add to local state
        const mockCreator = {
          _id: Date.now().toString(),
          ...creatorData,
          status: 'active',
          verified: false,
          total_drops: 0,
          total_sales: 0,
          followers: 0,
          rating: 0,
          createdAt: new Date().toISOString()
        };
        setCreators([mockCreator, ...creators]);
        setGeneratedPassword(password);
        setNewCreator({
          name: '',
          email: '',
          username: '',
          bio: '',
          social_links: { instagram: '', youtube: '', twitter: '', website: '' }
        });
      }
    } catch (error) {
      console.error('Error creating creator:', error);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (error) {
      console.error('Failed to copy password');
    }
  };

  const updateCreatorStatus = async (creatorId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setCreators(creators.map(c => 
          c._id === creatorId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error('Error updating creator status:', error);
    }
  };

  const deleteCreator = async (creatorId) => {
    if (!confirm('Are you sure you want to delete this creator? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCreators(creators.filter(c => c._id !== creatorId));
      }
    } catch (error) {
      console.error('Error deleting creator:', error);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || creator.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
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
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading creators...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Creator Management</h1>
                <p className="text-slate-300">Manage creator accounts and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Creator</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{creators.length}</div>
              <div className="text-slate-300 text-sm">Total Creators</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-emerald-400">
                {creators.filter(c => c.status === 'active').length}
              </div>
              <div className="text-slate-300 text-sm">Active</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-amber-400">
                {creators.filter(c => c.verified).length}
              </div>
              <div className="text-slate-300 text-sm">Verified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">
                {creators.reduce((sum, c) => sum + (c.total_drops || 0), 0)}
              </div>
              <div className="text-slate-300 text-sm">Total Drops</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Creators Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Creator</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Performance</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Last Login</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCreators.map((creator) => (
                  <tr key={creator._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-amber-200 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-slate-700">
                            {creator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-2">
                            <span>{creator.name}</span>
                            {creator.verified && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">@{creator.username}</div>
                          <div className="text-sm text-slate-500">{creator.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(creator.status)}`}>
                        {creator.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm text-slate-900">
                          {creator.total_drops} drops • ₹{(creator.total_sales || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600">
                          {(creator.followers || 0).toLocaleString()} followers • {creator.rating}/5 rating
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600">
                        {creator.last_login ? formatDate(creator.last_login) : 'Never'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/creator/${creator.username}`, '_blank')}
                          className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => {/* Edit creator */}}
                          className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors"
                          title="Edit Creator"
                        >
                          <Edit3 className="w-4 h-4 text-amber-600" />
                        </button>
                        <select
                          value={creator.status}
                          onChange={(e) => updateCreatorStatus(creator._id, e.target.value)}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <button
                          onClick={() => deleteCreator(creator._id)}
                          className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                          title="Delete Creator"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add New Creator</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGeneratedPassword('');
                    setCopiedPassword(false);
                  }}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  ×
                </button>
              </div>

              {generatedPassword ? (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900">Creator Account Created!</h3>
                      <p className="text-emerald-700">Please save these credentials securely.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-1">Username</label>
                      <div className="bg-white rounded-xl p-3 border border-emerald-200">
                        <code className="text-emerald-800">{newCreator.username}</code>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-1">Password</label>
                      <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
                        <code className="text-emerald-800 font-mono">{generatedPassword}</code>
                        <button
                          onClick={copyPassword}
                          className={`ml-3 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            copiedPassword 
                              ? 'bg-emerald-200 text-emerald-800' 
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {copiedPassword ? (
                            <><Check className="w-4 h-4 inline mr-1" />Copied</>
                          ) : (
                            <><Copy className="w-4 h-4 inline mr-1" />Copy</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Important:</strong> This password will not be shown again. 
                        Please share it with the creator securely.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleCreateCreator(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={newCreator.name}
                        onChange={(e) => setNewCreator({...newCreator, name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Creator's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={newCreator.email}
                        onChange={(e) => setNewCreator({...newCreator, email: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="creator@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Username</label>
                    <input
                      type="text"
                      value={newCreator.username}
                      onChange={(e) => setNewCreator({...newCreator, username: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Auto-generated if empty"
                    />
                    <p className="text-sm text-slate-600 mt-1">
                      Leave empty to auto-generate from name
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Bio</label>
                    <textarea
                      value={newCreator.bio}
                      onChange={(e) => setNewCreator({...newCreator, bio: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows="3"
                      placeholder="Brief description about the creator"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Social Links</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newCreator.social_links.instagram}
                        onChange={(e) => setNewCreator({
                          ...newCreator, 
                          social_links: {...newCreator.social_links, instagram: e.target.value}
                        })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Instagram username"
                      />
                      <input
                        type="text"
                        value={newCreator.social_links.youtube}
                        onChange={(e) => setNewCreator({
                          ...newCreator, 
                          social_links: {...newCreator.social_links, youtube: e.target.value}
                        })}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="YouTube channel"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Create Creator
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}