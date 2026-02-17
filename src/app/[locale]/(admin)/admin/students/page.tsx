'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Search, MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  studentId: string | null;
  serviceStatus: string;
  accountStatus: string;
  createdAt: string;
  assignedCounselor: { id: string; name: string } | null;
}

interface Counselor {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const t = useTranslations('admin.students');
  const tc = useTranslations('common');
  const [students, setStudents] = useState<User[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '', password: '',
    dateOfBirth: '', serviceStatus: 'IN_SERVICE', assignedCounselorId: '',
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ role: 'STUDENT', limit: '100' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setStudents(data.users || []);
    setLoading(false);
  }, [search]);

  const fetchCounselors = async () => {
    const res = await fetch('/api/users?role=COUNSELOR&limit=100');
    const data = await res.json();
    setCounselors((data.users || []).map((u: any) => ({ id: u.id, name: u.name })));
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  useEffect(() => { fetchCounselors(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', gender: '', password: '', dateOfBirth: '', serviceStatus: 'IN_SERVICE', assignedCounselorId: '' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender || '',
      password: '',
      dateOfBirth: '',
      serviceStatus: user.serviceStatus,
      assignedCounselorId: user.assignedCounselor?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { ...form, role: 'STUDENT' };
    if (!body.password && editingUser) delete body.password;
    if (!body.gender) delete body.gender;
    if (!body.dateOfBirth) delete body.dateOfBirth;
    if (!body.assignedCounselorId) delete body.assignedCounselorId;

    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowModal(false);
    fetchStudents();
  };

  const toggleLock = async (id: string) => {
    await fetch(`/api/users/${id}/lock`, { method: 'POST' });
    fetchStudents();
  };

  const endService = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceStatus: 'COMPLETED' }),
    });
    fetchStudents();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t('createStudent')}</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={tc('search') + '...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">{t('studentId')}</th>
              <th className="text-left p-3 font-medium">{t('studentName')}</th>
              <th className="text-left p-3 font-medium">{tc('email')}</th>
              <th className="text-left p-3 font-medium">{t('phoneNumber')}</th>
              <th className="text-left p-3 font-medium">{tc('gender')}</th>
              <th className="text-left p-3 font-medium">{t('assignedTeacher')}</th>
              <th className="text-left p-3 font-medium">{t('serviceStatus')}</th>
              <th className="text-left p-3 font-medium">{t('accountStatus')}</th>
              <th className="text-left p-3 font-medium">{t('creationDate')}</th>
              <th className="text-left p-3 font-medium">{tc('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">{tc('loading')}</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">{tc('noData')}</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{s.studentId}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.phone || '-'}</td>
                <td className="p-3">{s.gender ? tc(s.gender.toLowerCase()) : '-'}</td>
                <td className="p-3">{s.assignedCounselor?.name || '-'}</td>
                <td className="p-3">
                  <Badge variant={s.serviceStatus === 'IN_SERVICE' ? 'default' : 'secondary'}>
                    {s.serviceStatus === 'IN_SERVICE' ? t('inService') : t('serviceCompleted')}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={s.accountStatus === 'ACTIVE' ? 'success' : 'destructive'}>
                    {s.accountStatus === 'ACTIVE' ? t('active') : t('locked')}
                  </Badge>
                </td>
                <td className="p-3 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEdit(s)}>{tc('edit')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleLock(s.id)}>
                        {s.accountStatus === 'ACTIVE' ? t('lockAccount') : t('unlockAccount')}
                      </DropdownMenuItem>
                      {s.serviceStatus === 'IN_SERVICE' && (
                        <DropdownMenuItem onClick={() => endService(s.id)}>{t('endService')}</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingUser ? tc('edit') : t('createStudent')}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{tc('name')}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>{tc('email')}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editingUser} />
              </div>
              <div>
                <Label>{tc('phone')}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>{tc('gender')}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">-</option>
                  <option value="MALE">{tc('male')}</option>
                  <option value="FEMALE">{tc('female')}</option>
                  <option value="OTHER">{tc('other')}</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} />
                </div>
              )}
              <div>
                <Label>{t('serviceStatus')}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.serviceStatus} onChange={(e) => setForm({ ...form, serviceStatus: e.target.value })}>
                  <option value="IN_SERVICE">{t('inService')}</option>
                  <option value="COMPLETED">{t('serviceCompleted')}</option>
                </select>
              </div>
              <div>
                <Label>{t('assignedTeacher')}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.assignedCounselorId} onChange={(e) => setForm({ ...form, assignedCounselorId: e.target.value })}>
                  <option value="">-</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{tc('cancel')}</Button>
                <Button type="submit">{tc('confirm')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
