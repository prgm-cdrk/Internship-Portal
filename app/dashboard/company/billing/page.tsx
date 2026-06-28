// Billing & Subscription page - view and upgrade plan
// Displays current plan (FREE, BASIC, or PRO) with pricing and features
// Users can upgrade to BASIC or PRO which redirects to PayMongo checkout

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
        setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      }
      setLoading(false);
    } catch (err) {
      setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      setLoading(false);
    }
  };

  const handleUpgrade = async (selectedPlan: string) => {
    setUpgrading(true);
    setError('');
    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to start upgrade');
        setUpgrading(false);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('Failed to process upgrade');
      setUpgrading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  const currentPlan = subscription?.plan || 'FREE';

  const plans = [
    {
      name: 'FREE',
      price: '₱0',
      features: ['1 internship posting', 'Up to 3 applicants', 'Basic features'],
      unavailable: ['Task management', 'Priority support'],
      current: currentPlan === 'FREE',
    },
    {
      name: 'BASIC',
      price: '₱299',
      features: ['10 internship postings', 'Up to 10 applicants', 'Task management', 'Basic features'],
      unavailable: ['Priority support'],
      current: currentPlan === 'BASIC',
    },
    {
      name: 'PRO',
      price: '₱499',
      features: ['Unlimited postings', 'Unlimited applicants', 'Task management', 'Advanced features', 'Priority support'],
      unavailable: [],
      current: currentPlan === 'PRO',
      popular: true,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-white mb-6">Billing & Subscription</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8">
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Current Plan</p>
        <div className="flex items-center gap-4">
          <p className="text-white text-2xl font-bold">{currentPlan}</p>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-white text-black">ACTIVE</span>
        </div>
        {subscription?.renewalDate && (
          <p className="text-neutral-500 text-xs mt-2">Renews {new Date(subscription.renewalDate).toLocaleDateString()}</p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-neutral-900 border rounded-xl p-6 relative ${plan.current ? 'border-white' : 'border-neutral-800'}`}>
            {plan.popular && (
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded">Popular</span>
            )}
            <p className="text-xs text-neutral-500 uppercase tracking-wider">{plan.name} Plan</p>
            <p className="text-3xl font-bold text-white mt-2">{plan.price}<span className="text-sm font-normal text-neutral-500">/mo</span></p>

            <ul className="mt-5 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-neutral-400 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
              {plan.unavailable.map((f) => (
                <li key={f} className="text-xs text-neutral-600 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-neutral-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {plan.current ? (
                <button disabled className="w-full py-2 bg-neutral-800 text-neutral-500 text-sm font-medium rounded-lg cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button onClick={() => handleUpgrade(plan.name)} disabled={upgrading} className="w-full py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50">
                  {upgrading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trial Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mt-8">
        <p className="text-white text-sm font-medium">14-Day Free Trial</p>
        <p className="text-neutral-500 text-xs mt-1">New subscribers get 14 days of free access to try all features risk-free. No credit card required.</p>
      </div>
    </div>
  );
}
