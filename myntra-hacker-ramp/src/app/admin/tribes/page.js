"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Plus, Edit, Trash2, Eye, Package, 
  Sparkles, Crown, Tag, Image as ImageIcon, Save, X
} from 'lucide-react';
import Image from 'next/image';

export default function AdminTribesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tribes, setTribes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTribe, setEditingTribe] = useState(null);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    coverImage: '',
    tags: ''
  });

  useEffect(() => {
    checkAuth();
    fetchTribes();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "me" })
      });
      const data = await res.json();
      
      if (!data.user || data.user.role !== "ADMIN") {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  const fetchTribes = async () => {
    try {
      const response = await fetch('/api/admin/tribes');
      if (response.ok) {
        const data = await response.json();
        setTribes(data);
      }
    } catch (error) {
      console.error('Error fetching tribes:', error);
    }
  };

  const handleCreateTribe = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/tribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...createForm,
          tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        const newTribe = await response.json();
        setTribes([newTribe, ...tribes]);
        setCreateForm({ name: '', description: '', coverImage: '', tags: '' });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating tribe:', error);
    }
  };

  const handleUpdateTribe = async (e) => {
    e.preventDefault();
    if (!editingTribe) return;

    try {
      const response = await fetch('/api/admin/tribes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTribe._id,
          ...editingTribe,
          tags: typeof editingTribe.tags === 'string' 
            ? editingTribe.tags.split(',').map(t => t.trim()).filter(Boolean)
            : editingTribe.tags
        })
      });

      if (response.ok) {
        const updatedTribe = await response.json();
        setTribes(tribes.map(t => t._id === updatedTribe._id ? updatedTribe : t));
        setEditingTribe(null);
      }
    } catch (error) {
      console.error('Error updating tribe:', error);
    }
  };

  const handleDeleteTribe = async (tribeId) => {
    if (!confirm('Are you sure you want to delete this tribe?')) return;

    try {
      const response = await fetch('/api/admin/tribes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tribeId })
      });

      if (response.ok) {
        setTribes(tribes.filter(t => t._id !== tribeId));
      }
    } catch (error) {
      console.error('Error deleting tribe:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading admin panel...</div>
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
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Tribe Management</h1>
                <p className="text-slate-300 text-lg">Manage fashion tribes and AI product recommendations</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Tribe</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{tribes.length}</div>
                  <div className="text-slate-300 text-sm">Total Tribes</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {tribes.reduce((acc, t) => acc + (t.products?.length || 0), 0)}
                  </div>
                  <div className="text-slate-300 text-sm">Total Products</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tribes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tribes.map(tribe => (
            <div key={tribe._id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                {tribe.coverImage && (
                  <Image 
                    src={tribe.coverImage} 
                    alt={tribe.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Member Count Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-800">{tribe.memberCount}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tribe.name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{tribe.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">{tribe.products?.length || 0}</div>
                    <div className="text-xs text-slate-600">Products</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-blue-900">{tribe.memberCount || 0}</div>
                    <div className="text-xs text-blue-600">Members</div>
                  </div>
                </div>

                {/* Tags */}
                {tribe.tags && tribe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tribe.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                    {tribe.tags.length > 3 && (
                      <span className="text-xs text-slate-500">+{tribe.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/tribes/${tribe.slug}`)}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={() => setEditingTribe({
                      ...tribe,
                      tags: tribe.tags ? tribe.tags.join(', ') : ''
                    })}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(`/admin/tribes/${tribe._id}/products`, '_blank')}
                    className="flex-1 bg-emerald-100 text-emerald-700 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-1"
                    title="Manage curated products"
                  >
                    <Package className="w-4 h-4" />
                    <span>Products</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTribe(tribe._id)}
                    className="bg-red-100 text-red-700 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tribes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tribes created yet</h3>
            <p className="text-slate-600 mb-6">Create your first fashion tribe to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
            >
              Create First Tribe
            </button>
          </div>
        )}
      </div>

      {/* Create Tribe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Create New Tribe</h2>
            </div>
            
            <form onSubmit={handleCreateTribe} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tribe Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Streetwear Squad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="3"
                  placeholder="Describe the tribe's style and vibe..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={createForm.coverImage}
                  onChange={(e) => setCreateForm({...createForm, coverImage: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="streetwear, urban, casual"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  Create Tribe
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tribe Modal */}
      {editingTribe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Tribe</h2>
            </div>
            
            <form onSubmit={handleUpdateTribe} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tribe Name</label>
                <input
                  type="text"
                  required
                  value={editingTribe.name}
                  onChange={(e) => setEditingTribe({...editingTribe, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={editingTribe.description}
                  onChange={(e) => setEditingTribe({...editingTribe, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={editingTribe.coverImage}
                  onChange={(e) => setEditingTribe({...editingTribe, coverImage: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingTribe.tags}
                  onChange={(e) => setEditingTribe({...editingTribe, tags: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Update Tribe
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTribe(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}