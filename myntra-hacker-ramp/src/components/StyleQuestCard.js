"use client";

import Link from 'next/link';

export default function StyleQuestCard({ 
  icon, 
  title, 
  reward, 
  progress, 
  status = 'active',
  description = '',
  questId = null,
  coverImageUrl = null
}) {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-slate-600';
      case 'active': return 'bg-emerald-600';
      case 'voting': return 'bg-amber-600';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-emerald-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Coming Soon';
      case 'active': return 'Submit Now';
      case 'voting': return 'Vote Now';
      case 'completed': return 'Completed';
      default: return 'Submit Now';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'upcoming': return 'from-slate-500 to-slate-700';
      case 'active': return 'from-emerald-500 to-emerald-700';
      case 'voting': return 'from-amber-500 to-amber-700';
      case 'completed': return 'from-gray-400 to-gray-600';
      default: return 'from-emerald-500 to-emerald-700';
    }
  };

  const getButtonLink = () => {
    return questId ? `/quests` : '/quests';
  };

  return (
    <Link href={getButtonLink()}>
      <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-amber-500 to-slate-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        
        {/* Image Section with Overlay */}
        <div className="relative h-48 overflow-hidden">
          {coverImageUrl ? (
            <>
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/80 to-amber-600/80 flex items-center justify-center text-white text-xl font-bold" style={{display: 'none'}}>
                <span className="text-center px-4">{title}</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-500 via-amber-500 to-slate-700 flex items-center justify-center text-white relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
              <div className="relative text-center px-4">
                <div className="text-3xl mb-2">✨</div>
                <span className="text-xl font-bold">{title}</span>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${getStatusColor(status)} border border-white/20`}>
              {getStatusText(status)}
            </span>
          </div>
          
          {/* Icon Badge */}
          <div className="absolute top-4 left-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-900 font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              View Quest →
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6 relative">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-slate-700 transition-colors duration-300">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-sm">
            {description}
          </p>
          
          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs font-bold text-amber-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${getStatusGradient(status)} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Reward Section */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            <span className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              🎁 {reward}
            </span>
            <span className="text-xs text-gray-400 italic">Tap to participate</span>
          </div>
          
          {/* Decorative Element */}
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-100 to-transparent rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </Link>
  );
}