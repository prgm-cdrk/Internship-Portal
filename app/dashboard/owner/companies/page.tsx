// Owner Companies Management page
// View all companies, filter by plan, search, suspend/activate/delete

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Company = {
  id: number;
  name: string;
  industry: string;
  location: string | null;
  createdAt: string;
  manager: { id: number; name: string; email: string; isActive: boolean } | null;
  subscription: { plan: string; status: string; expiredAt: string } | null;
  _count: { internships: number };
};

const planColors: Record<string, string> = {
  FREE: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  BASIC: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PRO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function CompaniesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchCompanies();
  }, [status]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`/api/owner/companies?search=${encodeURIComponent(search)}&plan=${filterPlan}`);
      const data = await res.json();
      if (res.ok) setCompanies(data.companies);
      else setError(data.error);
    } catch { setError('Failed to load companies'); }
    setLoading(false);
  };

  const handleSearch = () => { setLoading(true); fetchCompanies(); };

  const handleToggleSuspend = async (company: Company) => {
    if (!company.manager) return;
    const isActive = !company.manager.isActive;
    try {
      await fetch('/api/owner/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, isActive }),
      });
      fetchCompanies();
    } catch { setError('Failed to update company'); }
  };

  const handleDelete = async (companyId: number) => {
    if (!confirm('Delete this company and all its data? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/owner/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) fetchCompanies();
      else { const d = await res.json(); setError(d.error); }
    } catch { setError('Failed to delete company'); }
  };

  const filtered = filterPlan === 'ALL' ? companies : companies.filter(c => c.subscription?.plan === filterPlan);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Companies Management</h1>
          <p className="text-neutral-500 text-sm mt-1">View and manage all registered companies</p>
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
              placeholder="Search company name..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600" />
          </div>
          <div className="flex gap-1.5">
            {['ALL', 'FREE', 'BASIC', 'PRO'].map((p) => (
              <button key={p} onClick={() => { setFilterPlan(p); setLoading(true); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  filterPlan === p ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <p className="text-neutral-600 text-xs mb-4">Showing {filtered.length} companies</p>

        {filtered.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-neutral-500">No companies found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((company) => (
              <div key={company.id} className={`bg-neutral-900 border rounded-xl p-5 transition-colors ${!company.manager?.isActive ? 'border-red-500/20 opacity-60' : 'border-neutral-800 hover:border-neutral-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 font-semibold text-sm">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{company.name}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${planColors[company.subscription?.plan || 'FREE']}`}>
                          {company.subscription?.plan || 'FREE'}
                        </span>
                        {!company.manager?.isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">SUSPENDED</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-xs mt-0.5">{company.industry} {company.location ? `• ${company.location}` : ''}</p>
                      <p className="text-neutral-600 text-xs mt-0.5">Manager: {company.manager?.name} ({company.manager?.email})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedCompany(selectedCompany?.id === company.id ? null : company)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-colors">Details</button>
                    {company.manager && (
                      <button onClick={() => handleToggleSuspend(company)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${company.manager.isActive ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10' : 'text-green-400 border-green-500/20 hover:bg-green-500/10'}`}>
                        {company.manager.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(company.id)}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>

                {/* Expanded details */}
                {selectedCompany?.id === company.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div><span className="text-neutral-600">Internships:</span> <span className="text-white">{company._count.internships}</span></div>
                    <div><span className="text-neutral-600">Plan:</span> <span className="text-white">{company.subscription?.plan || 'FREE'}</span></div>
                    <div><span className="text-neutral-600">Status:</span> <span className="text-white">{company.subscription?.status || 'N/A'}</span></div>
                    <div><span className="text-neutral-600">Expires:</span> <span className="text-white">{company.subscription?.expiredAt ? new Date(company.subscription.expiredAt).toLocaleDateString() : 'N/A'}</span></div>
                    <div><span className="text-neutral-600">Website:</span> <span className="text-white">{company.location || 'N/A'}</span></div>
                    <div><span className="text-neutral-600">Joined:</span> <span className="text-white">{new Date(company.createdAt).toLocaleDateString()}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
