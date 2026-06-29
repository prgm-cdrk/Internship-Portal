// Owner Staff Management page
// Create, edit, suspend, and remove staff accounts
// Each staff has a role (ADMIN/MODERATOR/VIEWER) and granular permissions

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type StaffMember = {
  id: number;
  userId: number;
  role: string;
  permissions: string;
  isSuspended: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  user: { id: number; email: string; name: string; createdAt: string };
};

type Permission = { key: string; label: string };

export default function StaffManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [createdPassword, setCreatedPassword] = useState('');

  // Create form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('VIEWER');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchStaff();
  }, [status]);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/owner/staff');
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setStaffList(data.staff);
      setAllPermissions(data.permissions);
      setLoading(false);
    } catch { setError('Failed to load staff'); setLoading(false); }
  };

  const handleCreate = async () => {
    setError('');
    setSaving(true);
    if (!newName || !newEmail) { setError('Name and email are required'); setSaving(false); return; }

    try {
      const res = await fetch('/api/owner/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole, permissions: newPermissions, tempPassword: newTempPassword || undefined })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }

      setCreatedPassword(data.tempPassword);
      setShowCreate(false);
      setNewName(''); setNewEmail(''); setNewRole('VIEWER'); setNewPermissions([]); setNewTempPassword('');
      fetchStaff();
      setSaving(false);
    } catch { setError('Failed to create staff'); setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/owner/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: editingStaff.id, role: editingStaff.role, permissions: JSON.parse(editingStaff.permissions) })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }

      setEditingStaff(null);
      fetchStaff();
      setSaving(false);
    } catch { setError('Failed to update staff'); setSaving(false); }
  };

  const handleToggleSuspend = async (staff: StaffMember) => {
    try {
      await fetch('/api/owner/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: staff.id, isSuspended: !staff.isSuspended })
      });
      fetchStaff();
    } catch { setError('Failed to update staff'); }
  };

  const handleDelete = async (staffId: number) => {
    if (!confirm('Remove this staff member? This cannot be undone.')) return;
    try {
      await fetch('/api/owner/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId })
      });
      fetchStaff();
    } catch { setError('Failed to remove staff'); }
  };

  const togglePermission = (key: string) => {
    setNewPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const getRoleColor = (role: string) => {
    if (role === 'ADMIN') return 'bg-arcana-primary/10 text-arcana-light border-arcana-primary/20';
    if (role === 'MODERATOR') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Staff Management</h1>
            <p className="text-neutral-500 text-sm mt-1">Create and manage admin accounts with granular permissions</p>
          </div>
          <button onClick={() => { setShowCreate(true); setCreatedPassword(''); }}
            className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Staff
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6"><p className="text-sm text-red-400">{error}</p></div>
        )}

        {/* Temp password display */}
        {createdPassword && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-green-400 font-medium mb-1">Staff account created!</p>
            <p className="text-xs text-green-400/70">Temporary password: <code className="bg-green-500/10 px-2 py-0.5 rounded font-mono">{createdPassword}</code></p>
            <p className="text-xs text-neutral-500 mt-1">Share this password with the staff member. They should change it on first login.</p>
          </div>
        )}

        {/* Staff list */}
        {staffList.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-neutral-400 text-lg font-medium mb-2">No staff members yet</p>
            <p className="text-neutral-600 text-sm mb-6">Create admin accounts to help manage your platform</p>
            <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
              Create First Staff Member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((staff) => (
              <div key={staff.id} className={`bg-neutral-900 border rounded-xl p-5 transition-colors ${staff.isSuspended ? 'border-red-500/20 opacity-60' : 'border-neutral-800 hover:border-neutral-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 font-semibold text-sm">
                      {staff.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{staff.user.name}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getRoleColor(staff.role)}`}>{staff.role}</span>
                        {staff.isSuspended && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">SUSPENDED</span>}
                      </div>
                      <p className="text-neutral-500 text-xs mt-0.5">{staff.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingStaff(staff)} className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => handleToggleSuspend(staff)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${staff.isSuspended ? 'text-green-400 border-green-500/20 hover:bg-green-500/10' : 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10'}`}>
                      {staff.isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                    <button onClick={() => handleDelete(staff.id)} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors">Remove</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {JSON.parse(staff.permissions).map((p: string) => (
                    <span key={p} className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] rounded-md">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white">Create Staff Account</h2>
                <p className="text-neutral-500 text-sm mt-1">Set up a new admin account with specific permissions</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Role</label>
                  <select value={newRole} onChange={(e) => { setNewRole(e.target.value); setNewPermissions([]); }}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500">
                    <option value="VIEWER">Viewer — Read-only access</option>
                    <option value="MODERATOR">Moderator — View + basic management</option>
                    <option value="ADMIN">Admin — Full access (except staff management)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Temporary Password (optional)</label>
                  <input type="text" value={newTempPassword} onChange={(e) => setNewTempPassword(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" placeholder="Leave blank to auto-generate" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map((perm) => {
                      const isChecked = newPermissions.includes(perm.key);
                      return (
                        <button key={perm.key} type="button" onClick={() => togglePermission(perm.key)}
                          className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${isChecked ? 'bg-arcana-primary/10 border-arcana-primary/30 text-arcana-light' : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                          {isChecked ? '✓ ' : ''}{perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-800 flex items-center gap-3">
                <button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
                <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-xl hover:bg-neutral-700 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editingStaff && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingStaff(null)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white">Edit Staff — {editingStaff.user.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Role</label>
                  <select value={editingStaff.role} onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500">
                    <option value="VIEWER">Viewer</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map((perm) => {
                      const currentPerms = JSON.parse(editingStaff.permissions);
                      const isChecked = currentPerms.includes(perm.key);
                      return (
                        <button key={perm.key} type="button"
                          onClick={() => {
                            const updated = isChecked ? currentPerms.filter((p: string) => p !== perm.key) : [...currentPerms, perm.key];
                            setEditingStaff({ ...editingStaff, permissions: JSON.stringify(updated) });
                          }}
                          className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${isChecked ? 'bg-arcana-primary/10 border-arcana-primary/30 text-arcana-light' : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                          {isChecked ? '✓ ' : ''}{perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-800 flex items-center gap-3">
                <button onClick={handleUpdate} disabled={saving} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingStaff(null)} className="px-5 py-2.5 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-xl hover:bg-neutral-700 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
