// Owner User Management page
// View all users, filter by role, search, edit roles, suspend/delete accounts

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  permissionLevel: string | null;
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
  _count: { applications: number; tasks: number };
};

const roleColors: Record<string, string> = {
  OWNER: 'bg-red-500/10 text-red-400 border-red-500/20',
  COMPANY: 'bg-green-500/10 text-green-400 border-green-500/20',
  APPLICANT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function OwnerUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchUsers();
  }, [status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/owner/users?search=${encodeURIComponent(search)}&role=${filter}`);
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else setError(data.error);
    } catch { setError('Failed to load users'); }
    setLoading(false);
  };

  const handleSearch = () => { setLoading(true); fetchUsers(); };

  const handleUpdateRole = async () => {
    if (!editingUser || !editRole) return;
    try {
      const res = await fetch('/api/owner/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, role: editRole }),
      });
      if (res.ok) { setEditingUser(null); fetchUsers(); }
      else { const d = await res.json(); setError(d.error); }
    } catch { setError('Failed to update user'); }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await fetch('/api/owner/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isActive: !user.isActive }),
      });
      fetchUsers();
    } catch { setError('Failed to update user'); }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/owner/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchUsers();
      else { const d = await res.json(); setError(d.error); }
    } catch { setError('Failed to delete user'); }
  };

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">User Management</h1>
          <p className="text-neutral-500 text-sm mt-1">View and manage all registered users</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6"><p className="text-sm text-red-400">{error}</p></div>
        )}

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search name or email..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600" />
          </div>
          <div className="flex gap-1.5">
            {['ALL', 'OWNER', 'COMPANY', 'APPLICANT', 'STAFF'].map((r) => (
              <button key={r} onClick={() => { setFilter(r); setLoading(true); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  filter === r ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                }`}>{r}</button>
            ))}
          </div>
        </div>

        <p className="text-neutral-600 text-xs mb-4">Showing {filtered.length} of {users.length} users</p>

        {filtered.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-neutral-500">No users found.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Joined</th>
                  <th className="text-right text-xs text-neutral-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{user.name}</td>
                    <td className="px-5 py-3 text-neutral-400 text-sm">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${roleColors[user.role] || 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>{user.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      {user.role !== 'OWNER' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingUser(user); setEditRole(user.role); }}
                            className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-colors">Edit</button>
                          <button onClick={() => handleToggleActive(user)}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${user.isActive ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10' : 'text-green-400 border-green-500/20 hover:bg-green-500/10'}`}>
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(user.id)}
                            className="px-2.5 py-1 text-[11px] text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit role modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white">Edit Role — {editingUser.name}</h2>
              </div>
              <div className="p-6">
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500">
                  <option value="APPLICANT">Applicant</option>
                  <option value="COMPANY">Company Manager</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div className="p-6 border-t border-neutral-800 flex items-center gap-3">
                <button onClick={handleUpdateRole} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors">Save</button>
                <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-xl hover:bg-neutral-700 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
