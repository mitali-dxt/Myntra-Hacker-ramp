"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Zap, TrendingUp, Settings, Shield, Star, 
  Package, DollarSign, Eye, ChevronRight, BarChart3,
  UserPlus, Search, Calendar, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCreators: 0,
    activeCreators: 0,
    totalDrops: 0,
    totalQuests: 0,
    totalRevenue: 0,
    totalUsers: 0
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "me" })
      });
      const data = await res.json();
      
      console.log("Admin auth check response:", data);
      
      if (!data.user || data.user.role !== "ADMIN") {
        console.log("Not admin, redirecting to login");
        router.push("/auth/login");
        return;
      }
      console.log("Admin authenticated successfully");
      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch real stats from APIs
      const [creatorsRes, questsRes] = await Promise.all([
        fetch('/api/admin/creators').catch(() => ({ ok: false })),
        fetch('/api/admin/challenges').catch(() => ({ ok: false }))
      ]);

      let totalCreators = 0;
      let activeCreators = 0;
      let totalQuests = 0;

      if (creatorsRes.ok) {
        const creators = await creatorsRes.json();
        totalCreators = creators.length;
        activeCreators = creators.filter(c => c.status === 'active').length;
      }

      if (questsRes.ok) {
        const quests = await questsRes.json();
        totalQuests = quests.length;
      }

      setStats({
        totalCreators,
        activeCreators,
        totalDrops: 67,
        totalQuests,
        totalRevenue: 2450000,
        totalUsers: 8920
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data as fallback
      setStats({
        totalCreators: 24,
        activeCreators: 18,
        totalDrops: 67,
        totalQuests: 156,
        totalRevenue: 2450000,
        totalUsers: 8920
      });
    }
  };

  const managementCards = [
    {
      id: 'creators',
      title: 'Creator Management',
      description: 'Manage creator accounts, permissions, and performance',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      stats: [
        { label: 'Total Creators', value: stats.totalCreators },
        { label: 'Active', value: stats.activeCreators },
        { label: 'Revenue Generated', value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L` }
      ],
      actions: [
        { label: 'View All Creators', action: () => router.push('/admin/creators') },
        { label: 'Add New Creator', action: () => router.push('/admin/creators?modal=create') }
      ]
    },
    {
      id: 'quests',
      title: 'Quest Management',
      description: 'Create and manage style quests and challenges',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      stats: [
        { label: 'Active Quests', value: stats.totalQuests },
        { label: 'Participants', value: '12.4K' },
        { label: 'Completion Rate', value: '67%' }
      ],
      actions: [
        { label: 'Manage Quests', action: () => router.push('/admin/quests') },
        { label: 'Create Quest', action: () => router.push('/admin/quests/create') }
      ]
    },
    {
      id: 'drops',
      title: 'Drops Overview',
      description: 'Monitor creator drops and marketplace performance',
      icon: Package,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      stats: [
        { label: 'Total Drops', value: stats.totalDrops },
        { label: 'Live Now', value: 12 },
        { label: 'Avg. Sell Rate', value: '89%' }
      ],
      actions: [
        { label: 'View All Drops', action: () => router.push('/drops') },
        { label: 'Drop Analytics', action: () => router.push('/admin/analytics/drops') }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Comprehensive insights and performance metrics',
      icon: BarChart3,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      stats: [
        { label: 'Total Users', value: `${(stats.totalUsers / 1000).toFixed(1)}K` },
        { label: 'Monthly Growth', value: '+23%' },
        { label: 'Engagement', value: '94%' }
      ],
      actions: [
        { label: 'View Reports', action: () => router.push('/admin/analytics') },
        { label: 'Export Data', action: () => console.log('Export data') }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Add Creator',
      description: 'Create new creator account',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => router.push('/admin/creators?modal=create')
    },
    {
      title: 'Create Quest',
      description: 'Launch new style quest',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => router.push('/admin/quests')
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: () => router.push('/admin/analytics')
    },
    {
      title: 'System Settings',
      description: 'Configure app settings',
      icon: Settings,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      action: () => router.push('/admin/settings')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-300 text-lg">Myntra Hacker Ramp Management Center</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalCreators}</div>
                  <div className="text-slate-300 text-sm">Creators</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalDrops}</div>
                  <div className="text-slate-300 text-sm">Drops</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalQuests}</div>
                  <div className="text-slate-300 text-sm">Quests</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-white">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
                  <div className="text-slate-300 text-sm">Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.bgColor} border border-slate-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:scale-105 group`}
              >
                <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-slate-600 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Management Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Management Center</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {managementCards.map((card) => (
              <div
                key={card.id}
                className={`bg-white rounded-3xl shadow-lg border ${card.borderColor} overflow-hidden hover:shadow-xl transition-shadow`}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${card.color} text-white p-6`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{card.title}</h3>
                      <p className="text-white/80">{card.description}</p>
                    </div>
                  </div>
                </div>

                {/* Card Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {card.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-slate-600 text-sm">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="space-y-3">
                    {card.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-between group"
                      >
                        <span>{action.label}</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
            <Activity className="w-6 h-6 text-slate-600" />
            <span>Recent Activity</span>
          </h2>
          
          <div className="space-y-4">
            {[
              { type: 'creator', message: 'New creator "Diya Mitali" registered', time: '2 hours ago', icon: Users, color: 'text-blue-500' },
              { type: 'drop', message: 'Drop "Summer Vibes" went live', time: '4 hours ago', icon: Package, color: 'text-emerald-500' },
              { type: 'quest', message: 'Quest "Monsoon Style" completed by 45 users', time: '6 hours ago', icon: Zap, color: 'text-purple-500' },
              { type: 'analytics', message: 'Weekly analytics report generated', time: '1 day ago', icon: BarChart3, color: 'text-amber-500' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
                <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{activity.message}</p>
                  <p className="text-slate-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}