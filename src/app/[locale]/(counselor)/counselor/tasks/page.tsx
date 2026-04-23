'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDbUser } from '@/hooks/use-db-user';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type Filter = 'ALL' | Status;

interface Task {
  id: string;
  name: string;
  status: Status;
  deadline: string | null;
}
interface Milestone { tasks: Task[] }
interface Student { id: string; name: string }
interface Project {
  id: string;
  universityName: string;
  studentId: string;
  student?: Student;
  milestones: Milestone[];
}

interface FlatTask {
  id: string;
  name: string;
  status: Status;
  deadline: string | null;
  studentName: string;
  universityName: string;
}

const statusVariant: Record<Status, 'default' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
};

export default function CounselorTasksPage() {
  const t = useTranslations('counselor.tasks');
  const tc = useTranslations('common');
  const dbUser = useDbUser();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!dbUser?.id) return;
    fetch(`/api/projects?counselorId=${dbUser.id}`)
      .then((r) => r.ok ? r.json() : { projects: [] })
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]));
  }, [dbUser?.id]);

  const tasks: FlatTask[] = useMemo(() => {
    if (!projects) return [];
    const out: FlatTask[] = [];
    for (const p of projects) {
      for (const m of p.milestones ?? []) {
        for (const task of m.tasks ?? []) {
          out.push({
            id: task.id,
            name: task.name,
            status: task.status,
            deadline: task.deadline,
            studentName: p.student?.name ?? '—',
            universityName: p.universityName,
          });
        }
      }
    }
    return out;
  }, [projects]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filter !== 'ALL' && task.status !== filter) return false;
      if (!q) return true;
      return (
        task.name.toLowerCase().includes(q) ||
        task.studentName.toLowerCase().includes(q) ||
        task.universityName.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks, filter, search]);

  const filters: Filter[] = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
  const filterLabel = (f: Filter) => ({
    ALL: t('filterAll'),
    PENDING: t('filterPending'),
    IN_PROGRESS: t('filterInProgress'),
    COMPLETED: t('filterCompleted'),
  })[f];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {projects === null ? (
        <p className="text-muted-foreground">{tc('loading')}</p>
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground">{t('noTasks')}</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3 font-medium">{t('title')}</th>
                  <th className="text-left p-3 font-medium">{t('student')}</th>
                  <th className="text-left p-3 font-medium">{t('project')}</th>
                  <th className="text-left p-3 font-medium">{t('deadline')}</th>
                  <th className="text-left p-3 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((task) => {
                  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
                  const daysUntil = deadlineDate
                    ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const overdue = daysUntil !== null && daysUntil < 0 && task.status !== 'COMPLETED';
                  return (
                    <tr key={task.id} className="border-b last:border-b-0">
                      <td className="p-3 font-medium">{task.name}</td>
                      <td className="p-3 text-muted-foreground">{task.studentName}</td>
                      <td className="p-3 text-muted-foreground">{task.universityName}</td>
                      <td className="p-3 text-muted-foreground">
                        {deadlineDate ? (
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            {deadlineDate.toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        <Badge variant={statusVariant[task.status]}>
                          {filterLabel(task.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
