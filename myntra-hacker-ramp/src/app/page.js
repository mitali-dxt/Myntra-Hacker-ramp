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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
  }, []);

  async function fetchQuests() {
    try {
      const res = await fetch("/api/quests");
      const data = await res.json();
      setQuests(data.slice(0, 3)); // Show only first 3 quests
    } catch (error) {
      console.error("Failed to fetch quests:", error);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TribeCard 
            icon={<Users size={40} className="text-blue-500" />}
            title="Streetwear Squad"
            description="For the hypebeasts and sneakerheads. Share your latest cops and styling tips."
            bgColor="bg-blue-50"
          />
          <TribeCard 
            icon={<Leaf size={40} className="text-green-500" />}
            title="Eco-Chic Circle"
            description="Sustainable fashion lovers unite! Discover ethical brands and upcycling hacks."
            bgColor="bg-green-50"
          />
          <TribeCard 
            icon={<Sparkles size={40} className="text-yellow-500" />}
            title="Desi Glam Gang"
            description="All things ethnic wear. From wedding lehengas to everyday kurtas, flaunt it all."
            bgColor="bg-yellow-50"
          />
        </div>
      </section>

      {/* --- FEATURE 2: Creator-Led Drops --- */}
      <section className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
        <SectionTitle 
          title="FWD Creator Drops"
          subtitle="Limited edition capsule collections, curated by your favorite influencers."
        />
        <div className="flex overflow-x-auto pb-6 -mb-6">
          <CreatorDropCard 
            creatorName="Aisha Kumar"
            collectionName="Monsoon Neutrals"
            imageUrl="https://placehold.co/300x400/a3b18a/FFFFFF?text=Aisha"
          />
          <CreatorDropCard 
            creatorName="Rohan Sharma"
            collectionName="Campus Cool"
            imageUrl="https://placehold.co/300x400/588157/FFFFFF?text=Rohan"
          />
          <CreatorDropCard 
            creatorName="Priya Singh"
            collectionName="Festive Fusion"
            imageUrl="https://placehold.co/300x400/3a5a40/FFFFFF?text=Priya"
          />
          <CreatorDropCard 
            creatorName="Vikram Reddy"
            collectionName="Urban Explorer"
            imageUrl="https://placehold.co/300x400/344e41/FFFFFF?text=Vikram"
          />
        </div>
        <div className="mt-6">
          <Link href="/drops" className="inline-flex items-center gap-2 text-pink-700 font-semibold">Explore Drops <LinkIcon size={16} /></Link>
        </div>
      </section>

      {/* --- FEATURE 3: Style Quests --- */}
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
    </div>
  );
}