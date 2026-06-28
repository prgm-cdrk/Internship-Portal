'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient-shift"></div>
      
      {/* Animated Geometric Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float"></div>
      <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-accent-primary/5 blur-3xl animate-pulse_slow"></div>
      <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full border border-accent-primary/10 animate-rotate_slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-dark-800/20 blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-full max-w-md z-10">
        
        {/* Main Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-10 shadow-2xl">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
              Login
            </h1>
            <p className="text-dark-400 text-sm font-light">
              Access your internship portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Email Field */}
            <div>
              <label className="block text-dark-200 font-medium mb-3 text-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-dark-200 font-medium mb-3 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-light text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-dark-700"></div>
            <span className="px-3 text-dark-400 text-xs">or</span>
            <div className="flex-1 border-t border-dark-700"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-dark-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-accent-primary hover:text-accent-light font-semibold transition"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-400 text-xs mt-8 font-light">
          © 2024 InternHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
