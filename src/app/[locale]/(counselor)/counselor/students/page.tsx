'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  gender: string | null;
  studentId: string | null;
  avatar: string | null;
  serviceStatus: string;
}

export default function CounselorStudentsPage() {
  const t = useTranslations('counselor.students');
  const tc = useTranslations('common');
  const { userId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ role: 'STUDENT', limit: '100' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      // Filter to only students assigned to this counselor
      const myStudents = (data.users || []).filter(
        (u: any) => u.assignedCounselorId === userId
      );
      setStudents(myStudents);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [userId, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">{tc('loading')}</p>
      ) : students.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {students.map((student) => {
            const initials = student.name.split(' ').map((n) => n[0]).join('').toUpperCase();
            return (
              <Link key={student.id} href={`/counselor/students/${student.id}` as any}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        {student.avatar && <AvatarImage src={student.avatar} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{student.name}</h3>
                          <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        <p className="text-xs text-muted-foreground capitalize">{student.gender?.toLowerCase()}</p>
                        <Badge
                          variant={student.serviceStatus === 'IN_SERVICE' ? 'default' : 'secondary'}
                          className="mt-2 text-xs"
                        >
                          {student.serviceStatus === 'IN_SERVICE' ? t('inService') : t('completed')}
                        </Badge>
                      </div>
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
