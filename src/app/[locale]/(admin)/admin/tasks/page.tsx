'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TaskRecord {
  id: string;
  name: string;
  status: string;
  assignedTo: string;
  deadline: string | null;
  milestone: { name: string; project: { universityName: string } };
}

export default function AdminTasksPage() {
  const t = useTranslations('admin.tasks');
  const tc = useTranslations('common');
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((projects: any[]) => {
        const allTasks: TaskRecord[] = [];
        for (const p of projects) {
          for (const m of p.milestones || []) {
            for (const task of m.tasks || []) {
              allTasks.push({ ...task, milestone: { name: m.name, project: { universityName: p.universityName } } });
            }
          }
        }
        setTasks(allTasks);
        setLoading(false);
      });
  }, []);

  const filtered = tasks.filter((task) =>
    !search || task.name.toLowerCase().includes(search.toLowerCase()) || task.milestone.project.universityName.toLowerCase().includes(search.toLowerCase())
  );

  const statusVariant = (s: string) => s === 'COMPLETED' ? 'success' as const : s === 'IN_PROGRESS' ? 'warning' as const : 'secondary' as const;

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Input placeholder={t('searchTasks')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noTasks')}</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('taskName')}</th>
                <th className="text-left p-3 font-medium">{t('project')}</th>
                <th className="text-left p-3 font-medium">{t('milestone')}</th>
                <th className="text-left p-3 font-medium">{t('assignedTo')}</th>
                <th className="text-left p-3 font-medium">{t('deadline')}</th>
                <th className="text-left p-3 font-medium">{t('taskStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{task.name}</td>
                  <td className="p-3">{task.milestone.project.universityName}</td>
                  <td className="p-3">{task.milestone.name}</td>
                  <td className="p-3">{task.assignedTo}</td>
                  <td className="p-3">{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</td>
                  <td className="p-3"><Badge variant={statusVariant(task.status)}>{task.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
