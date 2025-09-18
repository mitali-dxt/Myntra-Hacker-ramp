"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function MyTribesPage() {
  const [tribes, setTribes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [message, setMessage] = useState("");
  const [batchOffset, setBatchOffset] = useState(0);
  const [batchTotal, setBatchTotal] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    fetch("/api/my-tribes").then(r=>r.json()).then(setTribes);
    fetch("/api/products").then(r=>r.json()).then(setProducts);
    fetch("/api/auth", { method: "POST", body: JSON.stringify({ action: "me" }) })
      .then(r=>r.json()).then(d => setUser(d.user));
  }, []);

  async function addProductsToTribe() {
    if (!selectedTribe || selectedProducts.length === 0) return;
    const res = await fetch("/api/tribes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addProducts",
        tribeId: selectedTribe._id,
        productIds: selectedProducts
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setTribes(tribes.map(t => t._id === selectedTribe._id ? updated : t));
      setSelectedProducts([]);
      setAiResults([]);
      setMessage("Products added to tribe!");
    }
  }

  async function classifyBatch(tribe, offset) {
    const res = await fetch("/api/ai/classify-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tribeName: tribe.name,
        tribeDescription: tribe.description,
        tribeTags: tribe.tags,
        offset,
        limit: 5
      })
    });
    if (!res.ok) return { results: [], nextOffset: null, total: 0 };
    return res.json();
  }

  async function classifyAllInBatches(tribe) {
    setAiLoading(true);
    setMessage("");
    setSelectedTribe(tribe);
    setSelectedProducts([]);
    setAiResults([]);
    setBatchOffset(0);
    setBatchTotal(null);
    setProgress({ done: 0, total: 0 });

    // First batch to get total
    let { results, nextOffset, total } = await classifyBatch(tribe, 0);
    setAiResults(results);
    setBatchTotal(total);
    setBatchOffset(nextOffset ?? 0);
    setProgress({ done: Math.min(5, total), total });

    // Loop remaining batches sequentially
    let currentOffset = nextOffset;
    while (currentOffset !== null) {
      const r = await classifyBatch(tribe, currentOffset);
      setAiResults(prev => [...prev, ...r.results]);
      currentOffset = r.nextOffset;
      setBatchOffset(r.nextOffset ?? 0);
      setProgress(prev => ({ done: Math.min(prev.done + 5, r.total || prev.total), total: r.total || prev.total }));
    }

    setAiLoading(false);
  }

  const canLoadMore = batchOffset && batchOffset < (batchTotal ?? 0);

  if (!user) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Tribes</h1>
          <p className="text-gray-600 mb-4">Please log in to manage your tribes.</p>
          <a href="/auth/login" className="bg-pink-600 text-white px-4 py-2 rounded">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Tribes</h1>
        <div className="text-sm text-gray-500">Manage your fashion tribes and add products.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tribes.map(tribe => (
          <div key={tribe._id} className="bg-white rounded shadow overflow-hidden">
            {tribe.coverImage && (
              <div className="relative w-full h-32">
                <Image src={tribe.coverImage} alt={tribe.name} fill className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="text-lg font-semibold">{tribe.name}</div>
              <div className="text-gray-600 text-sm mt-1">{tribe.description}</div>
              <div className="text-xs text-gray-400 mt-3">Members: {tribe.memberCount}</div>
              <div className="text-xs text-gray-400">Products: {tribe.products?.length || 0}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setSelectedTribe(tribe); setSelectedProducts([]); setAiResults([]); setBatchOffset(0); setBatchTotal(null); setProgress({ done: 0, total: 0 }); }}
                  className="flex-1 bg-gray-800 text-white py-2 rounded text-sm"
                >
                  Add Products
                </button>
                <button
                  onClick={() => classifyAllInBatches(tribe)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 rounded text-sm hover:from-pink-500 hover:to-purple-500 active:scale-[0.99] transition"
                >
                  <Sparkles size={16} /> {aiLoading && selectedTribe?._id === tribe._id ? `Classifying…${progress.total ? ` ${Math.min(progress.done, progress.total)}/${progress.total}` : ''}` : 'AI Classify'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTribe && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Products to {selectedTribe.name}</h2>

          {aiResults.length > 0 && (
            <div className="mb-6">
              <div className="font-semibold mb-2">AI Suggestions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiResults.map(r => (
                  <div key={r.product._id + String(r.score)} className="border rounded p-3">
                    {r.product.images?.[0] && (
                      <div className="relative w-full aspect-[3/4] mb-2">
                        <Image src={r.product.images[0]} alt={r.product.title} fill className="object-cover rounded" />
                      </div>
                    )}
                    <div className="text-sm font-semibold">{r.product.title}</div>
                    <div className="text-xs text-gray-500">{r.product.brand} • Score: {(r.score*100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-600 mt-1">Reason: {r.reason}</div>
                    <button
                      onClick={() => setSelectedProducts(prev => prev.includes(r.product._id) ? prev : [...prev, r.product._id])}
                      className="mt-2 w-full bg-pink-600 text-white py-2 rounded text-sm"
                    >Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Selected: {selectedProducts.length} products
            </div>
            <div className="flex gap-2">
              <button
                onClick={addProductsToTribe}
                disabled={selectedProducts.length === 0}
                className="bg-pink-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >Add to Tribe</button>
              <button
                onClick={() => { setSelectedTribe(null); setSelectedProducts([]); setAiResults([]); setBatchOffset(0); setBatchTotal(null); setProgress({ done: 0, total: 0 }); }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >Cancel</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {products.map(product => (
              <div key={product._id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedProducts([...selectedProducts, product._id]);
                    } else {
                      setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                    }
                  }}
                  className="absolute top-2 left-2 z-10"
                />
                {product.images?.[0] && (
                  <div className="relative w-full aspect-[3/4]">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover rounded" />
                  </div>
                )}
                <div className="text-xs mt-1">
                  <div className="font-semibold truncate">{product.title}</div>
                  <div className="text-gray-500">{product.brand}</div>
                </div>
              </div>
            ))}
          </div>

          {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
        </div>
      )}
    </div>
  );
}
