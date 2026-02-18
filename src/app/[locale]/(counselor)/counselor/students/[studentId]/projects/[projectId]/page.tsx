'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, X, CheckCircle, Circle, Clock, Send, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileHistoryPanel } from '@/components/shared/file-history-panel';
import { FileUpload } from '@/components/shared/file-upload';

interface Task {
  id: string; name: string; description: string | null; deadline: string | null;
  status: string; assignedTo: string; createdAt: string;
}

interface Milestone {
  id: string; name: string; description: string | null; status: string; order: number;
  tasks: Task[];
}

interface Project {
  id: string; universityName: string; major: string; deadline: string | null;
  student: { id: string; name: string };
  milestones: Milestone[];
}

interface Message {
  id: string; content: string; createdAt: string;
  sender: { id: string; name: string; role: string; avatar: string | null };
}

export default function ProjectTaskPage() {
  const t = useTranslations('counselor.task');
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

  // Modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ name: '', description: '', deadline: '' });

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    setProject(data);
    if (data.milestones?.length > 0 && !selectedMilestone) {
      setSelectedMilestone(data.milestones[0].id);
      if (data.milestones[0].tasks?.length > 0) {
        setSelectedTask(data.milestones[0].tasks[0].id);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async (taskId: string) => {
    const res = await fetch(`/api/messages?taskId=${taskId}`);
    setMessages(await res.json());
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  useEffect(() => {
    if (selectedTask) fetchMessages(selectedTask);
  }, [selectedTask]);

  const currentMilestone = project?.milestones.find((m) => m.id === selectedMilestone);
  const currentTask = currentMilestone?.tasks.find((t) => t.id === selectedTask);

  const createMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...milestoneForm, projectId }),
    });
    setShowMilestoneModal(false);
    setMilestoneForm({ name: '', description: '' });
    fetchProject();
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskForm, milestoneId: selectedMilestone }),
    });
    setShowTaskModal(false);
    setTaskForm({ name: '', description: '', deadline: '' });
    fetchProject();
  };

  const completeTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
    fetchProject();
  };

  const reassignTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}/reassign`, { method: 'POST' });
    fetchProject();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTask || !userId) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage.trim(), senderId: userId, taskId: selectedTask }),
    });
    setNewMessage('');
    fetchMessages(selectedTask);
  };

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;
  if (!project) return <p className="text-muted-foreground">Project not found</p>;

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'IN_PROGRESS') return <Clock className="h-4 w-4 text-orange-500" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Left Panel - Milestones */}
      <div className="w-64 shrink-0 border rounded-lg flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">{project.universityName}</h3>
          <p className="text-xs text-muted-foreground">{project.major}</p>
          {project.deadline && <p className="text-xs text-muted-foreground mt-1">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.milestones.map((milestone) => (
            <button
              key={milestone.id}
              className={cn(
                'w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors',
                selectedMilestone === milestone.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
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
        <div className="p-2 border-t space-y-1">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowMilestoneModal(true)}>
            <Plus className="h-3 w-3 mr-1" />Add Milestone
          </Button>
          {selectedMilestone && (
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowTaskModal(true)}>
              <Plus className="h-3 w-3 mr-1" />{t('createTask')}
            </Button>
          )}
        </div>
      </div>

      {/* Center Panel - Task detail + messages */}
      <div className="flex-1 border rounded-lg flex flex-col min-w-0">
        {currentTask ? (
          <>
            {/* Task tabs */}
            {currentMilestone && (
              <div className="flex gap-1 p-2 border-b overflow-x-auto">
                {currentMilestone.tasks.map((task) => (
                  <button
                    key={task.id}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                      selectedTask === task.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    {statusIcon(task.status)}
                    <span className="ml-1">{task.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Task info */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{currentTask.name}</h3>
                <div className="flex gap-2">
                  <Badge variant={currentTask.status === 'COMPLETED' ? 'success' : 'secondary'}>{currentTask.status}</Badge>
                  <Badge variant="outline">{currentTask.assignedTo}</Badge>
                </div>
              </div>
              {currentTask.description && <p className="text-sm text-muted-foreground mt-2">{currentTask.description}</p>}
              {currentTask.deadline && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(currentTask.deadline).toLocaleDateString()}</p>}
              <div className="flex gap-2 mt-3">
                {currentTask.status !== 'COMPLETED' && (
                  <Button size="sm" variant="outline" onClick={() => completeTask(currentTask.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />{t('completeTask')}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => reassignTask(currentTask.id)}>
                  <ArrowLeftRight className="h-3 w-3 mr-1" />{t('reassign')}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.id === userId;
                const initials = msg.sender.name.split(' ').map((n) => n[0]).join('').toUpperCase();
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className={cn('max-w-[70%]', isMe && 'text-right')}>
                      <p className="text-xs text-muted-foreground">{msg.sender.name} &bull; {new Date(msg.createdAt).toLocaleTimeString()}</p>
                      <div className={cn('mt-1 p-2 rounded-lg text-sm', isMe ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* File upload + Message input */}
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
                <Input
                  placeholder="Send a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {selectedMilestone ? 'No tasks yet. Create one!' : 'Select a milestone'}
          </div>
        )}
      </div>

      {/* Right Panel - File History */}
      <div className="w-64 shrink-0 border rounded-lg flex flex-col">
        <FileHistoryPanel
          taskId={selectedTask || undefined}
          projectId={projectId}
          canSetFinal={true}
          onSetFinal={async (fileId) => {
            await fetch(`/api/files/${fileId}/final-version`, { method: 'POST' });
          }}
          milestones={project?.milestones.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>

      {/* Create Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMilestoneModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Milestone</h2>
              <button onClick={() => setShowMilestoneModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={createMilestone} className="space-y-4">
              <div><Label>Name</Label><Input value={milestoneForm.name} onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })} required /></div>
              <div><Label>Description</Label><Input value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMilestoneModal(false)}>{tc('cancel')}</Button>
                <Button type="submit">{tc('confirm')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTaskModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('createTask')}</h2>
              <button onClick={() => setShowTaskModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={createTask} className="space-y-4">
              <div><Label>{t('taskName')}</Label><Input value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} required /></div>
              <div><Label>{t('taskDescription')}</Label><Input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
              <div><Label>{t('taskDeadline')}</Label><Input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>{tc('cancel')}</Button>
                <Button type="submit">{tc('confirm')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
