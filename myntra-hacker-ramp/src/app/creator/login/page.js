"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Shield, AlertCircle, Loader } from 'lucide-react';

export default function CreatorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/creator/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store creator session
        localStorage.setItem('creator_token', data.token);
        localStorage.setItem('creator_user', JSON.stringify(data.creator));
        
        // Redirect to creator dashboard
        router.push('/creator/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-slate-900">
                Creator <span className="text-amber-600">Portal</span>
              </h1>
              <p className="text-slate-600">Login to manage your drops</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-900 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white py-4 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Contact your admin for login credentials</p>
                <p>• Username and password are case-sensitive</p>
                <p>• Account will be locked after 5 failed attempts</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Demo Credentials</h4>
              <div className="space-y-1 text-sm text-amber-800">
                <p><strong>Username:</strong> diyamitali120</p>
                <p><strong>Password:</strong> A0w^FuyBz#BO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-sm">
            Creator Portal - Myntra Hacker Ramp
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-slate-500">
            <span>Secure Login</span>
            <span>•</span>
            <span>Account Protection</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}