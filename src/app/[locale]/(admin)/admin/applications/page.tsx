'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  universityName: string;
  major: string;
  deadline: string | null;
  status: string;
  student: { id: string; name: string };
  counselor: { id: string; name: string };
}

export default function ApplicationsPage() {
  const t = useTranslations('admin.applications');
  const tc = useTranslations('common');
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects').then((r) => r.json()).then((d) => { setProjects(d); setLoading(false); });
  }, []);

  const filtered = projects.filter((p) =>
    !search ||
    p.universityName.toLowerCase().includes(search.toLowerCase()) ||
    p.student.name.toLowerCase().includes(search.toLowerCase()) ||
    p.major.toLowerCase().includes(search.toLowerCase())
  );

  const statusVariant = (s: string) => s === 'COMPLETED' ? 'success' as const : s === 'CANCELLED' ? 'secondary' as const : 'warning' as const;

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Input placeholder={t('searchProjects')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noProjects')}</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('university')}</th>
                <th className="text-left p-3 font-medium">{t('major')}</th>
                <th className="text-left p-3 font-medium">{t('student')}</th>
                <th className="text-left p-3 font-medium">{t('counselor')}</th>
                <th className="text-left p-3 font-medium">{t('deadline')}</th>
                <th className="text-left p-3 font-medium">{t('projectStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{p.universityName}</td>
                  <td className="p-3">{p.major}</td>
                  <td className="p-3">{p.student.name}</td>
                  <td className="p-3">{p.counselor.name}</td>
                  <td className="p-3">{p.deadline ? new Date(p.deadline).toLocaleDateString() : '-'}</td>
                  <td className="p-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
