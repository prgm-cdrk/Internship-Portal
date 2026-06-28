// User Management page - only accessible by OWNER role
// Displays all registered users with name, email, role, and signup date
// Owners can filter users by role (ALL, OWNER, COMPANY, APPLICANT)

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

const roleColors: { [key: string]: string } = {
  OWNER: 'bg-red-500/20 text-red-400 border border-red-500/30',
  COMPANY: 'bg-success/20 text-success border border-success/30',
  APPLICANT: 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
};

export default function OwnerUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

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

  const filteredUsers = filter === 'ALL'
    ? users
    : users.filter(user => user.role === filter);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-300">Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== 'OWNER') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-300">Access denied. Owner only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard/owner')} className="text-dark-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-dark-300 mt-1">View and manage all registered users</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'OWNER', 'COMPANY', 'APPLICANT'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === role
                  ? 'bg-accent-primary text-white'
                  : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Users count */}
        <p className="text-dark-400 text-sm mb-4">
          Showing {filteredUsers.length} of {users.length} users
        </p>

        {/* Users table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-10 text-center">
            <p className="text-dark-400">No users found.</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Name</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Email</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Role</th>
                  <th className="text-left text-xs text-dark-400 uppercase tracking-wider px-5 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-4 text-white font-medium">{user.name}</td>
                    <td className="px-5 py-4 text-dark-300">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role] || 'bg-dark-700 text-dark-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
