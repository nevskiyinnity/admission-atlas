'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';

interface Tag { id: string; name: string; }

export default function TagsPage() {
  const t = useTranslations('admin.tags');
  const tc = useTranslations('common');
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/tags?${params}`);
    setTags(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTags(), 300);
    return () => clearTimeout(timer);
  }, [fetchTags]);

  const addTag = async () => {
    if (!newTag.trim()) return;
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    setNewTag('');
    fetchTags();
  };

  const deleteTag = async (id: string) => {
    await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
    fetchTags();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchTags')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Input placeholder={t('tagName')} value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} className="w-48" />
          <Button onClick={addTag}><Plus className="h-4 w-4 mr-2" />{t('addTag')}</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{tc('loading')}</p>
      ) : tags.length === 0 ? (
        <p className="text-muted-foreground">{tc('noData')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-sm px-3 py-1.5 gap-2">
              {tag.name}
              <button onClick={() => deleteTag(tag.id)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
