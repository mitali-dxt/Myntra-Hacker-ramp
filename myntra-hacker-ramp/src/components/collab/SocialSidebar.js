"use client";

import { useState } from 'react';
import { MessageCircle, Users, ShoppingCart, TrendingUp, X } from 'lucide-react';
import LiveChat from './LiveChat';
import SharedCart from './SharedCart';
import ParticipantsList from './ParticipantsList';
import ProductVoting from './ProductVoting';

export default function SocialSidebar({ 
  isOpen, 
  onToggle,
  session, 
  userName, 
  activeTab, 
  onTabChange, 
  addItem,
  removeItem,
  voteOnItem,
  sendMessage
}) {
  if (!isOpen) return null;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle, component: LiveChat },
    { id: 'participants', label: 'People', icon: Users, component: ParticipantsList },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, component: SharedCart },
    { id: 'voting', label: 'Votes', icon: TrendingUp, component: ProductVoting },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Social Hub</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm opacity-90">Live</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-700 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {ActiveComponent && (
          <ActiveComponent
            session={session}
            userName={userName}
            addItem={addItem}
            removeItem={removeItem}
            voteOnItem={voteOnItem}
            sendMessage={sendMessage}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTabChange('cart')}
            className="flex items-center justify-center space-x-2 bg-slate-600 text-white py-2 px-3 rounded-xl hover:bg-slate-700 transition-all duration-300 font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">View Cart</span>
          </button>
          <button
            onClick={() => onTabChange('voting')}
            className="flex items-center justify-center space-x-2 bg-amber-500 text-white py-2 px-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Vote</span>
          </button>
        </div>
      </div>
    </div>
  );
}