// This is the Create Company page - where new company managers set up their company profile
// It only appears when a COMPANY user doesn't have a company yet (redirected from dashboard)
// The form collects company name, industry, and optional website
// After creation, the user is redirected back to the company dashboard

'use client';

import { useSession } from 'next-auth/react';   // useSession gets current user session
import { useRouter } from 'next/navigation';     // useRouter for redirecting
import { useState } from 'react';                // useState for form fields

export default function CreateCompanyPage() {
  // Get the current session and loading status
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');          // Company name
  const [industry, setIndustry] = useState('');  // Industry category
  const [website, setWebsite] = useState('');    // Optional company website
  const [error, setError] = useState('');        // Error messages
  const [loading, setLoading] = useState(false); // Submit button loading state

  // Redirect to login if user is not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Show loading while session is being fetched
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();     // Prevent page reload on form submit
    setError('');           // Clear any previous errors
    setLoading(true);       // Show loading state on button

    // Validate that required fields are filled
    if (!name || !industry) {
      setError('Company name and industry are required');
      setLoading(false);
      return;
    }

    try {
      // Send company data to the API endpoint
      const response = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, website })
      });

      // Parse the response from the server
      const data = await response.json();

      // If the server returned an error, display it
      if (!response.ok) {
        setError(data.error || 'Failed to create company');
        setLoading(false);
        return;
      }

      // Company created successfully, redirect to company dashboard
      router.push('/dashboard/company');
    } catch (err) {
      // Handle network or unexpected errors
      setError('Failed to create company');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Create Your Company</h1>
      <p>Welcome, {session?.user?.name}! Let's set up your company profile.</p>

      {/* Display error message if validation or API fails */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Company name input - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label>Company Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}   // Update name state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Industry dropdown - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label>Industry:</label>
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
        </div>

        {/* Website input - optional field */}
        <div style={{ marginBottom: '15px' }}>
          <label>Website (optional):</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}   // Update website state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="https://example.com"
          />
        </div>

        {/* Submit button - disabled while submitting */}
        <button
          type="submit"
          disabled={loading}    // Disable button to prevent double submit
          style={{
            width: '100%',
            padding: '10px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {loading ? 'Creating...' : 'Create Company'}   {/* Show loading text while submitting */}
        </button>
      </form>
    </div>
  );
}
