"use client";

import { Instagram, Youtube, ExternalLink, Users, Star, Zap } from 'lucide-react';

export default function CreatorSpotlight({ creator, className = '' }) {
  if (!creator) return null;

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-1 text-amber-600 mb-4">
        <Star className="w-4 h-4 fill-current" />
        <span className="text-sm font-semibold">Creator Spotlight</span>
      </div>

      {/* Creator Profile */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative">
          <img
            src={creator.profile_image || creator.profile_image_url || creator.profileImageUrl}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-200"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='24'%3E👤%3C/text%3E%3C/svg%3E";
            }}
          />
          {(creator.verified || creator.status === 'verified') && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{creator.name}</h3>
          {creator.bio && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
              {creator.bio}
            </p>
          )}
          
          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {(creator.social_links?.instagram || creator.instagram_handle) && (
              <a
                href={`https://instagram.com/${(creator.social_links?.instagram || creator.instagram_handle).replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">@{(creator.social_links?.instagram || creator.instagram_handle).replace('@', '')}</span>
              </a>
            )}
            
            {(creator.social_links?.youtube || creator.youtube_channel) && (
              <a
                href={creator.social_links?.youtube || creator.youtube_channel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
              >
                <Youtube className="w-4 h-4" />
                <span className="text-sm font-medium">YouTube</span>
              </a>
            )}
            
            {(creator.social_links?.website || creator.website) && (
              <a
                href={creator.social_links?.website || creator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-slate-600 hover:text-slate-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {(creator.followers || creator.followers_count || 0) > 1000 
              ? `${((creator.followers || creator.followers_count || 0) / 1000).toFixed(1)}K` 
              : (creator.followers || creator.followers_count || 0)
            }
          </div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">{creator.total_drops || 0}</div>
          <div className="text-xs text-gray-500">Drops</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          <div className="text-lg font-bold text-gray-900">{(creator.rating || 0).toFixed(1)}</div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>

      {/* Call to Action */}
      {(creator.social_links?.instagram || creator.instagram_handle) && (
        <div className="mt-6">
          <a
            href={`https://instagram.com/${(creator.social_links?.instagram || creator.instagram_handle).replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow Creator</span>
          </a>
        </div>
      )}
    </div>
  );
}