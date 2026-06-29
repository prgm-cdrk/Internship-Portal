// Owner Settings page — platform settings persisted in database
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OwnerSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    portalName: 'InternsHub',
    trialDays: '14',
    freePlanPostings: '2',
    freePlanApplicants: '2',
    basicPlanPrice: '299',
    proPlanPrice: '499',
    allowRegistrations: 'true',
    maintenanceMode: 'false',
  });

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { if (status === 'authenticated') fetchSettings(); }, [status]);

  const fetchSettings = async () => {
    const res = await fetch('/api/owner/settings');
    const data = await res.json();
    if (res.ok) setSettings(data.settings);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) setSuccess('Settings saved successfully!');
      else { const d = await res.json(); setError(d.error); }
    } catch { setError('Failed to save settings'); }
    setSaving(false);
  };

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Platform Settings</h1>
            <p className="text-neutral-500 text-sm mt-1">Configure your platform behavior and pricing</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6"><p className="text-sm text-red-400">{error}</p></div>}
        {success && <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-6"><p className="text-sm text-green-400">{success}</p></div>}

        <div className="space-y-6">
          {/* Portal */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Portal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Portal Name</label>
                <input type="text" value={settings.portalName} onChange={(e) => update('portalName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Trial Period (days)</label>
                <input type="number" value={settings.trialDays} onChange={(e) => update('trialDays', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
            </div>
          </div>

          {/* Free Plan */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Free Plan Limits</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Max Postings</label>
                <input type="number" value={settings.freePlanPostings} onChange={(e) => update('freePlanPostings', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Max Applicants</label>
                <input type="number" value={settings.freePlanApplicants} onChange={(e) => update('freePlanApplicants', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Pricing (₱/month)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Basic Plan</label>
                <input type="number" value={settings.basicPlanPrice} onChange={(e) => update('basicPlanPrice', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Pro Plan</label>
                <input type="number" value={settings.proPlanPrice} onChange={(e) => update('proPlanPrice', e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500" />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Feature Toggles</h2>
            <div className="space-y-4">
              {[
                { key: 'allowRegistrations', label: 'Allow New Registrations', desc: 'Allow new users to sign up' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable the platform' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{label}</p>
                    <p className="text-neutral-500 text-xs">{desc}</p>
                  </div>
                  <button onClick={() => update(key, settings[key as keyof typeof settings] === 'true' ? 'false' : 'true')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings[key as keyof typeof settings] === 'true' ? 'bg-arcana-primary' : 'bg-neutral-700'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings[key as keyof typeof settings] === 'true' ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">System Information</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between"><span className="text-neutral-500">Version</span><span className="text-white">2.0.0</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Framework</span><span className="text-white">Next.js 16</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Database</span><span className="text-white">PostgreSQL (Railway)</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Payments</span><span className="text-white">PayMongo</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">ORM</span><span className="text-white">Prisma 5</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Runtime</span><span className="text-white">Node.js</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
