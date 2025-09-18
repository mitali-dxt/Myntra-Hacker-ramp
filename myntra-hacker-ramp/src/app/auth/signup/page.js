"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", name: "", age: "", gender: "OTHER", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", { method: "POST", body: JSON.stringify({ action: "signup", ...form, age: form.age ? Number(form.age) : undefined }) });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error || "Signup failed");
      return;
    }
    setOk(true);
    setTimeout(()=>{ location.href = "/profile"; }, 600);
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
        <div className="text-2xl font-bold mb-2">Create your account</div>
        <div className="text-sm text-gray-500 mb-4">Join to create capsules and share votes with friends.</div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          <input required value={form.username} onChange={e=>setForm({ ...form, username: e.target.value })} placeholder="Username" className="border rounded px-3 py-2" />
          <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="0" value={form.age} onChange={e=>setForm({ ...form, age: e.target.value })} placeholder="Age" className="border rounded px-3 py-2" />
            <select value={form.gender} onChange={e=>setForm({ ...form, gender: e.target.value })} className="border rounded px-3 py-2">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <input required type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} placeholder="Email" className="border rounded px-3 py-2" />
          <input type="tel" value={form.phone} onChange={e=>setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="border rounded px-3 py-2" />
          <input required type="password" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} placeholder="Password" className="border rounded px-3 py-2" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          {ok && <div className="text-sm text-green-700">Signup successful! Redirecting…</div>}
          <button className="mt-2 bg-pink-600 text-white py-2 rounded">Sign up</button>
          <a href="/auth/login" className="text-sm text-gray-700 underline mt-1">Have an account? Log in</a>
        </form>
      </div>
    </div>
  );
}


