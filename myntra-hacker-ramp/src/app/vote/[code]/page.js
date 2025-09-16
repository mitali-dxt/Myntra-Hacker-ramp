"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VotePage() {
  const params = useParams();
  const code = params.code;
  const [poll, setPoll] = useState(null);
  const [userName, setUserName] = useState("");

  async function load() {
    const res = await fetch(`/api/polls?code=${code}`);
    const data = await res.json();
    setPoll(data);
  }
  useEffect(()=>{ load(); }, [code]);

  async function vote(itemId, value) {
    const res = await fetch("/api/collab", { method: "POST", body: JSON.stringify({ action: "vote", code, itemId, userName, value }) });
    const data = await res.json();
    setPoll(data);
  }

  if (!poll) return <div className="container mx-auto px-4 lg:px-8 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-4">
        <div className="text-2xl font-bold">Vote: {poll.name}</div>
        <div className="text-sm text-gray-500">Code: {poll.code}</div>
      </div>
      <div className="mb-4">
        <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Your name" className="border rounded px-3 py-2" />
      </div>
      <div className="space-y-3">
        {(poll.items||[]).map(it => (
          <div key={it._id} className="border rounded p-3">
            <div className="font-semibold text-sm">{it.product?.title}</div>
            <div className="text-xs text-gray-500">{it.product?.brand}</div>
            <div className="mt-2 flex gap-2 text-sm">
              <button onClick={()=>vote(it._id, 1)} className="px-2 py-1 bg-green-600 text-white rounded">Upvote</button>
              <button onClick={()=>vote(it._id, -1)} className="px-2 py-1 bg-red-600 text-white rounded">Downvote</button>
              <div className="ml-auto text-xs text-gray-700">Score: {(it.votes||[]).reduce((a,v)=>a+v.value,0)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


