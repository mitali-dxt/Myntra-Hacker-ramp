"use client";

import { Users, Leaf, Sparkles, Star, Trophy, Shirt, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SectionTitle from '@/components/SectionTitle';
import TribeCard from '@/components/TribeCard';
import CreatorDropCard from '@/components/CreatorDropCard';
import StyleQuestCard from '@/components/StyleQuestCard';
import { ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [quests, setQuests] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const [questsRes, tribesRes, dropsRes] = await Promise.all([
        fetch("/api/quests"),
        fetch("/api/tribes"),
        fetch("/api/drops")
      ]);
      
      const [questsData, tribesData, dropsData] = await Promise.all([
        questsRes.json(),
        tribesRes.json(),
        dropsRes.json()
      ]);
      
      setQuests(questsData.slice(0, 3)); // Show only first 3 quests
      setTribes(tribesData.slice(0, 3)); // Show only first 3 tribes
      setDrops(dropsData.slice(0, 4)); // Show only first 4 drops
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }



  function getQuestIcon(status) {
    switch (status) {
      case 'upcoming': return <Star size={24} />;
      case 'active': return <Trophy size={24} />;
      case 'voting': return <Shirt size={24} />;
      default: return <Star size={24} />;
    }
  }

  function getQuestReward(quest) {
    if (quest.prizeDiscountPercentage > 0) {
      return `${quest.prizeDiscountPercentage}% OFF`;
    }
    if (quest.prizeBadgeName) {
      return quest.prizeBadgeName;
    }
    return "Amazing Prizes";
  }

  function getQuestProgress(quest) {
    // Calculate progress based on quest status and dates
    const now = new Date();
    const startDate = new Date(quest.submissionStartDate);
    const endDate = new Date(quest.submissionEndDate || quest.votingEndDate);
    
    if (quest.status === 'completed') return 100;
    if (quest.status === 'upcoming') return 0;
    
    // For active/voting quests, calculate progress based on time elapsed
    const totalTime = endDate - startDate;
    const elapsedTime = now - startDate;
    const progress = Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
    
    return Math.round(progress);
  }
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-cover bg-center h-96 rounded-lg shadow-lg" style={{backgroundImage: "url('https://placehold.co/1200x400/E91E63/FFFFFF?text=Biggest+Fashion+Sale\\nUP+TO+80%25+OFF')"}}>
        </div>
      </section>
      
      {/* --- FEATURE 1: Fashion Tribes --- */}
      <section className="mb-16">
        <SectionTitle 
          title="Find Your Fashion Tribe"
          subtitle="Connect, compete, and get inspired in communities that get your style."
        />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : tribes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tribes.map((tribe, index) => {
              const iconColors = ['text-blue-500', 'text-green-500', 'text-yellow-500'];
              const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-yellow-50'];
              const icons = [<Users size={40} />, <Leaf size={40} />, <Sparkles size={40} />];
              
              return (
                <Link key={tribe._id} href={`/tribes/${tribe.slug}`}>
                  <TribeCard 
                    icon={<div className={iconColors[index % 3]}>{icons[index % 3]}</div>}
                    title={tribe.name}
                    description={tribe.description}
                    bgColor={bgColors[index % 3]}
                    memberCount={tribe.memberCount}
                    productCount={tribe.products?.length || 0}
                    coverImage={tribe.coverImage}
                    slug={tribe.slug}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Tribes Available</h3>
            <p className="text-gray-500 mb-6">Check back soon for exciting fashion communities!</p>
            <Link 
              href="/tribes" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
            >
              Explore Tribes <LinkIcon size={16} />
            </Link>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            href="/tribes" 
            className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800 transition-colors duration-300"
          >
            View All Tribes <LinkIcon size={16} />
          </Link>
        </div>
      </section>

      {/* --- FEATURE 2: Creator-Led Drops --- */}
      <section className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
        <SectionTitle 
          title="FWD Creator Drops"
          subtitle="Limited edition capsule collections, curated by your favorite influencers."
        />
        {loading ? (
          <div className="flex overflow-x-auto pb-6 -mb-6 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : drops.length > 0 ? (
          <div className="flex overflow-x-auto pb-6 -mb-6 gap-6">
            {drops.map((drop) => (
              <CreatorDropCard 
                key={drop._id}
                creatorName={drop.creatorName}
                collectionName={drop.collectionName}
                imageUrl={drop.imageUrl}
                startsAt={drop.startsAt}
                endsAt={drop.endsAt}
                productCount={drop.products?.length || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-xl">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Drops</h3>
            <p className="text-gray-500 mb-6">Check back soon for amazing creator collections!</p>
            <Link 
              href="/drops" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300"
            >
              Explore Drops <LinkIcon size={16} />
            </Link>
          </div>
        )}
        <div className="mt-6">
          <Link href="/drops" className="inline-flex items-center gap-2 text-pink-700 font-semibold hover:text-pink-800 transition-colors duration-300">Explore All Drops <LinkIcon size={16} /></Link>
        </div>
      </section>

      {/* --- FEATURE 3: Collab Shopping --- */}
      <section className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
        <SectionTitle 
          title="Shop Together with Friends"
          subtitle="Create shopping sessions, browse together, and make group decisions in real-time."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Real-time Shopping */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              👥
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Sync</h3>
            <p className="text-gray-600 mb-4">Browse together and see what your friends are looking at in real-time. No more sharing screenshots!</p>
            <div className="text-sm text-blue-600 font-semibold">✨ Live synchronization</div>
          </div>

          {/* Group Voting */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              🗳️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Group Decisions</h3>
            <p className="text-gray-600 mb-4">Vote on products together and let your squad help you choose the perfect outfit.</p>
            <div className="text-sm text-green-600 font-semibold">💖 Social voting system</div>
          </div>

          {/* Shared Cart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              🛒
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Shared Carts</h3>
            <p className="text-gray-600 mb-4">Add items to shared carts and split the cost with friends for group purchases.</p>
            <div className="text-sm text-purple-600 font-semibold">💰 Split payments</div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/collab" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping Party <ShoppingBag size={20} />
            </Link>
            <Link 
              href="/collab?demo=true" 
              className="inline-flex items-center gap-2 text-amber-700 bg-white border-2 border-amber-200 px-6 py-3 rounded-xl font-semibold hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              See How It Works <LinkIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURE 4: Style Quests --- */}
      <section className="mb-12">
        <SectionTitle 
          title="Style Quests"
          subtitle="Complete challenges, unlock rewards, and level up your fashion game."
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
                <div className="h-2 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : quests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quests.map((quest) => (
              <StyleQuestCard
                key={quest._id}
                icon={getQuestIcon(quest.status)}
                title={quest.title}
                reward={getQuestReward(quest)}
                progress={getQuestProgress(quest)}
                status={quest.status}
                description={quest.description}
                questId={quest._id}
                coverImageUrl={quest.coverImageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Quests</h3>
            <p className="text-gray-500 mb-6">Check back soon for exciting style challenges!</p>
            <Link 
              href="/quests" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300"
            >
              View All Quests <LinkIcon size={16} />
            </Link>
          </div>
        )}
        
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link 
            href="/quests" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View All Quests <LinkIcon size={16} />
          </Link>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-700 bg-white border-2 border-gray-200 px-6 py-3 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
          >
            Browse Products <LinkIcon size={16} />
          </Link>
          <Link 
            href="/collab" 
            className="inline-flex items-center gap-2 text-gray-700 bg-white border-2 border-gray-200 px-6 py-3 rounded-xl font-semibold hover:border-pink-300 hover:text-pink-600 transition-all duration-300"
          >
            Start Collab Shopping <ShoppingBag size={16} />
          </Link>
        </div>
      </section>

      {/* --- PLATFORM OVERVIEW SECTION --- */}
      <section className="mb-16 bg-gradient-to-br from-slate-50 to-gray-100 -mx-4 lg:-mx-8 px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Everything Fashion
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              In One Place
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, connect, create, and shop - all in one revolutionary fashion platform designed for the modern style enthusiast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Fashion Tribes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              👥
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fashion Tribes</h3>
            <p className="text-gray-600 text-sm mb-4">Join style communities that match your vibe. Connect with like-minded fashion enthusiasts.</p>
            <div className="text-xs text-blue-600 font-semibold">✨ Community-driven</div>
          </div>

          {/* Creator Drops */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              🎨
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Creator Drops</h3>
            <p className="text-gray-600 text-sm mb-4">Exclusive collections curated by your favorite fashion influencers and creators.</p>
            <div className="text-xs text-purple-600 font-semibold">🌟 Limited edition</div>
          </div>

          {/* Style Quests */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              🏆
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Style Quests</h3>
            <p className="text-gray-600 text-sm mb-4">Complete fashion challenges, showcase your style, and win amazing rewards and badges.</p>
            <div className="text-xs text-pink-600 font-semibold">🎁 Rewarding challenges</div>
          </div>

          {/* Collab Shopping */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              🛒
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Collab Shopping</h3>
            <p className="text-gray-600 text-sm mb-4">Shop with friends in real-time. Vote together and make group fashion decisions.</p>
            <div className="text-xs text-amber-600 font-semibold">🤝 Social shopping</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Fashion Journey?</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">Join thousands of fashion enthusiasts who are already discovering, creating, and shopping in revolutionary ways.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Free <Star size={20} />
              </Link>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 text-gray-700 bg-gray-100 border-2 border-gray-200 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-200 transition-all duration-300"
              >
                Browse Products <ShoppingBag size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}