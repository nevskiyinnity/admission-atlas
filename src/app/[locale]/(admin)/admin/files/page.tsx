'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Star, FileText, Sheet, Image, Film, Music, File as FileIcon } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  fileType: string;
  isFinalVersion: boolean;
  createdAt: string;
  uploader: { id: string; name: string; role: string };
  task?: { id: string; name: string; milestone?: { id: string; name: string; project?: { id: string; universityName: string } } } | null;
  project?: { id: string; universityName: string } | null;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  WORD: <FileText className="h-4 w-4 text-blue-600" />,
  EXCEL: <Sheet className="h-4 w-4 text-green-600" />,
  PDF: <FileText className="h-4 w-4 text-red-600" />,
  IMAGE: <Image className="h-4 w-4 text-purple-600" />,
  VIDEO: <Film className="h-4 w-4 text-orange-600" />,
  AUDIO: <Music className="h-4 w-4 text-pink-600" />,
  OTHER: <FileIcon className="h-4 w-4 text-gray-600" />,
};

export default function AdminFilesPage() {
  const t = useTranslations('admin.files');
  const tf = useTranslations('files');
  const tc = useTranslations('common');

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [finalOnly, setFinalOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('fileType', typeFilter);
    if (finalOnly) params.set('finalOnly', 'true');
    const res = await fetch(`/api/files?${params}`);
    setFiles(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [typeFilter, finalOnly]);

  const deleteFile = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    await fetch(`/api/files/${id}`, { method: 'DELETE' });
    fetchFiles();
  };

  const toggleFinal = async (id: string) => {
    await fetch(`/api/files/${id}/final-version`, { method: 'POST' });
    fetchFiles();
  };

  const filtered = files.filter((f) =>
    !search || f.originalName.toLowerCase().includes(search.toLowerCase()) || f.uploader.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex gap-3 items-center flex-wrap">
        <Input
          placeholder={t('searchFiles')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">{tf('filterByType')}</option>
          <option value="WORD">{tf('types.word')}</option>
          <option value="EXCEL">{tf('types.excel')}</option>
          <option value="PDF">{tf('types.pdf')}</option>
          <option value="IMAGE">{tf('types.image')}</option>
          <option value="VIDEO">{tf('types.video')}</option>
          <option value="AUDIO">{tf('types.audio')}</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={finalOnly} onChange={(e) => setFinalOnly(e.target.checked)} className="rounded" />
          {tf('finalVersion')}
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noFiles')}</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('fileName')}</th>
                <th className="text-left p-3 font-medium">{t('fileType')}</th>
                <th className="text-left p-3 font-medium">{t('uploader')}</th>
                <th className="text-left p-3 font-medium">{t('fileSize')}</th>
                <th className="text-left p-3 font-medium">{t('uploadDate')}</th>
                <th className="text-left p-3 font-medium">{t('isFinal')}</th>
                <th className="text-left p-3 font-medium">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <tr key={file.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {fileTypeIcons[file.fileType] || fileTypeIcons.OTHER}
                      <span className="truncate max-w-[200px]">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="p-3">{file.fileType}</td>
                  <td className="p-3">
                    <span>{file.uploader.name}</span>
                    <span className="text-muted-foreground ml-1 text-xs">({file.uploader.role})</span>
                  </td>
                  <td className="p-3">{formatFileSize(file.size)}</td>
                  <td className="p-3">{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {file.isFinalVersion && <Badge variant="success">{tf('finalVersion')}</Badge>}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <a href={file.path} download>
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => toggleFinal(file.id)}>
                        <Star className={`h-4 w-4 ${file.isFinalVersion ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
