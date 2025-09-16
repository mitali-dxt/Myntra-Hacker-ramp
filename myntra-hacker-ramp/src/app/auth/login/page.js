"use client";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", ...form }) 
    });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error || "Login failed");
      return;
    }
    
    const data = await res.json();
    console.log("Login response:", data); // Debug log
    
    // Redirect based on user role
    if (data.user && data.user.role === "ADMIN") {
      console.log("Redirecting to admin dashboard");
      location.href = "/admin";
    } else {
      console.log("Redirecting to profile");
      location.href = "/profile";
    }
  }

  function fillAdminCredentials() {
    setForm({ email: "admin@myntra.com", password: "myntra@12345" });
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <div className="text-2xl font-bold mb-2">Welcome back</div>
        <div className="text-sm text-gray-500 mb-4">Log in to manage your capsule collections and votes.</div>
        
        {/* Admin Credentials Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Admin Access (Hackathon Demo)</h3>
          <div className="text-xs text-blue-700 mb-2">
            <div><strong>Email:</strong> admin@myntra.com</div>
            <div><strong>Password:</strong> myntra@12345</div>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Use Admin Credentials
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          <input 
            required 
            type="email" 
            value={form.email} 
            onChange={e=>setForm({ ...form, email: e.target.value })} 
            placeholder="Email" 
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" 
          />
          <input 
            required 
            type="password" 
            value={form.password} 
            onChange={e=>setForm({ ...form, password: e.target.value })} 
            placeholder="Password" 
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" 
          />
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <button className="mt-2 bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition-colors">
            Log in
          </button>
          <a href="/auth/signup" className="text-sm text-gray-700 underline mt-1 text-center hover:text-gray-900">
            Create an account
          </a>
        </form>
      </div>
    </div>
  );
}


