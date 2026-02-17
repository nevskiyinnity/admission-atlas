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

interface Tag { id: string; name: string; }

interface Teacher {
  id: string; name: string; email: string; phone: string | null;
  gender: string | null; counselorId: string | null; title: string | null;
  country: string | null; city: string | null; accountStatus: string;
  createdAt: string; tags: Tag[]; students: { id: string }[];
}

export default function TeachersPage() {
  const t = useTranslations('admin.teachers');
  const ts = useTranslations('admin.students');
  const tc = useTranslations('common');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', password: '', title: '', country: '', city: '', dateOfBirth: '', tagIds: [] as string[] });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ role: 'COUNSELOR', limit: '100' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setTeachers(data.users || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { const timer = setTimeout(() => fetchTeachers(), 300); return () => clearTimeout(timer); }, [fetchTeachers]);
  useEffect(() => { fetch('/api/tags').then(r => r.json()).then(setAllTags); }, []);

  const openCreate = () => { setEditingUser(null); setForm({ name: '', email: '', phone: '', gender: '', password: '', title: '', country: '', city: '', dateOfBirth: '', tagIds: [] }); setShowModal(true); };
  const openEdit = (teacher: Teacher) => { setEditingUser(teacher); setForm({ name: teacher.name, email: teacher.email, phone: teacher.phone || '', gender: teacher.gender || '', password: '', title: teacher.title || '', country: teacher.country || '', city: teacher.city || '', dateOfBirth: '', tagIds: teacher.tags.map(t => t.id) }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { ...form, role: 'COUNSELOR' };
    if (!body.password && editingUser) delete body.password;
    if (!body.gender) delete body.gender;
    if (!body.dateOfBirth) delete body.dateOfBirth;
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    await fetch(url, { method: editingUser ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowModal(false); fetchTeachers();
  };

  const toggleLock = async (id: string) => { await fetch(`/api/users/${id}/lock`, { method: 'POST' }); fetchTeachers(); };
  const toggleTag = (tagId: string) => setForm(f => ({ ...f, tagIds: f.tagIds.includes(tagId) ? f.tagIds.filter(id => id !== tagId) : [...f.tagIds, tagId] }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t('createTeacher')}</Button>
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={tc('search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">{t('teacherId')}</th>
            <th className="text-left p-3 font-medium">{t('teacherName')}</th>
            <th className="text-left p-3 font-medium">{tc('email')}</th>
            <th className="text-left p-3 font-medium">{tc('phone')}</th>
            <th className="text-left p-3 font-medium">{t('title_field')}</th>
            <th className="text-left p-3 font-medium">{t('country')}</th>
            <th className="text-left p-3 font-medium">{t('city')}</th>
            <th className="text-left p-3 font-medium">{t('tags')}</th>
            <th className="text-left p-3 font-medium">{t('studentsAssigned')}</th>
            <th className="text-left p-3 font-medium">{ts('accountStatus')}</th>
            <th className="text-left p-3 font-medium">{tc('actions')}</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">{tc('loading')}</td></tr>
            : teachers.length === 0 ? <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">{tc('noData')}</td></tr>
            : teachers.map(item => (
              <tr key={item.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{item.counselorId}</td>
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.email}</td>
                <td className="p-3">{item.phone || '-'}</td>
                <td className="p-3">{item.title || '-'}</td>
                <td className="p-3">{item.country || '-'}</td>
                <td className="p-3">{item.city || '-'}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{item.tags.map(tag => <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>)}</div></td>
                <td className="p-3 text-center">{item.students?.length ?? 0}</td>
                <td className="p-3"><Badge variant={item.accountStatus === 'ACTIVE' ? 'success' : 'destructive'}>{item.accountStatus === 'ACTIVE' ? ts('active') : ts('locked')}</Badge></td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEdit(item)}>{tc('edit')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleLock(item.id)}>{item.accountStatus === 'ACTIVE' ? ts('lockAccount') : ts('unlockAccount')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingUser ? tc('edit') : t('createTeacher')}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>{tc('name')}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>{tc('email')}</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={!!editingUser} /></div>
              <div><Label>{tc('phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{tc('gender')}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">-</option><option value="MALE">{tc('male')}</option><option value="FEMALE">{tc('female')}</option>
                </select>
              </div>
              {!editingUser && <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>}
              <div><Label>{t('title_field')}</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{t('country')}</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                <div><Label>{t('city')}</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div><Label>{t('tags')}</Label>
                <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {allTags.map(tag => (<label key={tag.id} className="flex items-center gap-1 text-sm cursor-pointer"><input type="checkbox" checked={form.tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} className="rounded" />{tag.name}</label>))}
                </div>
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
