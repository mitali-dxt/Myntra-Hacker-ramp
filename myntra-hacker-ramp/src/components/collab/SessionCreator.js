"use client";

import { useState } from 'react';
import { Users, Plus, UserPlus, Sparkles, Share2 } from 'lucide-react';

export default function SessionCreator({ onSessionCreated, initialJoinCode }) {
  const [mode, setMode] = useState(initialJoinCode ? 'join' : ''); // Auto-set to join if there's a code
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    userName: '',
    sessionCode: initialJoinCode || ''
  });

  const handleCreate = async () => {
    if (!formData.sessionName.trim() || !formData.userName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: formData.sessionName,
          hostName: formData.userName
        })
      });
      const session = await res.json();
      onSessionCreated(session, formData.userName);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!formData.sessionCode.trim() || !formData.userName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          code: formData.sessionCode,
          userName: formData.userName
        })
      });
      const session = await res.json();
      if (session.error) {
        alert(session.error);
        return;
      }
      onSessionCreated(session, formData.userName);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Collab Shopping Experience
              <Sparkles className="w-4 h-4 ml-2" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Shop Together,
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Decide Together
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Start a virtual shopping party with friends! Browse together, chat in real-time, 
              vote on products, and make shopping decisions as a group.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 mx-auto">
                  👥
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Real-time Sync</h3>
                <p className="text-gray-600 text-sm">Browse together and see what your friends are looking at in real-time</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 mx-auto">
                  💬
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Live Chat & Votes</h3>
                <p className="text-gray-600 text-sm">Chat with friends and vote on products to make group decisions</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 mx-auto">
                  🛒
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Shared Cart</h3>
                <p className="text-gray-600 text-sm">Add items to a shared cart and split checkout between friends</p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Session Card */}
            <div className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  Start a Shopping Party
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create a new shopping session and invite your friends to join the fun. 
                  Be the host and guide your group through the best fashion finds!
                </p>
                
                <button
                  onClick={() => setMode('create')}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:from-slate-800 hover:to-slate-950 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Create New Session
                </button>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </div>

            {/* Join Session Card */}
            <div className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  Join a Shopping Party
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Got an invitation code? Join your friends' shopping session and 
                  help them discover amazing products together!
                </p>
                
                <button
                  onClick={() => setMode('join')}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Join with Code
                </button>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${mode === 'create' ? 'bg-gradient-to-r from-slate-700 to-slate-900' : 'bg-gradient-to-r from-amber-600 to-yellow-600'} rounded-2xl flex items-center justify-center text-white text-2xl mb-4 mx-auto`}>
            {mode === 'create' ? <Plus className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'create' ? 'Create Shopping Party' : 'Join Shopping Party'}
          </h2>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Start a new session and invite friends' 
              : 'Enter the session code to join your friends'
            }
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) => setFormData({...formData, sessionName: e.target.value})}
                placeholder="e.g., Weekend Shopping Spree"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          )}

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Code
              </label>
              <input
                type="text"
                value={formData.sessionCode}
                onChange={(e) => setFormData({...formData, sessionCode: e.target.value.toUpperCase()})}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-center font-mono text-lg tracking-widest"
                maxLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className={`w-full ${mode === 'create' ? 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950' : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700'} text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Joining...'}
                </div>
              ) : (
                mode === 'create' ? 'Create Session' : 'Join Session'
              )}
            </button>

            <button
              onClick={() => setMode('')}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-300"
            >
              ← Back to Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}