'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/lib/utils';
import { Download, Star, FileText, Image, Film, Music, File as FileIcon, Sheet } from 'lucide-react';

interface FileRecord {
  id: string; filename: string; originalName: string; path: string;
  size: number; fileType: string; isFinalVersion: boolean; createdAt: string;
  uploader: { id: string; name: string; role: string };
}

interface FileHistoryPanelProps {
  taskId?: string;
  projectId?: string;
  showFinalToggle?: boolean;
  canSetFinal?: boolean;
  onSetFinal?: (fileId: string) => void;
  milestones?: { id: string; name: string }[];
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

export function FileHistoryPanel({ taskId, projectId, showFinalToggle = true, canSetFinal = false, onSetFinal, milestones }: FileHistoryPanelProps) {
  const t = useTranslations('files');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [senderFilter, setSenderFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState('');
  const [finalOnly, setFinalOnly] = useState(false);

  const fetchFiles = async () => {
    const params = new URLSearchParams();
    if (taskId) params.set('taskId', taskId);
    if (projectId) params.set('projectId', projectId);
    if (senderFilter) params.set('uploaderId', senderFilter);
    if (typeFilter) params.set('fileType', typeFilter);
    if (milestoneFilter) params.set('milestoneId', milestoneFilter);
    if (finalOnly) params.set('finalOnly', 'true');

    const res = await fetch(`/api/files?${params}`);
    setFiles(await res.json());
  };

  useEffect(() => { fetchFiles(); }, [taskId, projectId, senderFilter, typeFilter, milestoneFilter, finalOnly]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm mb-2">{t('filterBySender')}</h3>
        <div className="space-y-2">
          <select className="w-full text-xs border rounded px-2 py-1" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">{t('filterByType')}</option>
            <option value="WORD">{t('types.word')}</option>
            <option value="EXCEL">{t('types.excel')}</option>
            <option value="PDF">{t('types.pdf')}</option>
            <option value="IMAGE">{t('types.image')}</option>
            <option value="VIDEO">{t('types.video')}</option>
            <option value="AUDIO">{t('types.audio')}</option>
          </select>
          {milestones && milestones.length > 0 && (
            <select className="w-full text-xs border rounded px-2 py-1" value={milestoneFilter} onChange={(e) => setMilestoneFilter(e.target.value)}>
              <option value="">{t('filterByMilestone')}</option>
              {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          {showFinalToggle && (
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={finalOnly} onChange={(e) => setFinalOnly(e.target.checked)} className="rounded" />
              {t('finalVersion')}
            </label>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {files.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No files</p>
        ) : files.map((file) => (
          <div key={file.id} className="p-2 border rounded text-xs space-y-1">
            <div className="flex items-center gap-2">
              {fileTypeIcons[file.fileType] || fileTypeIcons.OTHER}
              <span className="truncate font-medium">{file.originalName}</span>
              {file.isFinalVersion && <Badge variant="success" className="text-[10px] px-1">{t('finalVersion')}</Badge>}
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{file.uploader.name}</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-1">
                <a href={file.path} download className="hover:text-foreground"><Download className="h-3 w-3" /></a>
                {canSetFinal && onSetFinal && (
                  <button onClick={() => onSetFinal(file.id)} className="hover:text-yellow-500"><Star className="h-3 w-3" /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
