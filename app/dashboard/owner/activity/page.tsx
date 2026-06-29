// Owner Activity Feed page
// Real-time log of platform events (signups, applications, payments, etc.)

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Activity = {
  id: number;
  type: string;
  action: string;
  entity: string;
  entityId: number | null;
  details: string | null;
  userName: string;
  createdAt: string;
};

const TYPE_FILTERS = ['ALL', 'signup', 'application', 'payment', 'task', 'announcement', 'system', 'staff'];

const typeColors: Record<string, string> = {
  signup: 'bg-green-500/10 text-green-400 border-green-500/20',
  application: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  task: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  announcement: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  system: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  staff: 'bg-arcana-primary/10 text-arcana-light border-arcana-primary/20',
};

const typeIcons: Record<string, string> = {
  signup: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  application: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  payment: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  announcement: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  system: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  staff: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

export default function ActivityFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchActivities();
  }, [status, filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/activity?type=${filter}`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
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

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Activity Feed</h1>
          <p className="text-neutral-500 text-sm mt-1">Real-time log of platform events</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                filter === t ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Activity list */}
        {activities.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-neutral-500">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/50">
            {activities.map((activity) => (
              <div key={activity.id} className="px-5 py-4 flex items-start gap-4 hover:bg-neutral-800/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${typeColors[activity.type] || typeColors.system}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={typeIcons[activity.type] || typeIcons.system} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.userName}</span>
                    <span className="text-neutral-500 mx-1">{activity.action}</span>
                    <span className="text-neutral-300">{activity.entity}</span>
                    {activity.entityId && <span className="text-neutral-600">#{activity.entityId}</span>}
                  </p>
                  {activity.details && (
                    <p className="text-neutral-600 text-xs mt-1 truncate">{activity.details}</p>
                  )}
                </div>
                <span className="text-neutral-600 text-xs shrink-0 mt-0.5">{timeAgo(activity.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
