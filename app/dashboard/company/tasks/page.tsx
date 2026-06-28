// Task Management page - create and manage tasks for interns
// Company managers can assign tasks to accepted applicants via dropdown

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
  user: { id: number; name: string; email: string };
  department: string;
};

type Intern = {
  id: number;
  name: string;
  email: string;
  internship: string;
};

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [internsLoading, setInternsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
  }, [status]);

  useEffect(() => {
    if (showForm) fetchInterns();
  }, [showForm]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/get');
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

  const fetchInterns = async () => {
    setInternsLoading(true);
    try {
      const response = await fetch('/api/company/accepted-interns');
      const data = await response.json();
      if (response.ok) {
        setInterns(data.interns);
      }
    } catch {
      // silent
    }
    setInternsLoading(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!title || !description || !deadline || !assignedTo) {
      setError('All fields are required');
      setSaving(false);
      return;
    }
    try {
      const response = await fetch('/api/task/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline, assignedTo })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create task');
        setSaving(false);
        return;
      }
      setTitle('');
      setDescription('');
      setDeadline('');
      setAssignedTo('');
      setShowForm(false);
      setSaving(false);
      fetchTasks();
    } catch {
      setError('Failed to create task');
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = search === '' ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.user.name.toLowerCase().includes(search.toLowerCase()) ||
      task.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full dashboard-grid">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Tasks</h1>
            <p className="text-neutral-500 text-sm mt-1">Create and assign tasks to accepted interns</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showForm
                ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Create Task Form */}
        {showForm && (
          <form onSubmit={handleCreateTask} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete onboarding documentation"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task details..."
                rows={3}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Assign To</label>
                {internsLoading ? (
                  <div className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-500 text-sm">
                    Loading interns...
                  </div>
                ) : (
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                  >
                    <option value="">Select an intern</option>
                    {interns.length === 0 ? (
                      <option value="" disabled>No accepted interns yet</option>
                    ) : (
                      interns.map((intern) => (
                        <option key={intern.id} value={intern.id}>
                          {intern.name} — {intern.internship}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || interns.length === 0}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        )}

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task name, intern, or department..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {['ALL', 'ACCEPTED', 'ONGOING', 'COMPLETED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-black'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <p className="text-neutral-500">{tasks.length === 0 ? 'No tasks created yet.' : 'No tasks match your search.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium text-sm">{task.title}</h3>
                    <p className="text-neutral-500 text-xs mt-1">{task.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ml-3 ${
                    task.status === 'COMPLETED'
                      ? 'bg-white text-black'
                      : task.status === 'ONGOING'
                        ? 'bg-neutral-700 text-white border border-neutral-500'
                        : 'bg-neutral-700 text-neutral-300 border border-neutral-600'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-5 mt-3 text-xs text-neutral-500">
                  <span><span className="text-neutral-600">Assigned to:</span> {task.user.name}</span>
                  <span><span className="text-neutral-600">Department:</span> {task.department}</span>
                  <span><span className="text-neutral-600">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
