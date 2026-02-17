'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

interface LoginLogRecord {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

export default function LoginLogsPage() {
  const t = useTranslations('admin.loginLogs');
  const tc = useTranslations('common');
  const [logs, setLogs] = useState<LoginLogRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/login-logs?${params}`);
    setLogs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [search]);

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Input placeholder={t('searchLogs')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      {logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noLogs')}</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('user')}</th>
                <th className="text-left p-3 font-medium">{t('role')}</th>
                <th className="text-left p-3 font-medium">{t('ip')}</th>
                <th className="text-left p-3 font-medium">{t('device')}</th>
                <th className="text-left p-3 font-medium">{t('loginTime')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">{log.user.name}</td>
                  <td className="p-3">{log.user.role}</td>
                  <td className="p-3">{log.ip || '-'}</td>
                  <td className="p-3 max-w-[250px] truncate">{log.userAgent || '-'}</td>
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
