// This is the Companies Management page - only accessible by OWNER role
// It displays all registered companies with their name, industry, plan, status, and manager
// Owners can filter companies by subscription plan (ALL, FREE, BASIC, PRO)

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

export default function CompaniesManagementPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [companies, setCompanies] = useState([]);   // List of all companies
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [filterPlan, setFilterPlan] = useState('ALL');  // Plan filter (ALL, FREE, BASIC, PRO)

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

    fetchCompanies();
  }, [status, session, router]);

  // Fetch all companies from the admin API
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/owner/companies');
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies);
      } else {
        setError('Failed to load companies');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load companies');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // Filter companies based on selected plan
  const filteredCompanies =
    filterPlan === 'ALL'
      ? companies
      : companies.filter((c) => c.subscription?.plan === filterPlan);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Companies Management</h1>
      <p>View and manage all registered companies on the platform.</p>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {/* Plan filter buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['ALL', 'FREE', 'BASIC', 'PRO'].map((plan) => (
          <button
            key={plan}
            onClick={() => setFilterPlan(plan)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterPlan === plan ? '#007bff' : '#f0f0f0',
              color: filterPlan === plan ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: filterPlan === plan ? 'bold' : 'normal'
            }}
          >
            {plan}
          </button>
        ))}
      </div>

      {/* Companies count */}
      <p style={{ marginBottom: '15px' }}>
        <strong>Showing {filteredCompanies.length} companies</strong>
      </p>

      {/* Companies table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Company Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Industry
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Plan
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Manager
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No companies found
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{company.name}</strong>
                  </td>
                  <td style={{ padding: '12px' }}>{company.industry}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          company.subscription?.plan === 'FREE'
                            ? '#f0f0f0'
                            : company.subscription?.plan === 'BASIC'
                            ? '#fff3cd'
                            : '#d4edda',
                        color:
                          company.subscription?.plan === 'FREE'
                            ? '#666'
                            : company.subscription?.plan === 'BASIC'
                            ? '#856404'
                            : '#155724'
                      }}
                    >
                      {company.subscription?.plan || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          company.subscription?.status === 'ACTIVE'
                            ? '#d4edda'
                            : '#f8d7da',
                        color:
                          company.subscription?.status === 'ACTIVE'
                            ? '#155724'
                            : '#721c24'
                      }}
                    >
                      {company.subscription?.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{company.user?.name}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
