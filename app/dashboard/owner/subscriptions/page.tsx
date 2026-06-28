// This is the Subscriptions Management page - only accessible by OWNER role
// It displays all subscriptions with company name, plan, status, and expiration
// Owners can see revenue summary and filter by plan or status

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for a subscription
type Subscription = {
  id: number;
  plan: string;
  status: string;
  expiredAt: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
};

// Type definition for summary stats
type Summary = {
  total: number;
  active: number;
  basic: number;
  pro: number;
  totalRevenue: number;
};

export default function OwnerSubscriptionsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, basic: 0, pro: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Redirect to login if user is not authenticated or not OWNER
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'loading') return;

    if (session?.user?.role !== 'OWNER') {
      router.push('/login');
      return;
    }

    fetchSubscriptions();
  }, [status, session, router]);

  // Fetch all subscriptions from the admin API
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/owner/subscriptions');
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions);
        setSummary(data.summary);
      } else {
        setError('Failed to load subscriptions');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load subscriptions');
      setLoading(false);
    }
  };

  // Filter subscriptions based on selected plan and status
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchPlan = filterPlan === 'ALL' || sub.plan === filterPlan;
    const matchStatus = filterStatus === 'ALL' || sub.status === filterStatus;
    return matchPlan && matchStatus;
  });

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // Block access if not OWNER
  if (!session || session.user?.role !== 'OWNER') {
    return <p>Access denied. Owner only.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Subscriptions Management</h1>
      <p>View all subscriptions and revenue from paid plans.</p>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {/* Revenue Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {/* Total Revenue card */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>₱{summary.totalRevenue.toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Monthly recurring</p>
        </div>

        {/* Active Subscriptions card */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3>Active Subscriptions</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>{summary.active}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>of {summary.total} total</p>
        </div>

        {/* BASIC Plan count */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
          <h3>BASIC Plans</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#856404' }}>{summary.basic}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>₱299/month each</p>
        </div>

        {/* PRO Plan count */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#d4edda' }}>
          <h3>PRO Plans</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#155724' }}>{summary.pro}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>₱499/month each</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Plan filters */}
        <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Plan:</span>
        {['ALL', 'FREE', 'BASIC', 'PRO'].map((plan) => (
          <button
            key={plan}
            onClick={() => setFilterPlan(plan)}
            style={{
              padding: '6px 12px',
              backgroundColor: filterPlan === plan ? '#007bff' : '#f0f0f0',
              color: filterPlan === plan ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {plan}
          </button>
        ))}

        {/* Status filters */}
        <span style={{ fontWeight: 'bold', marginLeft: '20px', marginRight: '5px' }}>Status:</span>
        {['ALL', 'ACTIVE', 'EXPIRED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '6px 12px',
              backgroundColor: filterStatus === status ? '#007bff' : '#f0f0f0',
              color: filterStatus === status ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Subscriptions count */}
      <p style={{ marginBottom: '15px', color: '#666' }}>
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </p>

      {/* Subscriptions table */}
      {filteredSubscriptions.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No subscriptions found.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Company</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Industry</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Expires</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{sub.company.name}</strong>
                  </td>
                  <td style={{ padding: '12px' }}>{sub.company.industry}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: sub.plan === 'FREE' ? '#f0f0f0' : sub.plan === 'BASIC' ? '#fff3cd' : '#d4edda',
                      color: sub.plan === 'FREE' ? '#666' : sub.plan === 'BASIC' ? '#856404' : '#155724'
                    }}>
                      {sub.plan}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {sub.plan === 'FREE' ? '₱0' : sub.plan === 'BASIC' ? '₱299' : '₱499'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: sub.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                      color: sub.status === 'ACTIVE' ? '#155724' : '#721c24'
                    }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(sub.expiredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
