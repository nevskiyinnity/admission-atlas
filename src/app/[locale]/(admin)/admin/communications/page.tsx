'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

interface MessageRecord {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string; role: string };
  task: { name: string };
}

export default function CommunicationsPage() {
  const t = useTranslations('admin.communications');
  const tc = useTranslations('common');
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((d) => { setMessages(d); setLoading(false); });
  }, []);

  const filtered = messages.filter((m) =>
    !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.sender.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Input placeholder={t('searchMessages')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noMessages')}</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('sender')}</th>
                <th className="text-left p-3 font-medium">{t('content')}</th>
                <th className="text-left p-3 font-medium">{t('task')}</th>
                <th className="text-left p-3 font-medium">{t('sentAt')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((msg) => (
                <tr key={msg.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <span>{msg.sender.name}</span>
                    <span className="text-muted-foreground ml-1 text-xs">({msg.sender.role})</span>
                  </td>
                  <td className="p-3 max-w-[300px] truncate">{msg.content}</td>
                  <td className="p-3">{msg.task?.name || '-'}</td>
                  <td className="p-3">{new Date(msg.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
