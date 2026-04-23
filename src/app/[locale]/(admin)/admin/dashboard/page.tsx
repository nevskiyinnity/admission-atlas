'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, FolderOpen, CheckSquare, Calendar, Clock } from 'lucide-react';

interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  milestone: { project: { universityName: string } };
}

interface Stats {
  totalStudents: number;
  totalCounselors: number;
  activeProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalTasks: number;
  upcomingDeadlines: DeadlineItem[];
}

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setStats)
      .catch(() => {});
  }, []);

  const totalProjects = (stats?.activeProjects ?? 0) + (stats?.completedProjects ?? 0) + (stats?.cancelledProjects ?? 0);
  const taskCompletionRate = stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const summaryCards = [
    { label: t('totalStudents'), value: stats?.totalStudents ?? '-', icon: GraduationCap, color: 'text-blue-600' },
    { label: t('totalCounselors'), value: stats?.totalCounselors ?? '-', icon: Users, color: 'text-green-600' },
    { label: t('activeProjects'), value: stats?.activeProjects ?? '-', icon: FolderOpen, color: 'text-purple-600' },
    { label: t('pendingTasks'), value: stats?.pendingTasks ?? '-', icon: CheckSquare, color: 'text-orange-600' },
    { label: t('totalTasks'), value: stats?.totalTasks ?? '-', icon: Clock, color: 'text-slate-600' },
  ];

  // Pie chart data for project status
  const projectSlices = stats ? [
    { label: 'Active', value: stats.activeProjects, color: '#3b82f6' },
    { label: 'Completed', value: stats.completedProjects, color: '#22c55e' },
    { label: 'Cancelled', value: stats.cancelledProjects, color: '#94a3b8' },
  ].filter((s) => s.value > 0) : [];

  const buildPieSlices = () => {
    if (totalProjects === 0) return null;
    let cumulative = 0;
    return projectSlices.map((slice) => {
      const pct = (slice.value / totalProjects) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...slice, start, pct };
    });
  };
  const pieSlices = buildPieSlices();

  const conicGradient = pieSlices
    ? pieSlices.map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ')
    : '#e2e8f0 0% 100%';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Project Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('projectStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              className="w-40 h-40 rounded-full"
              style={{ background: `conic-gradient(${conicGradient})` }}
            />
            <div className="flex flex-wrap gap-3 justify-center">
              {projectSlices.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  {s.label} ({s.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('taskCompletion')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={taskCompletionRate >= 70 ? '#22c55e' : taskCompletionRate >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${taskCompletionRate} ${100 - taskCompletionRate}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{taskCompletionRate}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center w-full text-xs">
              <div>
                <p className="font-semibold text-green-600">{stats?.completedTasks ?? 0}</p>
                <p className="text-muted-foreground">Done</p>
              </div>
              <div>
                <p className="font-semibold text-blue-600">{stats?.inProgressTasks ?? 0}</p>
                <p className="text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="font-semibold text-orange-600">{stats?.pendingTasks ?? 0}</p>
                <p className="text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('upcomingDeadlines')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!stats?.upcomingDeadlines || stats.upcomingDeadlines.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.upcomingDeadlines.map((item) => {
                  const daysUntil = Math.ceil((new Date(item.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md border text-xs">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground truncate">{item.milestone.project.universityName}</p>
                      </div>
                      <span className={`shrink-0 ml-2 font-medium ${daysUntil <= 3 ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {daysUntil}d
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
