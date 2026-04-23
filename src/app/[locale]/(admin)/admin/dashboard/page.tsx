'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, FolderOpen, CheckSquare, Calendar, Star } from 'lucide-react';

interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  milestone: { project: { universityName: string } };
}

interface ServiceSatisfaction {
  average: number;
  count: number;
  distribution: number[];
}

interface Stats {
  totalStudents: number;
  totalCounselors: number;
  activeProjects: number;
  pendingTasks: number;
  avgDeadlineAdherenceRate: number | null;
  avgTop3AcceptanceRate: number | null;
  serviceSatisfaction: ServiceSatisfaction | null;
  upcomingDeadlines: DeadlineItem[];
}

function Donut({ value, label }: { value: number | null; label: string }) {
  const pct = value ?? 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{value === null ? '—' : `${pct}%`}</span>
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground max-w-[18rem]">{label}</p>
    </div>
  );
}

function SatisfactionPanel({ data, label }: { data: ServiceSatisfaction | null; label: string }) {
  const avg = data?.average ?? 0;
  const count = data?.count ?? 0;
  const distribution = data?.distribution ?? [0, 0, 0, 0, 0];
  const maxBar = Math.max(1, ...distribution);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-5 w-5"
                fill={i <= Math.round(avg) ? '#7c3aed' : 'none'}
                stroke="#7c3aed"
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-3xl font-bold mt-1">{data ? avg.toFixed(1) : '—'}</p>
          <p className="text-xs text-muted-foreground">Avg. Rating</p>
          <p className="text-xs text-muted-foreground mt-0.5">{count} Ratings</p>
        </div>
        <div className="flex flex-col gap-1 min-w-[10rem]">
          {[5, 4, 3, 2, 1].map((stars) => {
            const n = distribution[stars - 1] ?? 0;
            const width = (n / maxBar) * 100;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-muted-foreground">{stars}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${width}%` }} />
                </div>
                <span className="w-4 text-right text-muted-foreground">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground max-w-[22rem]">{label}</p>
    </div>
  );
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

  const summaryCards = [
    { label: t('totalStudents'), value: stats?.totalStudents ?? '-', icon: GraduationCap, color: 'text-blue-600' },
    { label: t('totalCounselors'), value: stats?.totalCounselors ?? '-', icon: Users, color: 'text-green-600' },
    { label: t('activeProjects'), value: stats?.activeProjects ?? '-', icon: FolderOpen, color: 'text-purple-600' },
    { label: t('pendingTasks'), value: stats?.pendingTasks ?? '-', icon: CheckSquare, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-8 md:grid-cols-3">
            <Donut value={stats?.avgDeadlineAdherenceRate ?? null} label={t('deadlineAdherence')} />
            <SatisfactionPanel data={stats?.serviceSatisfaction ?? null} label={t('serviceSatisfaction')} />
            <Donut value={stats?.avgTop3AcceptanceRate ?? null} label={t('top3Acceptance')} />
          </div>
        </CardContent>
      </Card>

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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto">
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
  );
}
