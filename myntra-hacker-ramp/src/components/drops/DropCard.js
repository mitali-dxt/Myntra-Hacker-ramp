"use client";

import { useState, useEffect } from 'react';
import { Clock, Bell, User, Calendar, Zap, Star, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function DropCard({ drop, type = 'grid' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (drop.status === 'upcoming' && drop.launch_datetime) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const launchTime = new Date(drop.launch_datetime).getTime();
        const difference = launchTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${minutes}m ${seconds}s`);
          }
        } else {
          setTimeLeft('Live Now!');
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [drop.launch_datetime, drop.status]);

  const getStatusInfo = () => {
    switch (drop.status) {
      case 'upcoming':
        return {
          badge: 'Coming Soon',
          badgeColor: 'bg-slate-600',
          action: 'Notify Me',
          actionColor: 'from-amber-500 to-yellow-600'
        };
      case 'live':
        return {
          badge: 'Live Now',
          badgeColor: 'bg-emerald-600',
          action: 'Shop Drop',
          actionColor: 'from-slate-600 to-slate-800'
        };
      case 'completed':
        return {
          badge: 'Sold Out',
          badgeColor: 'bg-gray-500',
          action: 'View Drop',
          actionColor: 'from-gray-500 to-gray-600'
        };
      default:
        return {
          badge: 'Available',
          badgeColor: 'bg-slate-600',
          action: 'Shop Now',
          actionColor: 'from-slate-600 to-slate-800'
        };
    }
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/drops/${drop._id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setNotified(true);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to set notification:', error);
    }
  };

  const statusInfo = getStatusInfo();

  if (type === 'featured') {
    return (
      <Link href={`/drops/${drop._id}`}>
        <div className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2">
          {/* Background Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={drop.collection_image || drop.cover_image_url || drop.imageUrl}
              alt={drop.title || drop.collectionName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='18'%3EExclusive Drop%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${statusInfo.badgeColor} border border-white/20`}>
                {statusInfo.badge}
              </span>
            </div>

            {/* Live Indicator */}
            {drop.status === 'live' && (
              <div className="absolute top-6 left-6 flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            )}

            {/* Countdown for Upcoming */}
            {drop.status === 'upcoming' && timeLeft && (
              <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/20">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Launches In</span>
                </div>
                <div className="text-lg font-bold">{timeLeft}</div>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-6 right-6 text-right">
              <h2 className="text-2xl font-bold text-white mb-2">
                {drop.title || drop.collectionName}
              </h2>
              <div className="flex items-center justify-end space-x-2 text-white/90 mb-4">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {drop.creator?.name || drop.creatorName}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {drop.status === 'upcoming' ? (
              <button
                onClick={handleNotifyMe}
                disabled={notified}
                className={`w-full bg-gradient-to-r ${statusInfo.actionColor} text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {notified ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>You'll be notified!</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>{statusInfo.action}</span>
                  </span>
                )}
              </button>
            ) : (
              <button className={`w-full bg-gradient-to-r ${statusInfo.actionColor} text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                <span className="flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>{statusInfo.action}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/drops/${drop._id}`}>
      <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-amber-500 to-slate-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
        
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={drop.collection_image || drop.cover_image_url || drop.imageUrl}
            alt={drop.title || drop.collectionName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b'%3EDrop Collection%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${statusInfo.badgeColor}`}>
              {statusInfo.badge}
            </span>
          </div>

          {/* Live Indicator */}
          {drop.status === 'live' && (
            <div className="absolute top-4 left-4 flex items-center space-x-1 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          )}

          {/* Product Preview */}
          {drop.products && drop.products.length > 0 && (
            <div className="absolute bottom-4 left-4 flex space-x-2">
              {drop.products.slice(0, 3).map((product, index) => (
                <div key={index} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20 backdrop-blur-sm">
                  <img
                    src={product.image_url || product.images?.[0]}
                    alt={product.name || product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48/e2e8f0/64748b?text=P';
                    }}
                  />
                </div>
              ))}
              {drop.products.length > 3 && (
                <div className="w-12 h-12 rounded-lg bg-black/50 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{drop.products.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 relative">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors duration-300">
            {drop.title || drop.collectionName}
          </h3>
          
          <div className="flex items-center space-x-2 text-gray-600 mb-3">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{drop.creator?.name || drop.creatorName}</span>
          </div>

          {drop.description_story && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {drop.description_story}
            </p>
          )}

          {/* Countdown for Upcoming */}
          {drop.status === 'upcoming' && timeLeft && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Launches in: </span>
                <span className="text-sm font-bold text-amber-600">{timeLeft}</span>
              </div>
            </div>
          )}

          {/* Launch Date */}
          {drop.launch_datetime && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
              <Calendar className="w-3 h-3" />
              <span>
                {drop.status === 'upcoming' ? 'Launches' : 'Launched'}: {new Date(drop.launch_datetime).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Action Button */}
          {drop.status === 'upcoming' ? (
            <button
              onClick={handleNotifyMe}
              disabled={notified}
              className={`w-full bg-gradient-to-r ${statusInfo.actionColor} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {notified ? (
                <span className="flex items-center justify-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notified!</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>{statusInfo.action}</span>
                </span>
              )}
            </button>
          ) : (
            <button className={`w-full bg-gradient-to-r ${statusInfo.actionColor} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <span className="flex items-center justify-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{statusInfo.action}</span>
              </span>
            </button>
          )}

          {/* Decorative Element */}
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-100 to-transparent rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </Link>
  );
}