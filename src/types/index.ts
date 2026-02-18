// Shared domain types used across page components and API routes.
// Each type is the superset of all page-specific variations. Use Pick<>
// or Partial<> at the call-site to narrow when needed.

export interface Task {
    id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    status: string;
    assignedTo: string;
    createdAt?: string;
}

export interface Milestone {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    order: number;
    tasks: Task[];
}

export interface Project {
    id: string;
    universityName: string;
    major: string;
    deadline: string | null;
    status?: string;
    country?: string | null;
    student?: { id: string; name: string };
    counselor?: { id: string; name: string };
    milestones?: Milestone[];
}

export interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
        avatar?: string | null;
    };
}
