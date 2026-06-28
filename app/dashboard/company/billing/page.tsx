'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'loading') return;

    fetchSubscription();
  }, [status]);

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

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PRO' })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start upgrade');
        setUpgrading(false);
        return;
      }

      // Redirect to PayMongo checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('Failed to process upgrade');
      setUpgrading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  const currentPlan = subscription?.plan || 'FREE';

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Billing & Subscription</h1>
      <p>Manage your subscription and upgrade to unlock more features.</p>

      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {/* Current Plan Info */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Current Plan</h2>
        <p><strong>Plan:</strong> {currentPlan}</p>
        <p><strong>Status:</strong> {subscription?.status || 'ACTIVE'}</p>
        {subscription?.renewalDate && (
          <p><strong>Renewal Date:</strong> {new Date(subscription.renewalDate).toLocaleDateString()}</p>
        )}
      </div>

      {/* Pricing Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* FREE Plan */}
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

        {/* PRO Plan */}
        <div
          style={{
            border: currentPlan === 'PRO' ? '3px solid #28a745' : '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: currentPlan === 'PRO' ? '#e8f5e9' : '#fff',
            position: 'relative'
          }}
        >
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

      {/* Trial Info */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <h3>🎁 14-Day Free Trial</h3>
        <p>New PRO subscribers get 14 days of free access to try all PRO features risk-free. No credit card required for the trial.</p>
      </div>
    </div>
  );
}
