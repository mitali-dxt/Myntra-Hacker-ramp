"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Eye, Trash2, Edit3, Star, Users, Calendar, Award } from 'lucide-react';

export default function AdminQuestManagement() {
  const [user, setUser] = useState(null);
  const [quests, setQuests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    coverImageUrl: "",
    submissionStartDate: "",
    submissionEndDate: "",
    votingEndDate: "",
    prizeDiscountPercentage: 10,
    prizeBadgeName: "",
    prizeBadgeImageUrl: ""
  });

  useEffect(() => {
    checkAuth();
    fetchQuests();
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

  async function fetchQuests() {
    try {
      const res = await fetch("/api/admin/challenges");
      if (res.ok) {
        const data = await res.json();
        setQuests(data);
      }
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    }
  }

  async function createQuest(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuest)
      });

      if (res.ok) {
        setShowCreateForm(false);
        setNewQuest({
          title: "",
          description: "",
          coverImageUrl: "",
          submissionStartDate: "",
          submissionEndDate: "",
          votingEndDate: "",
          prizeDiscountPercentage: 10,
          prizeBadgeName: "",
          prizeBadgeImageUrl: ""
        });
        fetchQuests();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create quest");
      }
    } catch (error) {
      alert("Failed to create quest");
    }
  }

  async function deleteQuest(questId) {
    if (!confirm("Are you sure you want to delete this quest?")) return;
    
    try {
      const res = await fetch(`/api/admin/challenges/${questId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        fetchQuests();
      } else {
        alert("Failed to delete quest");
      }
    } catch (error) {
      alert("Failed to delete quest");
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'voting': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading quest management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Quest Management</h1>
              <p className="text-purple-200">Create and manage style quests and challenges</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{quests.length}</div>
              <div className="text-purple-200 text-sm">Total Quests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-emerald-400">{quests.filter(q => q.status === 'active').length}</div>
              <div className="text-purple-200 text-sm">Active</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-amber-400">{quests.filter(q => q.status === 'voting').length}</div>
              <div className="text-purple-200 text-sm">In Voting</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{quests.filter(q => q.status === 'completed').length}</div>
              <div className="text-purple-200 text-sm">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">All Style Quests</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Quest</span>
          </button>
        </div>

        {/* Create Quest Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Style Quest</h2>
                <form onSubmit={createQuest} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Quest Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuest.title}
                      onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Monsoon Magic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={newQuest.description}
                      onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Describe the challenge theme and requirements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={newQuest.coverImageUrl}
                      onChange={e => setNewQuest({...newQuest, coverImageUrl: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Submission Start *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newQuest.submissionStartDate}
                        onChange={e => setNewQuest({...newQuest, submissionStartDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Submission End *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newQuest.submissionEndDate}
                        onChange={e => setNewQuest({...newQuest, submissionEndDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Voting End *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newQuest.votingEndDate}
                        onChange={e => setNewQuest({...newQuest, votingEndDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Discount Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newQuest.prizeDiscountPercentage}
                        onChange={e => setNewQuest({...newQuest, prizeDiscountPercentage: parseInt(e.target.value)})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Badge Name
                      </label>
                      <input
                        type="text"
                        value={newQuest.prizeBadgeName}
                        onChange={e => setNewQuest({...newQuest, prizeBadgeName: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Monsoon Maestro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Badge Image URL
                    </label>
                    <input
                      type="url"
                      value={newQuest.prizeBadgeImageUrl}
                      onChange={e => setNewQuest({...newQuest, prizeBadgeImageUrl: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/badge.png"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
                    >
                      Create Quest
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Quests List */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {quests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No quests created yet</h3>
              <p className="text-slate-600 mb-6">Create your first Style Quest to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                Create First Quest
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {quests.map(quest => (
                <div key={quest._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{quest.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quest.status)}`}>
                          {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{quest.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Start: {new Date(quest.submissionStartDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>End: {new Date(quest.submissionEndDate).toLocaleDateString()}</span>
                        </div>
                        {quest.prizeDiscountPercentage > 0 && (
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Prize: {quest.prizeDiscountPercentage}% off</span>
                          </div>
                        )}
                        {quest.prizeBadgeName && (
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4" />
                            <span>Badge: {quest.prizeBadgeName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => router.push(`/admin/submissions/${quest._id}`)}
                        className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => console.log('Edit quest', quest._id)}
                        className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center hover:bg-amber-200 transition-colors"
                        title="Edit Quest"
                      >
                        <Edit3 className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => deleteQuest(quest._id)}
                        className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors"
                        title="Delete Quest"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}