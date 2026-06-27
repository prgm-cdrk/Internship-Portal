// This page handles user login
// It provides a form where users enter their email and password
// It uses NextAuth's signIn function to authenticate with the Credentials provider
// On successful login, the user is redirected to the dashboard

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState('');          // Stores the user's email input
  const [password, setPassword] = useState('');    // Stores the user's password input
  const [error, setError] = useState('');          // Stores error messages to display
  const [loading, setLoading] = useState(false);   // Tracks if form is being submitted
  const router = useRouter();                      // Used to redirect after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();      // Prevent page reload on form submit
    setError('');            // Clear any previous errors
    setLoading(true);        // Show loading state on button

    // Validate that both fields are filled
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      // Call NextAuth signIn with credentials provider
      // redirect: false prevents automatic redirect so we can handle errors
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      // Check if sign in was successful
      if (!result?.ok) {
        setError(result?.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Login successful - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Handle network or unexpected errors
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}   // Update email state on input
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}   // Update password state on input
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}    // Disable button while submitting
          style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}   {/* Show loading text while submitting */}
        </button>
      </form>

      <p>
        Don&apos;t have an account? <Link href="/register">Register here</Link>
      </p>
    </div>
  );
}

