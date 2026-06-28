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
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient-shift"></div>
      
      {/* Large floating orbs */}
      <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-accent-primary/8 blur-[100px] animate-float"></div>
      <div className="absolute bottom-20 left-5 w-72 h-72 rounded-full bg-accent-primary/6 blur-[80px] animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full bg-white/4 blur-[60px] animate-pulse_slow"></div>
      
      {/* Rotating ring */}
      <div className="absolute top-1/4 left-1/5 w-40 h-40 rounded-full border-2 border-accent-primary/15 animate-rotate_slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full border border-accent-primary/10 animate-rotate_slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-32 left-1/4 w-4 h-4 bg-accent-primary/30 rotate-45 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-accent-primary/25 rotate-12 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/3 right-1/5 w-5 h-5 bg-white/10 rotate-[30deg] animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-accent-primary/20 rotate-[60deg] animate-float" style={{ animationDelay: '5s' }}></div>
      
      {/* Glowing lines */}
      <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-accent-primary/20 to-transparent animate-pulse_slow"></div>
      <div className="absolute bottom-0 right-1/3 w-px h-40 bg-gradient-to-t from-transparent via-accent-primary/15 to-transparent animate-pulse_slow" style={{ animationDelay: '2s' }}></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-accent-primary/40 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-accent-primary/30 animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-white/20 animate-float" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute top-1/2 right-10 w-1.5 h-1.5 rounded-full bg-accent-primary/35 animate-float" style={{ animationDelay: '3.5s' }}></div>
      <div className="absolute bottom-20 right-1/5 w-2 h-2 rounded-full bg-accent-primary/25 animate-float" style={{ animationDelay: '4.5s' }}></div>

      <div className="relative w-full max-w-md z-10">
        
        {/* Card */}
        <div className="rounded-2xl border border-dark-600">
          <div className="bg-dark-800 rounded-2xl p-10 shadow-[0_0_30px_rgba(255,107,53,0.08)]">
          
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
        </div>

        {/* Footer */}
        <p className="text-center text-dark-400 text-xs mt-8 font-light">
          © 2024 InternHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
