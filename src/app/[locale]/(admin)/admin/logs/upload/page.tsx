'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/lib/utils';

interface UploadLogRecord {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  fileType: string;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

export default function UploadLogsPage() {
  const t = useTranslations('admin.uploadLogs');
  const tc = useTranslations('common');
  const [logs, setLogs] = useState<UploadLogRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/upload-logs?${params}`);
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
                <th className="text-left p-3 font-medium">{t('originalName')}</th>
                <th className="text-left p-3 font-medium">{t('fileType')}</th>
                <th className="text-left p-3 font-medium">{t('fileSize')}</th>
                <th className="text-left p-3 font-medium">{t('uploadTime')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">{log.user.name}</td>
                  <td className="p-3 max-w-[250px] truncate">{log.originalName}</td>
                  <td className="p-3">{log.fileType}</td>
                  <td className="p-3">{formatFileSize(log.size)}</td>
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
