"use client";

import { useState, useEffect } from 'react';
import { Clock, Zap, CheckCircle, Calendar, Users, ShoppingBag } from 'lucide-react';

export default function DropStatus({ drop, className = '' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

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

          // Calculate progress for upcoming drops (assume 7 days max countdown)
          const totalTime = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
          const elapsed = totalTime - difference;
          setProgress(Math.max(0, Math.min(100, (elapsed / totalTime) * 100)));
        } else {
          setTimeLeft('');
          setProgress(100);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    } else if (drop.status === 'live') {
      // For live drops, calculate progress based on sold items
      if (drop.total_stock && drop.sold_count) {
        setProgress((drop.sold_count / drop.total_stock) * 100);
      }
    }
  }, [drop.launch_datetime, drop.status, drop.total_stock, drop.sold_count]);

  const getStatusConfig = () => {
    switch (drop.status) {
      case 'upcoming':
        return {
          icon: Clock,
          title: 'Coming Soon',
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          progressColor: 'from-slate-500 to-slate-700'
        };
      case 'live':
        return {
          icon: Zap,
          title: 'Live Now',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          progressColor: 'from-emerald-500 to-emerald-700'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: 'Sold Out',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          progressColor: 'from-gray-400 to-gray-600'
        };
      default:
        return {
          icon: Calendar,
          title: 'Scheduled',
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          progressColor: 'from-slate-500 to-slate-700'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} rounded-2xl border ${config.borderColor} p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center border ${config.borderColor}`}>
          <IconComponent className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h3 className={`font-bold ${config.color}`}>{config.title}</h3>
          <p className="text-gray-600 text-sm">
            {drop.status === 'upcoming' && 'Get ready for the drop'}
            {drop.status === 'live' && 'Shop now before it\'s gone'}
            {drop.status === 'completed' && 'This drop has ended'}
          </p>
        </div>
      </div>

      {/* Countdown for Upcoming */}
      {drop.status === 'upcoming' && timeLeft && (
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${config.color} mb-2`}>{timeLeft}</div>
            <div className="text-gray-600 text-sm">Until launch</div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`bg-gradient-to-r ${config.progressColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-right">{Math.round(progress)}% to launch</div>
        </div>
      )}

      {/* Live Status */}
      {drop.status === 'live' && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className={`font-semibold ${config.color}`}>Live Now</span>
          </div>
          
          {drop.total_stock && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Items Sold</span>
                <span className={`font-semibold ${config.color}`}>
                  {drop.sold_count || 0} / {drop.total_stock}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`bg-gradient-to-r ${config.progressColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {Math.round(progress)}% sold out
              </div>
            </div>
          )}
        </div>
      )}

      {/* Launch Date */}
      <div className="space-y-3">
        {drop.launch_datetime && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {drop.status === 'upcoming' ? 'Launches' : 'Launched'}: {new Date(drop.launch_datetime).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {drop.notification_count && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{drop.notification_count.toLocaleString()} people notified</span>
          </div>
        )}

        {drop.products && drop.products.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ShoppingBag className="w-4 h-4" />
            <span>{drop.products.length} exclusive items</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {drop.status === 'live' && drop.quick_shop_url && (
        <div className="mt-6">
          <a
            href={drop.quick_shop_url}
            className={`w-full bg-gradient-to-r ${config.progressColor} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quick Shop</span>
          </a>
        </div>
      )}
    </div>
  );
}