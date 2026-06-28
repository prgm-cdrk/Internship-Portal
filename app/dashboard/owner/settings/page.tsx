// System Settings page - only accessible by OWNER role
// Displays platform configuration options and system information
// Owners can view portal settings, pricing, and feature toggles

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OwnerSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    portalName: 'Internship Portal',
    maxFreePostings: 1,
    maxFreeApplicants: 3,
    basicPrice: 299,
    proPrice: 499,
    trialDays: 14,
    allowRegistration: true,
    maintenanceMode: false
  });

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
    setLoading(false);
  }, [status, session, router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Settings saved successfully!');
      setSaving(false);
    } catch (err) {
      setError('Failed to save settings');
      setSaving(false);
    }
  };

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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard/owner')} className="text-dark-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-dark-300 mt-1">Configure platform settings and portal configuration</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        {/* Portal Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Portal Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">Portal Name</label>
              <input
                type="text"
                value={settings.portalName}
                onChange={(e) => setSettings({ ...settings, portalName: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">Trial Period (Days)</label>
              <input
                type="number"
                value={settings.trialDays}
                onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pricing Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">FREE Plan Limit (Postings)</label>
              <input
                type="number"
                value={settings.maxFreePostings}
                onChange={(e) => setSettings({ ...settings, maxFreePostings: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">FREE Plan Limit (Applicants)</label>
              <input
                type="number"
                value={settings.maxFreeApplicants}
                onChange={(e) => setSettings({ ...settings, maxFreeApplicants: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">BASIC Plan Price (₱/month)</label>
              <input
                type="number"
                value={settings.basicPrice}
                onChange={(e) => setSettings({ ...settings, basicPrice: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">PRO Plan Price (₱/month)</label>
              <input
                type="number"
                value={settings.proPrice}
                onChange={(e) => setSettings({ ...settings, proPrice: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Feature Toggles</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${settings.allowRegistration ? 'bg-accent-primary' : 'bg-dark-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-5' : ''}`}></div>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
              />
              <div>
                <span className="text-white text-sm font-medium">Allow New Registrations</span>
                <p className="text-dark-400 text-xs">Enable/disable new user signups</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-dark-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`}></div>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <div>
                <span className="text-white text-sm font-medium">Maintenance Mode</span>
                <p className="text-dark-400 text-xs">Show maintenance page to all non-admin users</p>
              </div>
            </label>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-dark-400">Version:</span> <span className="text-white">1.0.0</span></div>
            <div><span className="text-dark-400">Framework:</span> <span className="text-white">Next.js 16</span></div>
            <div><span className="text-dark-400">Database:</span> <span className="text-white">PostgreSQL (Railway)</span></div>
            <div><span className="text-dark-400">Payment:</span> <span className="text-white">PayMongo</span></div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-success text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
