'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { useDbUser } from '@/hooks/use-db-user';

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
  const dbUser = useDbUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbUser?.id) return;
    fetch(`/api/projects?studentId=${dbUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
        return res.json();
      })
      .then((data) => { setProjects(data.projects ?? []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [dbUser?.id]);

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const allTasks = project.milestones.flatMap((m) => m.tasks);
            const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;
            const urgentTask = allTasks
              .filter((t) => t.status !== 'COMPLETED')
              .sort((a, b) => (a.deadline || '9').localeCompare(b.deadline || '9'))[0];

            return (
              <Link key={project.id} href={`/student/projects/${project.id}` as any}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{project.universityName}</CardTitle>
                      <div className="relative shrink-0">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.major}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {urgentTask && (
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowRight className="h-3 w-3 text-orange-500" />
                        <span className="truncate">{urgentTask.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                        {project.status || 'ACTIVE'}
                      </Badge>
                      {allTasks.length > 0 && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                          {completedTasks} / {allTasks.length}
                        </span>
                      )}
                    </div>
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
