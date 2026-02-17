'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, FolderOpen, CheckSquare } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalCounselors: number;
  activeProjects: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then(setStats);
  }, []);

  const cards = [
    { label: t('totalStudents'), value: stats?.totalStudents ?? '-', icon: GraduationCap, color: 'text-blue-600' },
    { label: t('totalCounselors'), value: stats?.totalCounselors ?? '-', icon: Users, color: 'text-green-600' },
    { label: t('activeProjects'), value: stats?.activeProjects ?? '-', icon: FolderOpen, color: 'text-purple-600' },
    { label: t('pendingTasks'), value: stats?.pendingTasks ?? '-', icon: CheckSquare, color: 'text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
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
    </div>
  );
}
