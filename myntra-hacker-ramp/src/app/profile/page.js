"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [drops, setDrops] = useState([]);
  const [newName, setNewName] = useState("");
  const [poll, setPoll] = useState(null);

  async function load() {
    const me = await fetch("/api/auth", { method: "POST", body: JSON.stringify({ action: "me" }) }).then(r=>r.json());
    setUser(me.user);
    const myDrops = await fetch("/api/my-drops").then(r=>r.json());
    setDrops(myDrops);
  }
  useEffect(()=>{ load(); }, []);

  async function updateProfile(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    await fetch('/api/user', { method: 'POST', body: JSON.stringify(payload) });
    await load();
  }

  async function createDrop() {
    const res = await fetch("/api/my-drops", { method: "POST", body: JSON.stringify({ action: "create", name: newName }) });
    const d = await res.json();
    setDrops([d, ...drops]);
    setNewName("");
  }

  async function createPoll() {
    const res = await fetch("/api/polls", { method: "POST", body: JSON.stringify({ action: "create", name: "My Vote" }) });
    setPoll(await res.json());
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6">
        <div className="text-2xl font-bold">Profile</div>
        <div className="text-sm text-gray-500">Manage your capsule collections and polls.</div>
      </div>
      {!user ? (
        <div className="bg-white rounded shadow p-5">
          <div className="font-semibold mb-2">You are not logged in</div>
          <a href="/auth/login" className="inline-block bg-pink-600 text-white px-4 py-2 rounded">Go to Login</a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-5">
            <div className="font-semibold">Welcome, {user.displayName || user.username}</div>
            <form onSubmit={updateProfile} className="grid grid-cols-2 gap-3 mt-3">
              <input name="displayName" defaultValue={user.displayName || ''} placeholder="Display name" className="border rounded px-3 py-2 col-span-2" />
              <input name="name" defaultValue={user.name || ''} placeholder="Full name" className="border rounded px-3 py-2" />
              <input name="age" type="number" defaultValue={user.age || ''} placeholder="Age" className="border rounded px-3 py-2" />
              <select name="gender" defaultValue={user.gender || 'OTHER'} className="border rounded px-3 py-2">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Non-binary</option>
                <option value="OTHER">Other</option>
              </select>
              <input name="phone" defaultValue={user.phone || ''} placeholder="Phone" className="border rounded px-3 py-2" />
              <button className="bg-gray-800 text-white px-4 py-2 rounded">Save</button>
            </form>
          </div>
          <div className="bg-white rounded shadow p-5">
            <div className="font-semibold mb-2">My Capsule Collections</div>
            <div className="flex gap-2 mb-3">
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New collection name" className="border rounded px-3 py-2" />
              <button onClick={createDrop} className="bg-gray-800 text-white px-4 py-2 rounded">Create</button>
            </div>
            <div className="space-y-3">
              {drops.map(d => (
                <div key={d._id} className="border rounded p-3">
                  <div className="font-semibold">{d.collectionName}</div>
                  <div className="text-xs text-gray-500">Share vote link: /vote/{d.code || '—'}</div>
                  <div className="text-xs text-gray-500">Products: {d.products?.length || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


