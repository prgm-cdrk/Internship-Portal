// Company Profile page - shows company details with edit functionality
// Fetches company data from /api/company/get
// Displays company info with an Edit button
// When Edit is clicked → form fields become editable
// When Save is clicked → calls API to update

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading') return;
    fetchCompanyData();
  }, [status]);

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company/get');
      const data = await response.json();
      if (!response.ok) {
        setError('Company not found. Please create one first.');
        setLoading(false);
        return;
      }
      setCompany(data.company);
      setName(data.company.name);
      setIndustry(data.company.industry);
      setWebsite(data.company.website || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load company');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    if (!name || !industry) {
      setError('Company name and industry are required');
      setSaving(false);
      return;
    }
    try {
      const response = await fetch('/api/company/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, website })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save company');
        setSaving(false);
        return;
      }
      setCompany(data.company);
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      setError('Failed to save company');
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  if (!company) {
    return (
      <div className="p-8 pl-12">
        <h1 className="text-xl font-bold text-white mb-4">Company Profile</h1>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard/company/create')} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
          Create Company
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pl-12">
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold text-white mb-6">Company Profile</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Company Name</label>
            {isEditing ? (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors" />
            ) : (
              <p className="text-white text-sm">{company.name}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Industry</label>
            {isEditing ? (
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-white text-sm">{company.industry}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Website</label>
            {isEditing ? (
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
            ) : (
              <p className="text-white text-sm">{company.website || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-lg hover:bg-neutral-700 hover:text-white transition-colors">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
