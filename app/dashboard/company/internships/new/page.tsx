// This is the Internship Posting form page - where company managers create new internship listings
// It collects title, description, available slots, and application deadline
// On submit, it sends the data to the API which saves it to the database
// After creation, the company is redirected to their dashboard

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for form fields, useEffect for auth check

export default function NewInternshipPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');           // Internship job title
  const [description, setDescription] = useState(''); // Job description and responsibilities
  const [slots, setSlots] = useState('');           // Number of available slots
  const [deadline, setDeadline] = useState('');     // Application deadline date
  const [error, setError] = useState('');           // Error messages
  const [loading, setLoading] = useState(false);    // Submit button loading state

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while session is being fetched
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();     // Prevent page reload on form submit
    setError('');           // Clear any previous errors
    setLoading(true);       // Show loading state on button

    // Validate that all required fields are filled
    if (!title || !description || !slots || !deadline) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Validate that slots is a positive number
    if (parseInt(slots) < 1) {
      setError('Slots must be at least 1');
      setLoading(false);
      return;
    }

    // Validate that deadline is in the future
    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be a future date');
      setLoading(false);
      return;
    }

    try {
      // Send internship data to the API endpoint
      const response = await fetch('/api/internship/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          slots: parseInt(slots),
          deadline
        })
      });

      // Parse the response from the server
      const data = await response.json();

      // If the server returned an error, display it
      if (!response.ok) {
        setError(data.error || 'Failed to create internship');
        setLoading(false);
        return;
      }

      // Internship created successfully, redirect to company dashboard
      router.push('/dashboard/company');
    } catch (err) {
      // Handle network or unexpected errors
      setError('Failed to create internship');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Post New Internship</h1>
      <p>Fill in the details for your internship listing.</p>

      {/* Display error message if validation or API fails */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Internship title - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Title:</strong></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}   // Update title state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="e.g. Software Engineering Intern"
          />
        </div>

        {/* Job description - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Description:</strong></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}   // Update description state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '150px' }}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
        </div>

        {/* Number of available slots - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Available Slots:</strong></label>
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(e.target.value)}   // Update slots state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            min="1"
            placeholder="Number of positions available"
          />
        </div>

        {/* Application deadline - required field */}
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Application Deadline:</strong></label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}   // Update deadline state on input
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Submit button - disabled while submitting */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}    // Disable button to prevent double submit
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            {loading ? 'Posting...' : 'Post Internship'}   {/* Show loading text while submitting */}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/company')}   // Cancel and go back to dashboard
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
