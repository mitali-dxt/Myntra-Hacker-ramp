"use client";

import { Users, Leaf, Sparkles, Star, Trophy, Shirt } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';
import TribeCard from '@/components/TribeCard';
import CreatorDropCard from '@/components/CreatorDropCard';
import StyleQuestCard from '@/components/StyleQuestCard';

export default function HomePage() {
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
      </section>

      {/* --- FEATURE 3: Style Quests --- */}
      <section className="mb-12">
        <SectionTitle 
          title="Style Quests"
          subtitle="Complete challenges, unlock rewards, and level up your fashion game."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StyleQuestCard
            icon={<Star size={24} />}
            title="Festive Friday"
            reward="20% OFF"
            progress={75}
          />
          <StyleQuestCard
            icon={<Trophy size={24} />}
            title="Accessorize It!"
            reward="New Badge"
            progress={40}
          />
          <StyleQuestCard
            icon={<Shirt size={24} />}
            title="Monochrome Magic"
            reward="50 Insider Points"
            progress={90}
          />
        </div>
      </section>
    </div>
  );
}