"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Tag } from "lucide-react";

export default function TribesPage() {
  const [tribes, setTribes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTribes();
  }, []);

  const fetchTribes = async () => {
    try {
      const response = await fetch("/api/tribes");
      const data = await response.json();
      setTribes(data);
    } catch (error) {
      console.error("Error fetching tribes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">Loading tribes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-20 animate-bounce delay-1000"></div>
        
        <div className="container mx-auto px-4 lg:px-8 py-16 relative">
          <div className="text-center mb-16">
            {/* Animated Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="animate-pulse mr-2">👥</span>
              Fashion Communities
              <span className="animate-pulse ml-2">✨</span>
            </div>
            
            {/* Main Title with Gradient */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Fashion
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Tribes
              </span>
              <div className="inline-block ml-4">
                <span className="text-4xl animate-bounce">🌟</span>
              </div>
            </h1>
            
            {/* Subtitle with Animation */}
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Discover style communities that match your vibe.
              </span>
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-bold">
                Join tribes to connect with like-minded fashion enthusiasts and explore curated collections.
              </span>
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-slate-700 mb-2">{tribes.length}+</div>
                <div className="text-gray-700 font-semibold">Active Tribes</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-amber-600 mb-2">{tribes.reduce((acc, tribe) => acc + tribe.memberCount, 0).toLocaleString()}+</div>
                <div className="text-gray-700 font-semibold">Community Members</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-slate-800 mb-2">{tribes.reduce((acc, tribe) => acc + (tribe.products?.length || 0), 0)}+</div>
                <div className="text-gray-700 font-semibold">Curated Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 lg:px-8 pb-8">

        {/* Tribes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tribes.map(tribe => (
            <Link 
              key={tribe._id} 
              href={`/tribes/${tribe.slug}`} 
              className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Cover Image */}
              <div className="relative w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                {tribe.coverImage && (
                  <Image 
                    src={tribe.coverImage} 
                    alt={tribe.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                
                {/* Member Count Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-800">{tribe.memberCount}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {tribe.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {tribe.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>{tribe.memberCount} members</span>
                    <span>{tribe.products?.length || 0} products</span>
                  </div>
                </div>

                {/* Tags */}
                {tribe.tags && tribe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
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
                      <span className="text-xs text-slate-500">+{tribe.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Join Button */}
                <div className="text-center">
                  <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-xl font-semibold group-hover:from-amber-600 group-hover:to-amber-700 transition-all">
                    Explore Tribe
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {tribes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tribes available</h3>
            <p className="text-slate-600">Check back later for new fashion communities!</p>
          </div>
        )}
      </div>
    </div>
  );
}


