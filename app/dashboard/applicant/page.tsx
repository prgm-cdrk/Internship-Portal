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
const TASK_COUNT_KEY = 'taskCount';
const READ_APPS_KEY = 'readApps';
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

function getStoredStatuses(key: string): Record<number, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function setStoredStatus(key: string, id: number, status: string) {
  const statuses = getStoredStatuses(key);
  statuses[id] = status;
  localStorage.setItem(key, JSON.stringify(statuses));
}

export default function ApplicantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ applications: 0, tasks: 0, announcements: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [unreadTaskCount, setUnreadTaskCount] = useState(0);
  const [unreadAppCount, setUnreadAppCount] = useState(0);
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'APPLICANT') { router.push('/login'); return; }
    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      const [appRes, taskRes, announceRes] = await Promise.all([
        fetch('/api/application/my'),
        fetch('/api/task/my'),
        fetch('/api/announcement/my')
      ]);
      const appData = await appRes.json();
      const taskData = await taskRes.json();
      const announceData = await announceRes.json();

      const allTasks = taskData.tasks || [];
      const allApps = appData.applications || [];
      const allAnnouncements = announceData.announcements || [];

      // Stats
      setStats({
        applications: allApps.length,
        tasks: allTasks.length,
        announcements: allAnnouncements.length
      });

      // --- Count unread TASKS (count-based: new tasks = badge) ---
      const currentTaskCount = allTasks.length;
      const prevTaskCount = parseInt(localStorage.getItem(TASK_COUNT_KEY) || '0');
      const newTasks = Math.max(0, currentTaskCount - prevTaskCount);
      setUnreadTaskCount(newTasks);

      // Store current task count for next load
      localStorage.setItem(TASK_COUNT_KEY, currentTaskCount.toString());

      // Mark returned tasks in activity feed (status changed from COMPLETED to ONGOING)
      for (const task of allTasks) {
        const savedStatus = getStoredStatuses(TASK_STATUSES_KEY);
        const oldStatus = savedStatus[task.id];
        // Store current status for returned detection
        setStoredStatus(TASK_STATUSES_KEY, task.id, task.status);
      }

      // --- Count unread APPLICATIONS ---
      const readAppIds = getReadIds(READ_APPS_KEY);
      const savedAppStatuses = getStoredStatuses(APP_STATUSES_KEY);
      let unreadApps = 0;
      for (const app of allApps) {
        const savedStatus = savedAppStatuses[app.id];
        const isRead = readAppIds.includes(app.id);
        // Unread if: never seen before OR status changed since last seen
        if (!isRead || (savedStatus !== undefined && savedStatus !== app.status)) {
          unreadApps++;
        }
      }
      setUnreadAppCount(unreadApps);

      // Store current app statuses for next load comparison
      for (const app of allApps) {
        setStoredStatus(APP_STATUSES_KEY, app.id, app.status);
      }

      // --- Count unread ANNOUNCEMENTS ---
      const readAnnIds = getReadIds(READ_ANNOUNCEMENTS_KEY);
      setUnreadAnnouncementCount(allAnnouncements.filter((a: any) => !readAnnIds.includes(a.id)).length);

      // --- Build activity feed ---
      const all: ActivityItem[] = [
        ...allApps.map((a: any) => ({
          id: a.id,
          type: 'application' as const,
          message: `Applied to ${a.internship?.title || 'internship'}`,
          detail: a.internship?.company?.name || 'Company',
          timestamp: a.appliedAt
        })),
        ...allTasks.map((t: any) => {
          const isReturned = t.status === 'ONGOING' && t.updatedAt && new Date(t.updatedAt).getTime() > new Date(t.createdAt).getTime();
          return {
            id: t.id,
            type: 'task' as const,
            message: isReturned ? `${t.title} (returned)` : t.title,
            detail: isReturned ? 'Manager returned this task — please redo' : (t.description?.substring(0, 60) || 'No description'),
            timestamp: isReturned ? t.updatedAt : t.createdAt
          };
        }),
        ...allAnnouncements.map((a: any) => ({
          id: a.id,
          type: 'announcement' as const,
          message: a.title,
          detail: a.content?.substring(0, 60) || 'No content',
          timestamp: a.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 5);

      setActivities(all);
      setLoading(false);
      setActivityLoading(false);
    } catch {
      setLoading(false);
      setActivityLoading(false);
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'task') {
      // Reset task count — user has seen the tasks
      setUnreadTaskCount(0);
      router.push('/dashboard/applicant/tasks');
    } else if (activity.type === 'application') {
      markAsRead(READ_APPS_KEY, activity.id);
      setUnreadAppCount(prev => Math.max(0, prev - 1));
      router.push('/dashboard/applicant/applications');
    } else if (activity.type === 'announcement') {
      markAsRead(READ_ANNOUNCEMENTS_KEY, activity.id);
      setUnreadAnnouncementCount(prev => Math.max(0, prev - 1));
      router.push('/dashboard/applicant/announcements');
    }
  };

  const handleMarkAllRead = (type: 'application' | 'announcement') => {
    if (type === 'application') {
      const allAppIds = activities.filter(a => a.type === 'application').map(a => a.id);
      allAppIds.forEach(id => markAsRead(READ_APPS_KEY, id));
      setUnreadAppCount(0);
      router.push('/dashboard/applicant/applications');
    } else if (type === 'announcement') {
      const allAnnIds = activities.filter(a => a.type === 'announcement').map(a => a.id);
      allAnnIds.forEach(id => markAsRead(READ_ANNOUNCEMENTS_KEY, id));
      setUnreadAnnouncementCount(0);
      router.push('/dashboard/applicant/announcements');
    }
  };

  const actions = [
    { label: 'Browse Internships', desc: 'Find and apply to opportunities', badge: 0, onClick: () => router.push('/dashboard/applicant/internships'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )},
    { label: 'My Applications', desc: 'Track your application status', badge: unreadAppCount, onClick: () => handleMarkAllRead('application'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    )},
    { label: 'My Tasks', desc: 'View assigned tasks', badge: unreadTaskCount, onClick: () => { setUnreadTaskCount(0); router.push('/dashboard/applicant/tasks'); }, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4" /></svg>
    )},
    { label: 'Announcements', desc: 'See company updates', badge: unreadAnnouncementCount, onClick: () => handleMarkAllRead('announcement'), icon: (
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

  const isActivityUnread = (activity: ActivityItem): boolean => {
    if (activity.type === 'task') {
      const readTaskIds = getReadIds(READ_TASKS_KEY);
      const savedTaskStatuses = getStoredStatuses(TASK_STATUSES_KEY);
      const isRead = readTaskIds.includes(activity.id);
      // Find current status from stored statuses (already saved by loadData)
      const savedStatus = savedTaskStatuses[activity.id];
      // Check if status changed — but we need the ORIGINAL status, not current
      // A task is "new unread" if it was never clicked AND its status changed
      return !isRead;
    }
    if (activity.type === 'application') {
      const readAppIds = getReadIds(READ_APPS_KEY);
      return !readAppIds.includes(activity.id);
    }
    if (activity.type === 'announcement') {
      const readAnnIds = getReadIds(READ_ANNOUNCEMENTS_KEY);
      return !readAnnIds.includes(activity.id);
    }
    return false;
  };

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
              onClick={action.onClick}
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
                const isUnread = isActivityUnread(activity);
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
