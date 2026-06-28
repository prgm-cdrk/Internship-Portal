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
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-dark-950 to-dark-950"></div>
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl opacity-20"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Main Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl shadow-2xl p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-dark rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">
              Intern<span className="text-accent-primary">Hub</span>
            </h1>
            <p className="text-dark-300 text-sm font-light tracking-wide">
              WELCOME BACK TO YOUR JOURNEY
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="relative">
              <label className="block text-white font-semibold mb-3 text-sm">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-5 py-4 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition duration-300"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-primary">✉️</span>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-white font-semibold mb-3 text-sm">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-5 py-4 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition duration-300"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-primary">🔒</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-primary to-accent-light hover:shadow-lg hover:shadow-accent-primary/50 text-white font-bold py-4 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 transform hover:scale-105 active:scale-95"
            >
              {loading ? '⏳ SIGNING IN...' : '✨ SIGN IN'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-dark-700"></div>
            <span className="px-3 text-dark-400 text-xs font-light">or</span>
            <div className="flex-1 border-t border-dark-700"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-dark-300 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-accent-primary hover:text-accent-light font-bold transition"
            >
              Create one here →
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-dark-400 text-xs mt-8 font-light">
          © 2024 InternHub. Crafting meaningful internship experiences.
        </p>
      </div>
    </div>
  );
}
