import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDb, teardownTestDb } from '../setup-integration';

describe('User CRUD Integration', () => {
  beforeAll(async () => {
    // Ensure test DB schema is ready.
    // In CI, run `prisma migrate deploy` against TEST_DATABASE_URL first.
  });

  beforeEach(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('creates a user with correct defaults', async () => {
    const user = await testPrisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password_here',
        name: 'Test User',
        role: 'STUDENT',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('STUDENT');
    expect(user.accountStatus).toBe('ACTIVE');
    expect(user.serviceStatus).toBe('IN_SERVICE');
    expect(user.webNotifications).toBe(true);
    expect(user.smsNotifications).toBe(true);
    expect(user.emailNotifications).toBe(true);
  });

  it('enforces unique email constraint', async () => {
    await testPrisma.user.create({
      data: {
        email: 'duplicate@example.com',
        password: 'hash1',
        name: 'User 1',
        role: 'STUDENT',
      },
    });

    await expect(
      testPrisma.user.create({
        data: {
          email: 'duplicate@example.com',
          password: 'hash2',
          name: 'User 2',
          role: 'STUDENT',
        },
      })
    ).rejects.toThrow();
  });

  it('enforces unique studentId constraint', async () => {
    await testPrisma.user.create({
      data: {
        email: 'stu1@example.com',
        password: 'hash1',
        name: 'Student 1',
        role: 'STUDENT',
        studentId: 'STU-001',
      },
    });

    await expect(
      testPrisma.user.create({
        data: {
          email: 'stu2@example.com',
          password: 'hash2',
          name: 'Student 2',
          role: 'STUDENT',
          studentId: 'STU-001',
        },
      })
    ).rejects.toThrow();
  });

  it('creates counselor-student assignment', async () => {
    const counselor = await testPrisma.user.create({
      data: {
        email: 'counselor@example.com',
        password: 'hash',
        name: 'Counselor',
        role: 'COUNSELOR',
        counselorId: 'COU-001',
      },
    });

    const student = await testPrisma.user.create({
      data: {
        email: 'student@example.com',
        password: 'hash',
        name: 'Student',
        role: 'STUDENT',
        studentId: 'STU-001',
        assignedCounselorId: counselor.id,
      },
    });

    const counselorWithStudents = await testPrisma.user.findUnique({
      where: { id: counselor.id },
      include: { students: true },
    });

    expect(counselorWithStudents?.students).toHaveLength(1);
    expect(counselorWithStudents?.students[0].id).toBe(student.id);
  });

  it('deletes a user and confirms removal', async () => {
    const user = await testPrisma.user.create({
      data: {
        email: 'todelete@example.com',
        password: 'hash',
        name: 'Delete Me',
        role: 'STUDENT',
      },
    });

    await testPrisma.user.delete({ where: { id: user.id } });

    const found = await testPrisma.user.findUnique({ where: { id: user.id } });
    expect(found).toBeNull();
  });

  it('creates project with milestones and tasks (cascade test)', async () => {
    const counselor = await testPrisma.user.create({
      data: {
        email: 'c@example.com',
        password: 'hash',
        name: 'Counselor',
        role: 'COUNSELOR',
      },
    });

    const student = await testPrisma.user.create({
      data: {
        email: 's@example.com',
        password: 'hash',
        name: 'Student',
        role: 'STUDENT',
      },
    });

    const project = await testPrisma.project.create({
      data: {
        universityName: 'MIT',
        major: 'Computer Science',
        studentId: student.id,
        counselorId: counselor.id,
        milestones: {
          create: {
            name: 'Application',
            order: 1,
            tasks: {
              create: {
                name: 'Write essay',
                assignedTo: 'STUDENT',
              },
            },
          },
        },
      },
      include: {
        milestones: {
          include: { tasks: true },
        },
      },
    });

    expect(project.milestones).toHaveLength(1);
    expect(project.milestones[0].tasks).toHaveLength(1);

    // Deleting the project should cascade to milestones and tasks
    // Note: Project itself doesn't have onDelete: Cascade from User,
    // but Milestone -> Task does cascade. Test milestone deletion:
    await testPrisma.milestone.delete({
      where: { id: project.milestones[0].id },
    });

    const remainingTasks = await testPrisma.task.findMany({
      where: { milestoneId: project.milestones[0].id },
    });
    expect(remainingTasks).toHaveLength(0);
  });
});
