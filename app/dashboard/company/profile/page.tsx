// This is the Company Profile page - shows company details with edit functionality
// It fetches company data from /api/company/get
// Displays company info with an Edit button
// When Edit is clicked → form fields become editable
// When Save is clicked → calls API to update (to be created next)

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for form fields, useEffect for data fetching

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // Company data and UI state
  const [company, setCompany] = useState(null);     // Stores the company data
  const [loading, setLoading] = useState(true);     // Loading state while fetching company
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit mode

  // Editable form fields
  const [name, setName] = useState('');             // Company name
  const [industry, setIndustry] = useState('');     // Industry category
  const [website, setWebsite] = useState('');       // Company website
  const [error, setError] = useState('');           // Error messages
  const [saving, setSaving] = useState(false);      // Saving state while updating

  // Fetch company data when session is ready
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Wait until session is loaded
    if (status === 'loading') return;

    // Fetch the company data
    fetchCompanyData();
  }, [status]);

  // Fetch company data from the API
  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company/get');
      const data = await response.json();

      // If no company found, show error
      if (!response.ok) {
        setError('Company not found. Please create one first.');
        setLoading(false);
        return;
      }

      // Set company data and populate form fields
      setCompany(data.company);
      setName(data.company.name);
      setIndustry(data.company.industry);
      setWebsite(data.company.website || '');   // Default to empty string if no website
      setLoading(false);
    } catch (err) {
      setError('Failed to load company');
      setLoading(false);
    }
  };

  // Save updated company data
  const handleSave = async () => {
    setError('');
    setSaving(true);

    // Validate required fields
    if (!name || !industry) {
      setError('Company name and industry are required');
      setSaving(false);
      return;
    }

    try {
      // Call the update API with the new company data
      const response = await fetch('/api/company/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, website })
      });

      const data = await response.json();

      // If the server returned an error, display it
      if (!response.ok) {
        setError(data.error || 'Failed to save company');
        setSaving(false);
        return;
      }

      // Update local state with the saved data and exit edit mode
      setCompany(data.company);
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      // Handle network or unexpected errors
      setError('Failed to save company');
      setSaving(false);
    }
  };

  // Show loading while session or company data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  // If no company exists, show a message with a link to create one
  if (!company) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Company Profile</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.push('/dashboard/company/create')}>
          Create Company
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Company Profile</h1>
      
      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Company info card */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '20px' }}>
          {/* Company Name - editable or display */}
          <div style={{ marginBottom: '15px' }}>
            <label><strong>Company Name:</strong></label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}   // Update name state on input
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            ) : (
              <p>{company.name}</p>
            )}
          </div>

          {/* Industry - editable dropdown or display */}
          <div style={{ marginBottom: '15px' }}>
            <label><strong>Industry:</strong></label>
            {isEditing ? (
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}   // Update industry state on selection
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
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
              <p>{company.industry}</p>
            )}
          </div>

          {/* Website - editable or display */}
          <div style={{ marginBottom: '15px' }}>
            <label><strong>Website:</strong></label>
            {isEditing ? (
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}   // Update website state on input
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            ) : (
              <p>{company.website || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Action buttons - Save/Cancel when editing, Edit when viewing */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}    // Disable button while saving
                style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none' }}
              >
                {saving ? 'Saving...' : 'Save'}   {/* Show loading text while saving */}
              </button>
              <button
                onClick={() => setIsEditing(false)}   // Cancel editing, revert to view mode
                style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}   // Enable edit mode
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
