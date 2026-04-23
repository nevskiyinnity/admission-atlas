'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDbUser } from '@/hooks/use-db-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderOpen, CheckSquare, Calendar } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string | null;
}
interface Milestone { tasks: Task[] }
interface Project {
  id: string;
  universityName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  studentId: string;
  milestones: Milestone[];
}

interface DeadlineEntry {
  id: string;
  name: string;
  universityName: string;
  deadline: string;
  daysUntil: number;
}

export default function CounselorDashboardPage() {
  const t = useTranslations('counselor.dashboard');
  const dbUser = useDbUser();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    if (!dbUser?.id) return;
    fetch(`/api/projects?counselorId=${dbUser.id}`)
      .then((r) => r.ok ? r.json() : { projects: [] })
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]));
  }, [dbUser?.id]);

  const stats = (() => {
    if (!projects) return null;
    const studentIds = new Set(projects.map((p) => p.studentId));
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
    let pending = 0;
    let dueThisWeek = 0;
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const upcoming: DeadlineEntry[] = [];
    for (const p of projects) {
      for (const m of p.milestones ?? []) {
        for (const task of m.tasks ?? []) {
          if (task.status !== 'COMPLETED') pending += 1;
          if (task.deadline) {
            const ts = new Date(task.deadline).getTime();
            const daysUntil = Math.ceil((ts - now) / (1000 * 60 * 60 * 24));
            if (task.status !== 'COMPLETED' && ts >= now && ts <= now + 30 * 24 * 60 * 60 * 1000) {
              upcoming.push({ id: task.id, name: task.name, universityName: p.universityName, deadline: task.deadline, daysUntil });
              if (ts - now <= weekMs) dueThisWeek += 1;
            }
          }
        }
      }
    }
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    return { students: studentIds.size, activeProjects, pending, dueThisWeek, upcoming: upcoming.slice(0, 10) };
  })();

  const cards = [
    { label: t('myStudents'), value: stats?.students ?? '—', icon: Users, tint: 'text-blue-600' },
    { label: t('activeProjects'), value: stats?.activeProjects ?? '—', icon: FolderOpen, tint: 'text-purple-600' },
    { label: t('pendingTasks'), value: stats?.pending ?? '—', icon: CheckSquare, tint: 'text-orange-600' },
    { label: t('dueThisWeek'), value: stats?.dueThisWeek ?? '—', icon: Calendar, tint: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.tint}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('upcomingDeadlines')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noData')}</p>
          ) : stats.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noUpcoming')}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {stats.upcoming.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md border text-xs">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-muted-foreground truncate">{item.universityName}</p>
                  </div>
                  <span className={`shrink-0 ml-2 font-medium ${item.daysUntil <= 3 ? 'text-red-600' : item.daysUntil <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    {item.daysUntil}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
