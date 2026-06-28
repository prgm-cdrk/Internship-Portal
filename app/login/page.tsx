'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">
        
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-dark-900 to-dark-950 rounded-3xl lg:rounded-r-none">
          <Image
            src="/login-illustration.png"
            alt="InternHub Illustration"
            width={400}
            height={500}
            className="max-w-full h-auto"
            priority
          />
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-dark rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                Intern<span className="text-accent-primary">Hub</span>
              </h1>
            </div>
            <p className="text-dark-300 text-sm font-light tracking-widest">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-white font-semibold mb-3 text-sm tracking-wide">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-5 py-4 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition duration-300"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white font-semibold mb-3 text-sm tracking-wide">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-5 py-4 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition duration-300"
                required
              />
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

          {/* Test Credentials */}
          <div className="mt-8 bg-dark-900 border border-accent-primary/30 rounded-xl p-5">
            <p className="text-accent-primary text-xs font-bold mb-3 uppercase tracking-wider">🔐 Test Credentials</p>
            <div className="space-y-2">
              <p className="text-dark-300 text-xs">
                Email: <span className="text-accent-primary font-mono">prgm.cdrk@gmail.com</span>
              </p>
              <p className="text-dark-300 text-xs">
                Password: <span className="text-accent-primary font-mono">MyOwnerP@ssw0rd123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
