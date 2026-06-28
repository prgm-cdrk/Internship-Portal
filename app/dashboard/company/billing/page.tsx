// This is the Billing & Subscription page - where company managers can view and upgrade their plan
// It displays the current plan (FREE or PRO) with pricing and features
// Users can upgrade to PRO which redirects to PayMongo checkout

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

export default function BillingPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [subscription, setSubscription] = useState(null);  // Current subscription data
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [upgrading, setUpgrading] = useState(false);  // Upgrade button loading state

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Wait until session is loaded before fetching
    if (status === 'loading') return;

    // Fetch subscription data when session is ready
    fetchSubscription();
  }, [status]);

  // Fetch the company's current subscription from the database
  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/get');
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        // First time — no subscription yet, default to FREE
        setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      setLoading(false);
    }
  };

  // Handle upgrade to PRO plan - creates PayMongo checkout session
  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');

    try {
      // Send request to create PayMongo checkout session
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PRO' })
      });

      const data = await response.json();

      // If request failed, show error
      if (!response.ok) {
        setError(data.error || 'Failed to start upgrade');
        setUpgrading(false);
        return;
      }

      // Redirect to PayMongo checkout page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('Failed to process upgrade');
      setUpgrading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // Get current plan name (default to FREE)
  const currentPlan = subscription?.plan || 'FREE';

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Billing & Subscription</h1>
      <p>Manage your subscription and upgrade to unlock more features.</p>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {/* Current Plan Info - shows which plan the user is on */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Current Plan</h2>
        <p><strong>Plan:</strong> {currentPlan}</p>
        <p><strong>Status:</strong> {subscription?.status || 'ACTIVE'}</p>
        {subscription?.renewalDate && (
          <p><strong>Renewal Date:</strong> {new Date(subscription.renewalDate).toLocaleDateString()}</p>
        )}
      </div>

      {/* Pricing Plans - side by side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* FREE Plan Card */}
        <div
          style={{
            border: currentPlan === 'FREE' ? '3px solid #007bff' : '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: currentPlan === 'FREE' ? '#e7f3ff' : '#fff'
          }}
        >
          <h3>FREE Plan</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>₱0/month</p>
          <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
            <li>✅ 1 internship posting</li>
            <li>✅ Up to 10 applicants</li>
            <li>✅ Basic features</li>
            <li>❌ Task management</li>
            <li>❌ Priority support</li>
          </ul>
          {/* Show "Current Plan" button if user is on FREE */}
          {currentPlan === 'FREE' && (
            <button
              disabled
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#ccc',
                color: '#666',
                border: 'none',
                borderRadius: '5px',
                cursor: 'not-allowed'
              }}
            >
              Current Plan
            </button>
          )}
        </div>

        {/* PRO Plan Card */}
        <div
          style={{
            border: currentPlan === 'PRO' ? '3px solid #28a745' : '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: currentPlan === 'PRO' ? '#e8f5e9' : '#fff',
            position: 'relative'
          }}
        >
          {/* Popular badge */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ff9800', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>
            Popular
          </div>
          <h3>PRO Plan</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>₱999/month</p>
          <p style={{ fontSize: '12px', color: '#666' }}>or ₱9,499/year (save 21%)</p>
          <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
            <li>✅ Unlimited internship postings</li>
            <li>✅ Unlimited applicants</li>
            <li>✅ Advanced features</li>
            <li>✅ Task management</li>
            <li>✅ Priority support</li>
          </ul>
          {/* Show "Current Plan" if on PRO, otherwise show "Upgrade to PRO" button */}
          {currentPlan === 'PRO' ? (
            <button
              disabled
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#ccc',
                color: '#666',
                border: 'none',
                borderRadius: '5px',
                cursor: 'not-allowed'
              }}
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {upgrading ? 'Processing...' : 'Upgrade to PRO'}
            </button>
          )}
        </div>
      </div>

      {/* Trial Info - 14-day free trial banner */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <h3>🎁 14-Day Free Trial</h3>
        <p>New PRO subscribers get 14 days of free access to try all PRO features risk-free. No credit card required for the trial.</p>
      </div>
    </div>
  );
}
