// My Tasks page - applicants can see all tasks assigned to them
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">My Tasks</h1>
          <p className="text-neutral-500 text-sm mt-1">View assigned tasks</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-16 text-center">
            <p className="text-neutral-500">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <p className="text-neutral-500 text-sm mt-0.5">
                      {task.company.name} &bull; {task.company.industry}
                    </p>
                    <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-neutral-500 text-xs">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700 shrink-0">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
