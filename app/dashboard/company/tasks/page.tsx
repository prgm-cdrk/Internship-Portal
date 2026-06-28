// This is the Task Management page - where company managers create and manage tasks for interns
// It displays all tasks with assigned intern, deadline, and status
// Company managers can create new tasks using a form and see all existing tasks

'use client';

import { useSession } from 'next-auth/react';       // useSession gets current user session
import { useRouter } from 'next/navigation';         // useRouter for redirecting
import { useState, useEffect } from 'react';         // useState for data and form, useEffect for fetching

// Type definition for a task
type Task = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;       // ONGOING, COMPLETED
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

// Status colors for visual indicators
const statusColors: Record<string, string> = {
  ONGOING: '#ffc107',     // Yellow
  COMPLETED: '#28a745',   // Green
};

export default function TasksPage() {
  const { data: session, status } = useSession();   // Get session and loading status
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);   // List of tasks
  const [loading, setLoading] = useState(true);     // Loading state while fetching
  const [error, setError] = useState('');           // Error messages
  const [showForm, setShowForm] = useState(false);  // Toggle create task form

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Fetch all tasks for this company
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/get');
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

  // Handle creating a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();     // Prevent page reload
    setError('');           // Clear previous errors
    setSaving(true);        // Show saving state

    // Validate required fields
    if (!title || !description || !deadline || !assignedTo) {
      setError('All fields are required');
      setSaving(false);
      return;
    }

    try {
      // Send task data to the API endpoint
      const response = await fetch('/api/task/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline, assignedTo })
      });

      const data = await response.json();

      // If the server returned an error, display it
      if (!response.ok) {
        setError(data.error || 'Failed to create task');
        setSaving(false);
        return;
      }

      // Clear form, hide form, and refresh tasks list
      setTitle('');
      setDescription('');
      setDeadline('');
      setAssignedTo('');
      setShowForm(false);
      setSaving(false);
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
      setSaving(false);
    }
  };

  // Show loading while session or data is loading
  if (status === 'loading' || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Task Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}   // Toggle the create task form
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: showForm ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {showForm ? 'Cancel' : '+ Create Task'}
        </button>
      </div>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create Task Form - shown when showForm is true */}
      {showForm && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask}>
            {/* Task title */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Title:</strong></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="e.g. Complete onboarding documentation"
              />
            </div>

            {/* Task description */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Description:</strong></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px' }}
                placeholder="Describe the task details..."
              />
            </div>

            {/* Deadline */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Deadline:</strong></label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            {/* Assigned to - text input for user ID (simplified for now) */}
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Assigned To (User ID):</strong></label>
              <input
                type="number"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="Enter the user ID of the intern"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      )}

      {/* Show message if no tasks exist */}
      {tasks.length === 0 ? (
        <div style={{ border: '1px solid #ddd', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No tasks created yet.</p>
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
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    {task.description}
                  </p>
                </div>
                {/* Status badge */}
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: statusColors[task.status] || '#6c757d',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {task.status}
                </span>
              </div>

              {/* Task details */}
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#555', marginTop: '10px' }}>
                <span><strong>Assigned to:</strong> {task.user.name}</span>
                <span>
                  <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
