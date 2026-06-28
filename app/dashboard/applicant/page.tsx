// Applicant Dashboard - shows application stats and quick actions
// Unread tasks, application status changes, and new announcements show notification badges
// Clicking unread activity items marks them as read and redirects

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Stats = {
  applications: number;
  tasks: number;
  announcements: number;
};

type ActivityItem = {
  id: number;
  type: 'application' | 'task' | 'announcement';
  message: string;
  detail: string;
  timestamp: string;
};

// localStorage keys
const READ_TASKS_KEY = 'readTasks';
const TASK_STATUSES_KEY = 'taskStatuses';
const APP_STATUSES_KEY = 'appStatuses';
const READ_ANNOUNCEMENTS_KEY = 'readAnnouncements';

function getReadIds(key: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function markAsRead(key: string, id: number) {
  const read = getReadIds(key);
  if (!read.includes(id)) {
    read.push(id);
    localStorage.setItem(key, JSON.stringify(read));
  }
}

function getAppStatuses(): Record<number, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(APP_STATUSES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function setAppStatus(id: number, status: string) {
  const statuses = getAppStatuses();
  statuses[id] = status;
  localStorage.setItem(APP_STATUSES_KEY, JSON.stringify(statuses));
}

function getTaskStatuses(): Record<number, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(TASK_STATUSES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function setTaskStatus(id: number, status: string) {
  const statuses = getTaskStatuses();
  statuses[id] = status;
  localStorage.setItem(TASK_STATUSES_KEY, JSON.stringify(statuses));
}

export default function ApplicantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ applications: 0, tasks: 0, announcements: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [readTaskIds, setReadTaskIds] = useState<number[]>([]);
  const [unreadTaskCount, setUnreadTaskCount] = useState(0);
  const [unreadAppCount, setUnreadAppCount] = useState(0);
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'APPLICANT') { router.push('/login'); return; }
    setReadTaskIds(getReadIds(READ_TASKS_KEY));
    fetchStats();
    fetchActivity();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const [appRes, taskRes, announceRes] = await Promise.all([
        fetch('/api/application/my'),
        fetch('/api/task/my'),
        fetch('/api/announcement/my')
      ]);
      const appData = await appRes.json();
      const taskData = await taskRes.json();
      const announceData = await announceRes.json();

      setStats({
        applications: appData.applications?.length || 0,
        tasks: taskData.tasks?.length || 0,
        announcements: announceData.announcements?.length || 0
      });

      const readTaskIdsNow = getReadIds(READ_TASKS_KEY);
      const savedTaskStatuses = getTaskStatuses();
      const allTasks = taskData.tasks || [];

      // Count unread tasks: not read OR status changed (e.g., returned from COMPLETED to ONGOING)
      let unreadTasks = 0;
      for (const task of allTasks) {
        const savedStatus = savedTaskStatuses[task.id];
        const isRead = readTaskIdsNow.includes(task.id);
        const statusChanged = savedStatus !== undefined && savedStatus !== task.status;
        if (!isRead || statusChanged) {
          unreadTasks++;
        }
      }
      setUnreadTaskCount(unreadTasks);

      // Count applications with status changes
      const savedStatuses = getAppStatuses();
      const apps = appData.applications || [];
      let unreadApps = 0;
      for (const app of apps) {
        const saved = savedStatuses[app.id];
        if (!saved || saved !== app.status) {
          unreadApps++;
        }
      }
      setUnreadAppCount(unreadApps);

      // Count unread announcements
      const readAnnIds = getReadIds(READ_ANNOUNCEMENTS_KEY);
      const announcements = announceData.announcements || [];
      setUnreadAnnouncementCount(announcements.filter((a: any) => !readAnnIds.includes(a.id)).length);

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const [appRes, taskRes, announceRes] = await Promise.all([
        fetch('/api/application/my'),
        fetch('/api/task/my'),
        fetch('/api/announcement/my')
      ]);
      const appData = await appRes.json();
      const taskData = await taskRes.json();
      const announceData = await announceRes.json();

      const all: ActivityItem[] = [
        ...(appData.applications || []).map((a: any) => ({
          id: a.id,
          type: 'application' as const,
          message: `Applied to ${a.internship?.title || 'internship'}`,
          detail: a.internship?.company?.name || 'Company',
          timestamp: a.appliedAt
        })),
        ...(taskData.tasks || []).map((t: any) => {
          const isReturned = t.status === 'ONGOING' && t.updatedAt && new Date(t.updatedAt).getTime() > new Date(t.createdAt).getTime();
          return {
            id: t.id,
            type: 'task' as const,
            message: isReturned ? `${t.title} (returned)` : t.title,
            detail: isReturned ? 'Manager returned this task — please redo' : (t.description?.substring(0, 60) || 'No description'),
            timestamp: isReturned ? t.updatedAt : t.createdAt
          };
        }),
        ...(announceData.announcements || []).map((a: any) => ({
          id: a.id,
          type: 'announcement' as const,
          message: a.title,
          detail: a.content?.substring(0, 60) || 'No content',
          timestamp: a.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 5);

      // Store current task statuses for change detection
      for (const task of taskData.tasks || []) {
        setTaskStatus(task.id, task.status);
      }

      setActivities(all);
    } catch { /* silent */ }
    setActivityLoading(false);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'task') {
      markAsRead(READ_TASKS_KEY, activity.id);
      // Also update stored status so status changes are no longer "unread"
      const task = activities.find(a => a.id === activity.id);
      if (task) setTaskStatus(task.id, 'READ');
      setReadTaskIds(getReadIds(READ_TASKS_KEY));
      setUnreadTaskCount(prev => Math.max(0, prev - 1));
      router.push('/dashboard/applicant/tasks');
    } else if (activity.type === 'application') {
      setAppStatus(activity.id, 'APPLIED');
      setUnreadAppCount(prev => Math.max(0, prev - 1));
      router.push('/dashboard/applicant/applications');
    } else if (activity.type === 'announcement') {
      markAsRead(READ_ANNOUNCEMENTS_KEY, activity.id);
      setUnreadAnnouncementCount(prev => Math.max(0, prev - 1));
      router.push('/dashboard/applicant/announcements');
    }
  };

  const actions = [
    { label: 'Browse Internships', desc: 'Find and apply to opportunities', path: '/dashboard/applicant/internships', badge: 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )},
    { label: 'My Applications', desc: 'Track your application status', path: '/dashboard/applicant/applications', badge: unreadAppCount, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    )},
    { label: 'My Tasks', desc: 'View assigned tasks', path: '/dashboard/applicant/tasks', badge: unreadTaskCount, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4" /></svg>
    )},
    { label: 'Announcements', desc: 'See company updates', path: '/dashboard/applicant/announcements', badge: unreadAnnouncementCount, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    )},
  ];

  const activityIcons: Record<string, JSX.Element> = {
    application: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ),
    task: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4" /></svg>
    ),
    announcement: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    )
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  if (!session || session.user?.role !== 'APPLICANT') {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Access denied. Applicants only.</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full animate-scan-line dashboard-grid relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Applicant Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1 tracking-wider">Welcome back, {session.user?.name}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Applications</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.applications}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Tasks</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.tasks}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Announcements</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.announcements}</p>
          </div>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center gap-4 text-left transition-all duration-200 hover:bg-neutral-800 hover:border-neutral-700 group relative"
            >
              {action.badge > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-neutral-700 transition-colors shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{action.label}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity Board */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            </div>
          </div>

          <div className="divide-y divide-neutral-800/50">
            {activityLoading ? (
              <div className="px-5 py-8 text-center">
                <p className="text-neutral-500 text-sm">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-neutral-500 text-sm">No recent activity yet.</p>
                <p className="text-neutral-600 text-xs mt-1">Activity will appear here when you apply or receive tasks.</p>
              </div>
            ) : (
              activities.map((activity, index) => {
                const isUnreadTask = activity.type === 'task' && (() => {
                  const isRead = readTaskIds.includes(activity.id);
                  const savedStatus = getTaskStatuses()[activity.id];
                  // Unread if not read OR status changed (returned task)
                  return !isRead || (savedStatus && savedStatus !== 'READ');
                })();
                const isUnreadApp = activity.type === 'application' && (() => {
                  const saved = getAppStatuses()[activity.id];
                  return !saved || saved !== 'APPLIED';
                })();
                const isUnreadAnnouncement = activity.type === 'announcement' && !getReadIds(READ_ANNOUNCEMENTS_KEY).includes(activity.id);
                const isUnread = isUnreadTask || isUnreadApp || isUnreadAnnouncement;

                return (
                  <div
                    key={index}
                    onClick={() => handleActivityClick(activity)}
                    className={`px-5 py-3 flex items-start gap-3 transition-colors ${
                      isUnread ? 'hover:bg-neutral-800/50 cursor-pointer' : 'hover:bg-neutral-800/30'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isUnread ? 'text-white' : 'text-neutral-400'}`}>
                      {activityIcons[activity.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${isUnread ? 'text-white font-semibold' : 'text-white'}`}>
                        {activity.message}
                        {isUnread && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-white align-middle" />}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${isUnread ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {activity.detail}
                      </p>
                    </div>
                    <span className="text-neutral-600 text-xs shrink-0 mt-0.5">{timeAgo(activity.timestamp)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
