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
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Intern<span className="text-accent-primary">Hub</span>
            </h1>
            <p className="text-dark-300 text-sm">
              Welcome back to your internship portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-light text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-dark-700"></div>
            <span className="px-3 text-dark-400 text-sm">or</span>
            <div className="flex-1 border-t border-dark-700"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-dark-300 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-accent-primary hover:text-accent-light font-medium transition"
            >
              Sign up here
            </Link>
          </p>

          {/* Test Credentials Info */}
          <div className="mt-8 bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-dark-300 text-xs font-medium mb-2">Test Credentials:</p>
            <p className="text-dark-400 text-xs">
              Email: <span className="text-accent-primary">prgm.cdrk@gmail.com</span>
            </p>
            <p className="text-dark-400 text-xs">
              Password: <span className="text-accent-primary">MyOwnerP@ssw0rd123</span>
            </p>
          </div>

        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 items-center justify-center">
        <img
          src="/login-illustration.svg"
          alt="Internship Portal Illustration"
          className="w-64 opacity-80"
        />
      </div>

      {/* Bottom Info - centered at bottom of window */}
      <div className="fixed bottom-0 left-0 right-0 text-center p-4">
        <p className="text-dark-400 text-xs">
          © 2024 InternHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
