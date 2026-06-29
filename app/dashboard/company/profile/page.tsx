// Company Profile page - shows company details with edit functionality
// Fetches company data from /api/company/get
// Displays all company info (name, industry, location, website, description, logo)
// When Edit is clicked → form fields become editable with file upload for logo
// When Save is clicked → calls API to update

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Company = {
  id: number;
  name: string;
  industry: string;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  userId: number;
  createdAt: string;
};

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      setLocation(data.company.location || '');
      setDescription(data.company.description || '');
      setLogoPreview(data.company.logoUrl || null);
      setLoading(false);
    } catch {
      setError('Failed to load company');
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo must be under 2MB');
        return;
      }
      setError('');
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoPreview;
    const formData = new FormData();
    formData.append('logo', logoFile);
    const res = await fetch('/api/upload/logo', { method: 'POST', body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.logoUrl || null;
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
      // Only upload if user selected a new logo file
      let logoUrl: string | null | undefined = undefined;
      if (logoFile) {
        const uploaded = await uploadLogo();
        if (!uploaded) {
          setError('Failed to upload logo. Please try again.');
          setSaving(false);
          return;
        }
        logoUrl = uploaded;
      }

      const response = await fetch('/api/company/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, website, location, description, logoUrl })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save company');
        setSaving(false);
        return;
      }
      setCompany(data.company);
      setLogoPreview(data.company.logoUrl || null);
      setIsEditing(false);
      setLogoFile(null);
      setSaving(false);
    } catch {
      setError('Failed to save company');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setName(company.name);
      setIndustry(company.industry);
      setWebsite(company.website || '');
      setLocation(company.location || '');
      setDescription(company.description || '');
      setLogoPreview(company.logoUrl || null);
    }
    setLogoFile(null);
    setIsEditing(false);
    setError('');
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  if (!company) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-white mb-4">Company Profile</h1>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard/company/create')} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
          Create Company
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full dashboard-grid">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Company Profile</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Manage your company information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-xl hover:bg-neutral-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">

          {/* Logo + Basic Info */}
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="shrink-0">
                {isEditing ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl bg-neutral-950 border border-neutral-700 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-neutral-800 border border-neutral-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors">
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Name + Industry */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Company Name</label>
                  {isEditing ? (
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors" />
                  ) : (
                    <p className="text-white font-medium">{company.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Industry</label>
                  {isEditing ? (
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
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
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {/* Location */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Location</label>
              {isEditing ? (
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Manila, Philippines" className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
              ) : (
                <p className="text-white text-sm">{company.location || 'Not provided'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Website</label>
              {isEditing ? (
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
              ) : company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-neutral-300 transition-colors underline underline-offset-2">
                  {company.website}
                </a>
              ) : (
                <p className="text-white text-sm">Not provided</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
              {isEditing ? (
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell applicants about your company..." rows={5} className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none" />
              ) : (
                <p className="text-white text-sm leading-relaxed">{company.description || 'No description provided.'}</p>
              )}
            </div>

            {/* Created */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Member Since</label>
              <p className="text-white text-sm">{new Date(company.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancel} className="px-6 py-2.5 bg-neutral-800 text-neutral-400 text-sm font-medium rounded-xl hover:bg-neutral-700 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
