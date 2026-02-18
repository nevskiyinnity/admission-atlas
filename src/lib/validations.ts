import { z } from "zod";

// ── Enum values (matching Prisma enums) ─────────────────

const Role = z.enum(["STUDENT", "COUNSELOR", "ADMIN"]);
const Gender = z.enum(["MALE", "FEMALE", "OTHER"]);
const ServiceStatus = z.enum(["IN_SERVICE", "COMPLETED"]);
const AccountStatus = z.enum(["ACTIVE", "LOCKED"]);
const ProjectStatus = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
const TaskAssignee = z.enum(["STUDENT", "COUNSELOR"]);
const AnnouncementTarget = z.enum(["ALL", "STUDENTS", "COUNSELORS", "ADMINS"]);
const NotificationType = z.enum([
    "ANNOUNCEMENT",
    "MESSAGE",
    "TASK",
    "FILE",
    "FEEDBACK",
    "SYSTEM",
]);

// ── Users ───────────────────────────────────────────────

export const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: Role,
});

export const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
    phone: z.string().optional().nullable(),
    gender: Gender.optional().nullable(),
    avatar: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    serviceStatus: ServiceStatus.optional(),
    role: Role.optional(),
    accountStatus: AccountStatus.optional(),
    password: z.string().min(6).optional(),
    dateOfBirth: z.string().optional().nullable(),
    assignedCounselorId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).optional(),
});

export const updateSettingsSchema = z.object({
    webNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
});

export const assignCounselorSchema = z.object({
    counselorId: z.string().min(1),
});

// ── Projects ────────────────────────────────────────────

export const createProjectSchema = z.object({
    universityName: z.string().min(1),
    major: z.string().min(1),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    studentId: z.string().min(1),
    counselorId: z.string().min(1),
});

export const updateProjectSchema = z.object({
    universityName: z.string().min(1).optional(),
    major: z.string().min(1).optional(),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    status: ProjectStatus.optional(),
    notes: z.string().optional().nullable(),
});

// ── Milestones ──────────────────────────────────────────

export const createMilestoneSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    projectId: z.string().min(1),
});

// ── Tasks ───────────────────────────────────────────────

export const createTaskSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    milestoneId: z.string().min(1),
});

export const updateTaskSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    assignedTo: TaskAssignee.optional(),
});

// ── Messages ────────────────────────────────────────────

export const createMessageSchema = z.object({
    content: z.string().min(1),
    senderId: z.string().min(1),
    taskId: z.string().min(1),
});

// ── Announcements ───────────────────────────────────────

export const createAnnouncementSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    target: AnnouncementTarget.optional(),
});

export const updateAnnouncementSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    target: AnnouncementTarget.optional(),
});

// ── FAQ ─────────────────────────────────────────────────

export const createFaqSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().min(1),
    order: z.number().int().optional(),
});

export const updateFaqSchema = z.object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    order: z.number().int().optional(),
});

// ── Feedback ────────────────────────────────────────────

export const createFeedbackSchema = z.object({
    type: z.string().min(1),
    description: z.string().min(1),
    userId: z.string().min(1),
});

export const feedbackReplySchema = z.object({
    content: z.string().min(1),
    userId: z.string().min(1),
});

// ── Notifications ───────────────────────────────────────

export const createNotificationSchema = z.object({
    type: NotificationType,
    title: z.string().min(1),
    content: z.string().min(1),
    userId: z.string().min(1),
    link: z.string().optional().nullable(),
});

export const markAllReadSchema = z.object({
    userId: z.string().min(1),
});

// ── Tags ────────────────────────────────────────────────

export const createTagSchema = z.object({
    name: z.string().min(1),
});

// ── Feedback Types ──────────────────────────────────────

export const createFeedbackTypeSchema = z.object({
    name: z.string().min(1),
});

// ── Helper ──────────────────────────────────────────────

/** Parse body with a Zod schema. Returns { data } on success or { error } on failure. */
export function parseBody<T>(
    schema: z.ZodType<T>,
    body: unknown,
): { data: T; error?: never } | { data?: never; error: string } {
    const result = schema.safeParse(body);
    if (result.success) {
        return { data: result.data };
    }
    const messages = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
    );
    return { error: messages.join("; ") };
}
