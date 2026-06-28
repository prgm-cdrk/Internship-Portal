// My Tasks page - applicants can see all tasks assigned to them
// Can mark tasks as ONGOING or COMPLETED using Finish button
// Uses monotone dark theme matching company manager pages

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

export default function MyTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/my');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load tasks');
        setLoading(false);
        return;
      }
      setTasks(data.tasks);
      setLoading(false);
    } catch {
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    setError('');
    setSuccessMessage('');
    setUpdatingId(taskId);
    try {
      const response = await fetch('/api/task/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update task');
        setUpdatingId(null);
        return;
      }
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
      setSuccessMessage(newStatus === 'COMPLETED' ? 'Task completed!' : 'Task started');
      setUpdatingId(null);
    } catch {
      setError('Failed to update task');
      setUpdatingId(null);
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
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">My Tasks</h1>
              <p className="text-neutral-500 text-sm mt-1">View and complete assigned tasks</p>
            </div>
            {tasks.length > 0 && (
              <div className="flex gap-2 ml-auto">
                <span className="bg-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-lg border border-neutral-700">
                  {tasks.length} total
                </span>
                <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10">
                  {tasks.filter(t => t.status === 'COMPLETED').length} completed
                </span>
                <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1.5 rounded-lg border border-neutral-700">
                  {tasks.filter(t => t.status !== 'COMPLETED').length} remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => setError('')} className="text-xs text-red-400/60 hover:text-red-400 mt-1">dismiss</button>
          </div>
        )}

        {successMessage && (
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-neutral-300">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-xs text-neutral-500 hover:text-neutral-300 mt-1">dismiss</button>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isOngoing = task.status === 'ONGOING';
              const isUpdating = updatingId === task.id;

              return (
                <div
                  key={task.id}
                  className={`bg-neutral-900 border rounded-xl p-5 transition-colors ${
                    isCompleted
                      ? 'border-neutral-800/50 opacity-60'
                      : 'border-neutral-800 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-medium ${isCompleted ? 'text-neutral-500 line-through' : 'text-white'}`}>{task.title}</h3>
                      <p className="text-neutral-500 text-sm mt-0.5">
                        {task.company.name} &bull; {task.company.industry}
                      </p>
                      <p className={`text-sm mt-3 leading-relaxed ${isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}>{task.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-neutral-500 text-xs">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isCompleted
                            ? 'bg-white text-black'
                            : isOngoing
                              ? 'bg-neutral-700 text-white border border-neutral-500'
                              : 'bg-neutral-700 text-neutral-300 border border-neutral-600'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0">
                      {!isCompleted && !isOngoing && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'ONGOING')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700 hover:text-white active:scale-95 transition-all duration-200 disabled:opacity-50"
                        >
                          {isUpdating ? '...' : 'Start'}
                        </button>
                      )}
                      {isOngoing && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-gradient-to-r from-white to-neutral-200 text-black text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                        >
                          {isUpdating ? '...' : 'Finish'}
                        </button>
                      )}
                      {isCompleted && (
                        <span className="px-4 py-2 bg-white/10 text-neutral-500 text-sm rounded-lg inline-block">
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
