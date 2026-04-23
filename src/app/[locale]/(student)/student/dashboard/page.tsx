import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, MessageCircle } from 'lucide-react';

export default async function StudentDashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/login');

  const [t, tc, user] = await Promise.all([
    getTranslations('student.dashboard'),
    getTranslations('common'),
    prisma.user.findUnique({ where: { clerkId }, select: { id: true } }),
  ]);

  if (!user) {
    return <p className="text-destructive">User not found in database</p>;
  }

  const projects = await prisma.project.findMany({
    where: { studentId: user.id },
    include: {
      milestones: {
        include: {
          tasks: { select: { id: true, status: true, deadline: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const allTasks = project.milestones.flatMap((m) => m.tasks);
            const completedTasks = allTasks.filter((task) => task.status === 'COMPLETED').length;
            const FAR_FUTURE = 8640000000000000;
            const urgentTask = allTasks
              .filter((task) => task.status !== 'COMPLETED')
              .sort((a, b) => (a.deadline?.getTime() ?? FAR_FUTURE) - (b.deadline?.getTime() ?? FAR_FUTURE))[0];

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
                        <span>{project.deadline.toLocaleDateString()}</span>
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
