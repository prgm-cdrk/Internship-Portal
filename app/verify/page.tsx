// Email verification page
// Shows "Verifying..." while processing the token
// Shows success or error message after verification
// Links to login page after successful verification

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
          return;
        }

        setStatus('success');
        setMessage(data.message);
        setEmail(data.email);
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-accent-primary/3 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,53,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,53,0.06)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:linear-gradient(to_bottom_right,black_20%,transparent_80%)]"></div>

      {/* Verification card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-10 text-center">

          {/* Loading state */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying Your Email</h1>
              <p className="text-dark-400 text-sm">Please wait while we verify your email address...</p>
            </>
          )}

          {/* Success state */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-dark-400 text-sm mb-6">{message}</p>
              {email && (
                <p className="text-dark-500 text-xs mb-6">Verified: {email}</p>
              )}
              <Link
                href="/login"
                className="inline-block w-full py-3 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-secondary transition-colors"
              >
                Go to Login
              </Link>
            </>
          )}

          {/* Error state */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-dark-400 text-sm mb-6">{message}</p>
              <Link
                href="/register"
                className="inline-block w-full py-3 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-secondary transition-colors"
              >
                Register Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
