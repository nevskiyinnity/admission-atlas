'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Circle, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileHistoryPanel } from '@/components/shared/file-history-panel';
import { FileUpload } from '@/components/shared/file-upload';

interface Task {
  id: string; name: string; description: string | null; deadline: string | null;
  status: string; assignedTo: string;
}

interface Milestone {
  id: string; name: string; status: string; order: number; tasks: Task[];
}

interface Project {
  id: string; universityName: string; major: string; deadline: string | null;
  milestones: Milestone[];
}

interface Message {
  id: string; content: string; createdAt: string;
  sender: { id: string; name: string; role: string };
}

export default function StudentProjectPage() {
  const t = useTranslations('student.task');
  const tc = useTranslations('common');
  const { userId } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        if (data.milestones?.length > 0) {
          setSelectedMilestone(data.milestones[0].id);
          if (data.milestones[0].tasks?.length > 0) setSelectedTask(data.milestones[0].tasks[0].id);
        }
        setLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    if (selectedTask) {
      fetch(`/api/messages?taskId=${selectedTask}`)
        .then((res) => res.json())
        .then(setMessages);
    }
  }, [selectedTask]);

  const currentMilestone = project?.milestones.find((m) => m.id === selectedMilestone);
  const currentTask = currentMilestone?.tasks.find((t) => t.id === selectedTask);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTask || !userId) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage.trim(), senderId: userId, taskId: selectedTask }),
    });
    setNewMessage('');
    const res = await fetch(`/api/messages?taskId=${selectedTask}`);
    setMessages(await res.json());
  };

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;
  if (!project) return <p className="text-muted-foreground">Not found</p>;

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'IN_PROGRESS') return <Clock className="h-4 w-4 text-orange-500" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Left Panel */}
      <div className="w-64 shrink-0 border rounded-lg flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">{project.universityName}</h3>
          <p className="text-xs text-muted-foreground">{project.major}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.milestones.map((milestone) => (
            <button
              key={milestone.id}
              className={cn('w-full text-left p-2 rounded-md text-sm flex items-center gap-2', selectedMilestone === milestone.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}
              onClick={() => {
                setSelectedMilestone(milestone.id);
                if (milestone.tasks.length > 0) setSelectedTask(milestone.tasks[0].id);
                else setSelectedTask(null);
              }}
            >
              {statusIcon(milestone.status)}
              <span className="truncate">{milestone.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 border rounded-lg flex flex-col min-w-0">
        {currentTask ? (
          <>
            {currentMilestone && (
              <div className="flex gap-1 p-2 border-b overflow-x-auto">
                {currentMilestone.tasks.map((task) => (
                  <button key={task.id} className={cn('px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap', selectedTask === task.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => setSelectedTask(task.id)}>
                    {statusIcon(task.status)}<span className="ml-1">{task.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{currentTask.name}</h3>
                <Badge variant={currentTask.status === 'COMPLETED' ? 'success' : 'secondary'}>{currentTask.status}</Badge>
              </div>
              {currentTask.description && <p className="text-sm text-muted-foreground mt-2">{currentTask.description}</p>}
              {currentTask.deadline && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(currentTask.deadline).toLocaleDateString()}</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.id === userId;
                const initials = msg.sender.name.split(' ').map((n) => n[0]).join('').toUpperCase();
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                    <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                    <div className={cn('max-w-[70%]', isMe && 'text-right')}>
                      <p className="text-xs text-muted-foreground">{msg.sender.name}</p>
                      <div className={cn('mt-1 p-2 rounded-lg text-sm', isMe ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{msg.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t space-y-2">
              {userId && selectedTask && (
                <FileUpload
                  uploaderId={userId}
                  taskId={selectedTask}
                  projectId={projectId}
                  milestoneId={selectedMilestone || undefined}
                />
              )}
              <div className="flex gap-2">
                <Input placeholder={t('sendMessage')} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a milestone</div>
        )}
      </div>

      {/* Right Panel - File History */}
      <div className="w-64 shrink-0 border rounded-lg flex flex-col">
        <FileHistoryPanel
          taskId={selectedTask || undefined}
          projectId={projectId}
          canSetFinal={false}
          milestones={project?.milestones.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>
    </div>
  );
}
