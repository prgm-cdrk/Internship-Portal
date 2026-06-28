// Browse Internships page - applicants can view all available internships
// Cards expand on click to show full description and resume upload
// Must attach a PDF resume before applying

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

type Internship = {
  id: number;
  title: string;
  description: string;
  slots: number;
  deadline: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
  _count: {
    applications: number;
  };
};

type AppliedIds = { [key: number]: boolean };

export default function BrowseInternshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedIds, setAppliedIds] = useState<AppliedIds>({});
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchInternships();
  }, [status]);

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internship/browse');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load internships');
        setLoading(false);
        return;
      }
      setInternships(data.internships);
      setLoading(false);
    } catch {
      setError('Failed to load internships');
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setResumeFile(null);
      setUploadProgress('');
    } else {
      setExpandedId(id);
      setResumeFile(null);
      setUploadProgress('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be under 5MB');
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleApply = async (internshipId: number) => {
    setError('');
    if (!resumeFile) {
      setError('Please attach your resume (PDF) before applying');
      return;
    }

    setApplyingId(internshipId);
    setUploadProgress('Uploading resume...');

    try {
      // Step 1: Upload resume
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const uploadRes = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error || 'Failed to upload resume');
        setApplyingId(null);
        setUploadProgress('');
        return;
      }

      // Step 2: Submit application with resume URL
      setUploadProgress('Submitting application...');

      const applyRes = await fetch('/api/application/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId, resumeUrl: uploadData.resumeUrl })
      });
      const applyData = await applyRes.json();

      if (!applyRes.ok) {
        setError(applyData.error || 'Failed to apply');
        setApplyingId(null);
        setUploadProgress('');
        return;
      }

      setAppliedIds(prev => ({ ...prev, [internshipId]: true }));
      setApplyingId(null);
      setUploadProgress('');
      setResumeFile(null);
      setExpandedId(null);
    } catch {
      setError('Failed to apply');
      setApplyingId(null);
      setUploadProgress('');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full dashboard-grid">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Browse Internships</h1>
          <p className="text-neutral-500 text-sm mt-1">Find and apply to opportunities</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {internships.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No internships available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {internships.map((internship) => {
              const isExpanded = expandedId === internship.id;
              const isApplied = appliedIds[internship.id];
              const isUploading = applyingId === internship.id;

              return (
                <div
                  key={internship.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-colors hover:bg-neutral-800/50"
                >
                  {/* Card header — always visible, clickable to expand */}
                  <button
                    onClick={() => handleToggle(internship.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium">{internship.title}</h3>
                      <p className="text-neutral-500 text-sm mt-0.5">
                        {internship.company.name} &bull; {internship.company.industry}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-neutral-500 text-xs">Slots: {internship.slots}</span>
                        <span className="text-neutral-500 text-xs">Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                        <span className="text-neutral-600 text-xs">{internship._count.applications} applicant(s)</span>
                      </div>
                    </div>
                    {/* Expand chevron */}
                    <svg
                      className={`w-5 h-5 text-neutral-500 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-neutral-800">
                      {/* Full description */}
                      <p className="text-neutral-400 text-sm mt-4 leading-relaxed">{internship.description}</p>

                      {/* Resume upload */}
                      {!isApplied ? (
                        <div className="mt-4 space-y-3">
                          <label className="block text-xs text-neutral-500 uppercase tracking-wider">
                            Attach Resume (PDF, max 5MB)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-400 hover:border-neutral-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {resumeFile ? resumeFile.name : 'Choose PDF file...'}
                              </div>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                            {resumeFile && (
                              <button
                                onClick={() => setResumeFile(null)}
                                className="text-neutral-500 hover:text-red-400 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Apply button */}
                          <button
                            onClick={() => handleApply(internship.id)}
                            disabled={!resumeFile || isUploading}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                              !resumeFile || isUploading
                                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-neutral-200'
                            }`}
                          >
                            {isUploading ? uploadProgress : 'Apply Now'}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 px-4 py-3 bg-neutral-800 rounded-lg">
                          <p className="text-neutral-400 text-sm">You&apos;ve already applied to this internship.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
