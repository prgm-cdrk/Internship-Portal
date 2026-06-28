// This is the My Tasks page - where applicants can see all tasks assigned to them
// It displays each task with the company name, title, description, deadline, and status
// Status options: ACCEPTED, ONGOING, COMPLETED

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data, useEffect for fetching

// Type definition for a task with company info
type Task = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
};

// Color mapping for task statuses
const statusColors: { [key: string]: string } = {
  ACCEPTED: '#007bff',      // Blue - task accepted
  ONGOING: '#ffc107',       // Yellow - in progress
  COMPLETED: '#28a745'      // Green - done
};

export default function MyTasksPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);  // List of tasks
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch tasks when session is ready
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  // Fetch all tasks for this applicant
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/my');
      const data = await response.json();

      // If request failed, show error
      if (!response.ok) {
        setError(data.error || 'Failed to load tasks');
        setLoading(false);
        return;
      }

      // Set tasks data
      setTasks(data.tasks);
      setLoading(false);
    } catch (err) {
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Tasks</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show message if no tasks exist */}
      {tasks.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No tasks assigned to you yet.</p>
        </div>
      ) : (
        /* Tasks list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{task.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    {task.company.name} • {task.company.industry}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: statusColors[task.status] || '#6c757d',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {task.status}
                </span>
              </div>
              <p style={{ margin: '10px 0', color: '#333', lineHeight: '1.5' }}>
                {task.description}
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
