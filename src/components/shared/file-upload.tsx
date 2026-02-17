'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  uploaderId: string;
  taskId?: string;
  projectId?: string;
  milestoneId?: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ uploaderId, taskId, projectId, milestoneId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((f) => f.filter((_, i) => i !== index));
  };

  const upload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaderId', uploaderId);
      if (taskId) formData.append('taskId', taskId);
      if (projectId) formData.append('projectId', projectId);
      if (milestoneId) formData.append('milestoneId', milestoneId);

      await fetch('/api/files/upload', { method: 'POST', body: formData });
    }

    setSelectedFiles([]);
    setUploading(false);
    onUploadComplete?.();
  };

  return (
    <div className="space-y-2">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
              <span className="truncate max-w-[100px]">{file.name}</span>
              <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              <button onClick={() => removeFile(i)}><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleSelect} />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip className="h-3 w-3 mr-1" />Attach
        </Button>
        {selectedFiles.length > 0 && (
          <Button type="button" size="sm" onClick={upload} disabled={uploading}>
            {uploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
          </Button>
        )}
      </div>
    </div>
  );
}
