// Registration page for new users
// Allows applicants and company managers to create accounts
// Owners are created manually in the database

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('APPLICANT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !name || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-accent-primary/3 rounded-full blur-3xl" />

      {/* Registration card - horizontal */}
      <div className="rounded-2xl w-full max-w-3xl relative z-10 border border-dark-600">
        <div className="bg-dark-800 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Left side - Branding */}
            <div className="md:w-2/5 bg-gradient-to-br from-accent-primary/10 via-dark-800 to-dark-800 p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-dark-700">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-dark-400 text-sm">Join the internship portal today</p>

              {/* Role selector */}
              <div className="mt-8 w-full max-w-xs">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-3">I am a</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('APPLICANT')}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      role === 'APPLICANT'
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                        : 'bg-dark-900 border-dark-600 text-dark-300 hover:border-dark-400'
                    }`}
                  >
                    Applicant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('COMPANY')}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      role === 'COMPANY'
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                        : 'bg-dark-900 border-dark-600 text-dark-300 hover:border-dark-400'
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="md:w-3/5 p-8">
              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name and Email in one row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Password and Confirm in one row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login link */}
              <p className="text-center text-dark-400 text-sm mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
