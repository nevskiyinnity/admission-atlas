'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  universityName: string;
  major: string;
  deadline: string | null;
  status: string;
  milestones: { tasks: { id: string; status: string; deadline: string | null; name: string }[] }[];
}

export default function StudentDashboardPage() {
  const t = useTranslations('student.dashboard');
  const tc = useTranslations('common');
  const { userId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/projects?studentId=${userId}`)
      .then((res) => res.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, [userId]);

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const allTasks = project.milestones.flatMap((m) => m.tasks);
            const urgentTask = allTasks
              .filter((t) => t.status !== 'COMPLETED')
              .sort((a, b) => (a.deadline || '9').localeCompare(b.deadline || '9'))[0];
            const unreadCount = 0; // placeholder for Phase 7

            return (
              <Link key={project.id} href={`/student/projects/${project.id}` as any}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer relative">
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.universityName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.major}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{t('deadline')}: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {urgentTask && (
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowRight className="h-3 w-3 text-orange-500" />
                        <span className="truncate">{t('urgentTask')}: {urgentTask.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
