"use client";

import { useState, useEffect, useRef } from 'react';
import { Share2, Users, MessageCircle, ShoppingCart, X, Copy, Check, RefreshCw } from 'lucide-react';
import { useCollabSession } from '@/hooks/useCollabSession';
import SocialSidebar from './SocialSidebar';
import ProductBrowser from './ProductBrowser';

export default function CollabRoom({ session: initialSession, onLeave, userName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const copyTimeoutRef = useRef(null);

  const { session, loading, error, addItem, removeItem, voteOnItem, sendMessage, refreshSession } = useCollabSession(initialSession, userName);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/collab?join=${session?.code}`);
    }
  }, [session?.code]);

  const handleShare = async () => {
    const url = `${window.location.origin}/collab?join=${session.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Shopping Session',
          text: `Join me for collaborative shopping! Code: ${session.code}`,
          url: url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      copyTimeoutRef.current = setTimeout(() => {
        setShareSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">Error loading session</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 flex">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Collab Shopping
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Session: <span className="font-mono font-semibold">{session.code}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-amber-700">
                  {session.participants?.length || 0} active
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={refreshSession}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh Session"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onLeave}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Browser */}
        <ProductBrowser 
          session={session}
          currentProduct={currentProduct}
          onProductChange={setCurrentProduct}
          userName={userName}
          addItem={addItem}
        />
      </div>

      {/* Social Sidebar */}
      <SocialSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        session={session}
        userName={userName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        addItem={addItem}
        removeItem={removeItem}
        voteOnItem={voteOnItem}
        sendMessage={sendMessage}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <button
          onClick={() => {
            setSidebarOpen(true);
            setActiveTab('cart');
          }}
          className="relative bg-gradient-to-r from-slate-600 to-slate-800 text-white p-4 rounded-full shadow-lg hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6" />
          {session.items?.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {session.items.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => {
            setSidebarOpen(true);
            setActiveTab('chat');
          }}
          className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          {session.messages?.length > 1 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {session.messages.length - 1}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}