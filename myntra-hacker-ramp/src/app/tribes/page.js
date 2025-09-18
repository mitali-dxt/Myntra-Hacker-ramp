"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function TribesPage() {
  const [tribes, setTribes] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", coverImage: "", tags: "" });

  useEffect(() => {
    fetch("/api/tribes").then(r=>r.json()).then(setTribes);
    fetch("/api/auth", { method: "POST", body: JSON.stringify({ action: "me" }) })
      .then(r=>r.json()).then(d => setUser(d.user));
  }, []);

  async function createTribe(e) {
    e.preventDefault();
    const res = await fetch("/api/tribes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        name: createForm.name,
        description: createForm.description,
        coverImage: createForm.coverImage,
        tags: createForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        ownerId: user._id
      })
    });
    if (res.ok) {
      const newTribe = await res.json();
      setTribes([newTribe, ...tribes]);
      setShowCreate(false);
      setCreateForm({ name: "", description: "", coverImage: "", tags: "" });
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fashion Tribes</h1>
          <div className="text-sm text-gray-500">Join circles aligned to your style and discover creators.</div>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="bg-pink-600 text-white px-4 py-2 rounded">
            Create Tribe
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Tribe</h2>
          <form onSubmit={createTribe} className="grid grid-cols-1 gap-3">
            <input required value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="Tribe name" className="border rounded px-3 py-2" />
            <textarea value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Description" className="border rounded px-3 py-2" />
            <input value={createForm.coverImage} onChange={e => setCreateForm({...createForm, coverImage: e.target.value})} placeholder="Cover image URL (optional)" className="border rounded px-3 py-2" />
            <input value={createForm.tags} onChange={e => setCreateForm({...createForm, tags: e.target.value})} placeholder="Tags (comma-separated)" className="border rounded px-3 py-2" />
            <div className="flex gap-2">
              <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tribes.map(t => (
          <Link key={t._id} href={`/tribes/${t.slug}`} className="bg-white rounded shadow overflow-hidden block">
            {t.coverImage && (
              <div className="relative w-full h-32">
                <Image src={t.coverImage} alt={t.name} fill className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="text-gray-600 text-sm mt-1 line-clamp-2">{t.description}</div>
              <div className="text-xs text-gray-400 mt-3">Members: {t.memberCount}</div>
              <div className="text-xs text-gray-400">Products: {t.products?.length || 0}</div>
              <div className="mt-3 text-pink-700 text-sm underline">View details</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


