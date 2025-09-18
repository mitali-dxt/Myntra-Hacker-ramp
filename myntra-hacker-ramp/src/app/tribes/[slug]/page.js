"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function TribeDetailPage({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/tribes/${slug}`).then(r=>r.json()).then(setData);
  }, [slug]);

  async function join() {
    if (!data) return;
    setJoining(true);
    const me = await fetch('/api/auth', { method:'POST', body: JSON.stringify({ action:'me' }) }).then(r=>r.json());
    if (!me.user) { location.href = '/auth/login'; return; }
    const res = await fetch('/api/tribes', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ action:'join', tribeId: data.tribe._id, userId: me.user._id })});
    const updated = await res.json();
    setData({ tribe: updated, isMember: true });
    setJoining(false);
  }

  if (!data) return <div className="container mx-auto px-4 lg:px-8 py-8">Loading…</div>;
  const { tribe, isMember } = data;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="bg-white rounded shadow overflow-hidden mb-6">
        {tribe.coverImage && (
          <div className="relative w-full h-48">
            <Image src={tribe.coverImage} alt={tribe.name} fill className="object-cover" />
          </div>
        )}
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{tribe.name}</h1>
            <div className="text-sm text-gray-600 mt-1">{tribe.description}</div>
            <div className="text-xs text-gray-400 mt-2">Members: {tribe.memberCount} • Products: {tribe.products?.length || 0}</div>
          </div>
          <div>
            {isMember ? (
              <span className="inline-block bg-green-100 text-green-700 text-sm px-3 py-2 rounded">Joined</span>
            ) : (
              <button onClick={join} disabled={joining} className="bg-pink-600 text-white px-4 py-2 rounded">
                {joining ? 'Joining…' : 'Join Tribe'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products in this tribe</h2>
        <Link href="/my-tribes" className="text-sm text-pink-700 underline">Manage my tribes</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tribe.products?.map(p => (
          <div key={p._id} className="bg-white rounded shadow p-3">
            {p.images?.[0] && (
              <div className="relative w-full aspect-[3/4] mb-2">
                <Image src={p.images[0]} alt={p.title} fill className="object-cover rounded" />
              </div>
            )}
            <div className="text-sm text-gray-500">{p.brand}</div>
            <div className="font-semibold">{p.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
