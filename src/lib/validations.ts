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
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
        .optional(),
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

// ── Analyze (college analysis) ──────────────────────────

const MAX_FIELD_LENGTH = 1000;
const boundedString = z.string().max(MAX_FIELD_LENGTH);

export const analyzeProfileSchema = z.object({
    name: boundedString.min(1, 'Name is required'),
    residency: boundedString.optional(),
    gpa: boundedString.optional(),
    sat: boundedString.optional(),
    internationalExams: boundedString.optional(),
    otherExams: boundedString.optional(),
    coursework: boundedString.optional(),
    activities: boundedString.optional(),
    awards: boundedString.optional(),
    university: boundedString.min(1, 'Target university is required'),
    major: boundedString.min(1, 'Major is required'),
    preferredRegions: boundedString.optional(),
    question1: boundedString.optional(),
    question2: boundedString.optional(),
    question3: boundedString.optional(),
    question4: boundedString.optional(),
    question5: boundedString.optional(),
    question6: boundedString.min(1, 'Budget range (question 6) is required'),
    question7: boundedString.optional(),
    question8: boundedString.optional(),
    question9: boundedString.optional(),
}).refine(
    (data) =>
        Boolean(
            (data.gpa || '').trim() ||
            (data.sat || '').trim() ||
            (data.internationalExams || '').trim() ||
            (data.otherExams || '').trim(),
        ),
    { message: 'At least one exam or grade metric is required' },
);

// ── Feedback Types ──────────────────────────────────────

export const createFeedbackTypeSchema = z.object({
    name: z.string().min(1),
});

// ── Helper ──────────────────────────────────────────────

/** Parse body with a Zod schema. Returns { data } on success or { error } on failure. */
type ParseSuccess<T> = { ok: true; data: T; error?: undefined };
type ParseError = { ok: false; data?: undefined; error: string };
export type ParseResult<T> = ParseSuccess<T> | ParseError;

export function parseBody<T>(
    schema: z.ZodType<T>,
    body: unknown,
): ParseResult<T> {
    const result = schema.safeParse(body);
    if (result.success) {
        return { ok: true, data: result.data };
    }
    const messages = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
    );
    return { ok: false, error: messages.join("; ") };
}
