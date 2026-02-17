'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, X, Calendar, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  universityName: string;
  major: string;
  country: string | null;
  deadline: string | null;
  status: string;
  milestones: { id: string; name: string; status: string; tasks: { id: string; status: string; deadline: string | null; name: string }[] }[];
}

interface StudentInfo {
  id: string;
  name: string;
  studentId: string | null;
  gender: string | null;
  avatar: string | null;
  serviceStatus: string;
}

export default function StudentDetailPage() {
  const t = useTranslations('counselor.project');
  const tc = useTranslations('common');
  const { data: session } = useSession();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ universityName: '', major: '', country: '', deadline: '' });

  const fetchData = async () => {
    setLoading(true);
    const [userRes, projRes] = await Promise.all([
      fetch(`/api/users/${studentId}`),
      fetch(`/api/projects?studentId=${studentId}`),
    ]);
    setStudent(await userRes.json());
    setProjects(await projRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [studentId]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        studentId,
        counselorId: session?.user?.id,
      }),
    });
    setShowCreateModal(false);
    setForm({ universityName: '', major: '', country: '', deadline: '' });
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  const initials = student?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '';

  return (
    <div>
      {/* Student profile header */}
      {student && (
        <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg bg-card">
          <Avatar className="h-16 w-16">
            {student.avatar && <AvatarImage src={student.avatar} />}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.studentId} &bull; {student.gender}</p>
            <Badge variant={student.serviceStatus === 'IN_SERVICE' ? 'default' : 'secondary'} className="mt-1">
              {student.serviceStatus === 'IN_SERVICE' ? 'In Service' : 'Completed'}
            </Badge>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Applications</h2>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" />{t('createProject')}</Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const urgentTask = project.milestones
              .flatMap((m) => m.tasks)
              .filter((t) => t.status !== 'COMPLETED')
              .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))[0];

            return (
              <Link key={project.id} href={`/counselor/students/${studentId}/projects/${project.id}` as any}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.universityName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.major}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    )}
                    {urgentTask && (
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowRight className="h-3 w-3 text-orange-500" />
                        <span className="truncate">{urgentTask.name}</span>
                      </div>
                    )}
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('createProject')}</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div><Label>{t('universityName')}</Label><Input value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })} required /></div>
              <div><Label>{t('major')}</Label><Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} required /></div>
              <div><Label>{t('countryCity')}</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div><Label>{t('deadline')}</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>{tc('cancel')}</Button>
                <Button type="submit">{t('confirmCreate')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
