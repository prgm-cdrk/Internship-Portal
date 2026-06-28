// This is the User Management page - only accessible by OWNER role
// It displays all registered users with their name, email, role, and signup date
// Owners can filter users by role (ALL, OWNER, COMPANY, APPLICANT)

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for a user
type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

// Color mapping for user roles
const roleColors: { [key: string]: string } = {
  OWNER: '#ff4444',       // Red - admin role
  COMPANY: '#28a745',     // Green - company role
  APPLICANT: '#007bff'    // Blue - applicant role
};

export default function OwnerUsersPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [users, setUsers] = useState<User[]>([]);  // List of all users
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [filter, setFilter] = useState('ALL');      // Role filter (ALL, OWNER, COMPANY, APPLICANT)

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

    fetchUsers();
  }, [status, session, router]);

  // Fetch all users from the admin API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/owner/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  // Filter users based on selected role
  const filteredUsers = filter === 'ALL'
    ? users
    : users.filter(user => user.role === filter);

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // Block access if not OWNER
  if (!session || session.user?.role !== 'OWNER') {
    return <p>Access denied. Owner only.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>User Management</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Role filter buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['ALL', 'OWNER', 'COMPANY', 'APPLICANT'].map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: filter === role ? '#007bff' : '#e9ecef',
              color: filter === role ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              fontWeight: filter === role ? 'bold' : 'normal'
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Users count */}
      <p style={{ marginBottom: '15px', color: '#666' }}>
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No users found.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: roleColors[user.role] || '#6c757d',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
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
