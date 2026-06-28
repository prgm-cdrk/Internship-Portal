// This is the System Settings page - only accessible by OWNER role
// It displays platform configuration options and system information
// Owners can view portal settings, pricing, and feature toggles

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

export default function OwnerSettingsPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Platform settings (placeholder for future database storage)
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

    setLoading(false);
  }, [status, session, router]);

  // Handle saving settings (placeholder - will connect to database later)
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Save settings to database via API
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Settings saved successfully!');
      setSaving(false);
    } catch (err) {
      setError('Failed to save settings');
      setSaving(false);
    }
  };

  // Show loading while session is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // Block access if not OWNER
  if (!session || session.user?.role !== 'OWNER') {
    return <p>Access denied. Owner only.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>System Settings</h1>
      <p>Configure platform settings and manage portal configuration.</p>

      {/* Display error/success messages */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '15px' }}>{success}</p>}

      {/* Portal Settings */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Portal Settings</h2>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Portal Name</label>
          <input
            type="text"
            value={settings.portalName}
            onChange={(e) => setSettings({ ...settings, portalName: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trial Period (Days)</label>
          <input
            type="number"
            value={settings.trialDays}
            onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Pricing Settings */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Pricing Configuration</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>FREE Plan Limit (Postings)</label>
            <input
              type="number"
              value={settings.maxFreePostings}
              onChange={(e) => setSettings({ ...settings, maxFreePostings: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>FREE Plan Limit (Applicants)</label>
            <input
              type="number"
              value={settings.maxFreeApplicants}
              onChange={(e) => setSettings({ ...settings, maxFreeApplicants: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>BASIC Plan Price (₱/month)</label>
            <input
              type="number"
              value={settings.basicPrice}
              onChange={(e) => setSettings({ ...settings, basicPrice: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PRO Plan Price (₱/month)</label>
            <input
              type="number"
              value={settings.proPrice}
              onChange={(e) => setSettings({ ...settings, proPrice: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Feature Toggles</h2>

        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="allowRegistration"
            checked={settings.allowRegistration}
            onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
          />
          <label htmlFor="allowRegistration" style={{ fontWeight: 'bold' }}>Allow New Registrations</label>
          <span style={{ fontSize: '12px', color: '#666' }}>- Enable/disable new user signups</span>
        </div>

        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          />
          <label htmlFor="maintenanceMode" style={{ fontWeight: 'bold' }}>Maintenance Mode</label>
          <span style={{ fontSize: '12px', color: '#666' }}>- Show maintenance page to all non-admin users</span>
        </div>
      </div>

      {/* System Information */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h2>System Information</h2>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Framework:</strong> Next.js 16</p>
        <p><strong>Database:</strong> PostgreSQL (Railway)</p>
        <p><strong>Payment Provider:</strong> PayMongo</p>
        <p><strong>Environment:</strong> Development</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
