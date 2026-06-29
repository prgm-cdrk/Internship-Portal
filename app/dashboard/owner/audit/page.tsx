// Owner Audit Logs page — track all owner/staff actions
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type AuditLog = {
  id: number;
  userId: number;
  action: string;
  target: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

const actionColors: Record<string, string> = {
  'staff': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'user': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'company': 'bg-green-500/10 text-green-400 border-green-500/20',
  'settings': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);
  useEffect(() => { if (status === 'authenticated') fetchLogs(); }, [status, filter]);

  const fetchLogs = async () => {
    const res = await fetch(`/api/owner/audit?action=${filter}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  };

  const getColor = (action: string) => {
    for (const [key, color] of Object.entries(actionColors)) {
      if (action.startsWith(key)) return color;
    }
    return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="p-8 bg-gradient-to-b from-neutral-950 to-black min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Audit Logs</h1>
          <p className="text-neutral-500 text-sm mt-1">Track all owner and staff actions across the platform</p>
        </div>

        <div className="flex gap-1.5 mb-6 flex-wrap">
          {['', 'staff', 'user', 'company', 'settings'].map((a) => (
            <button key={a} onClick={() => setFilter(a)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === a ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}>
              {a || 'All'}
            </button>
          ))}
        </div>

        {logs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center"><p className="text-neutral-500">No audit logs found.</p></div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/50">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-neutral-800/30 transition-colors">
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border shrink-0 mt-0.5 ${getColor(log.action)}`}>{log.action}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                    {log.target && <span className="text-neutral-500 ml-2">{log.target}</span>}
                  </p>
                  {log.details && <p className="text-neutral-600 text-xs mt-1 truncate">{log.details}</p>}
                </div>
                <span className="text-neutral-600 text-xs shrink-0">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
