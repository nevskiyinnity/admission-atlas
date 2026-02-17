import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.feedbackReply.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.uploadLog.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.feedbackType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // ── Tags ──
  const tags = await Promise.all(
    ['IELTS', 'TOEFL', 'SAT', 'GRE', 'GMAT', 'UK', 'US', 'Canada', 'Australia', 'CS', 'Business', 'Engineering'].map(
      (name) => prisma.tag.create({ data: { name } })
    )
  );

  // ── Admin ──
  const admin = await prisma.user.create({
    data: {
      email: 'admin@atlas.com', password, name: 'System Admin', role: 'ADMIN',
      gender: 'MALE', phone: '+1-555-0100',
    },
  });

  // ── Counselors (3) ──
  const counselor1 = await prisma.user.create({
    data: {
      email: 'counselor@atlas.com', password, name: 'Dr. Sarah Chen', role: 'COUNSELOR',
      gender: 'FEMALE', phone: '+1-555-0200', title: 'Senior Counselor',
      country: 'United Kingdom', city: 'London', counselorId: 'COU-001',
      tags: { connect: [{ id: tags[0].id }, { id: tags[5].id }, { id: tags[9].id }] },
    },
  });
  const counselor2 = await prisma.user.create({
    data: {
      email: 'counselor2@atlas.com', password, name: 'Prof. James Wilson', role: 'COUNSELOR',
      gender: 'MALE', phone: '+1-555-0201', title: 'Admissions Specialist',
      country: 'United States', city: 'New York', counselorId: 'COU-002',
      tags: { connect: [{ id: tags[1].id }, { id: tags[6].id }, { id: tags[10].id }] },
    },
  });
  const counselor3 = await prisma.user.create({
    data: {
      email: 'counselor3@atlas.com', password, name: 'Dr. Emily Zhang', role: 'COUNSELOR',
      gender: 'FEMALE', phone: '+1-555-0202', title: 'Graduate Advisor',
      country: 'Canada', city: 'Toronto', counselorId: 'COU-003',
      tags: { connect: [{ id: tags[3].id }, { id: tags[7].id }, { id: tags[11].id }] },
    },
  });

  // ── Students (10) ──
  const studentData = [
    { email: 'student@atlas.com', name: 'Li Wei', gender: 'MALE' as const, phone: '+86-138-0001', dob: '2000-05-15', id: 'STU-001', counselor: counselor1 },
    { email: 'student2@atlas.com', name: 'Zhang Mei', gender: 'FEMALE' as const, phone: '+86-138-0002', dob: '2001-03-22', id: 'STU-002', counselor: counselor1 },
    { email: 'student3@atlas.com', name: 'Wang Jun', gender: 'MALE' as const, phone: '+86-138-0003', dob: '2000-09-10', id: 'STU-003', counselor: counselor1 },
    { email: 'student4@atlas.com', name: 'Chen Xiao', gender: 'FEMALE' as const, phone: '+86-138-0004', dob: '2001-01-05', id: 'STU-004', counselor: counselor2 },
    { email: 'student5@atlas.com', name: 'Liu Yang', gender: 'MALE' as const, phone: '+86-138-0005', dob: '2000-07-18', id: 'STU-005', counselor: counselor2 },
    { email: 'student6@atlas.com', name: 'Huang Ling', gender: 'FEMALE' as const, phone: '+86-138-0006', dob: '2001-11-30', id: 'STU-006', counselor: counselor2 },
    { email: 'student7@atlas.com', name: 'Zhou Hao', gender: 'MALE' as const, phone: '+86-138-0007', dob: '2000-04-25', id: 'STU-007', counselor: counselor3 },
    { email: 'student8@atlas.com', name: 'Wu Fang', gender: 'FEMALE' as const, phone: '+86-138-0008', dob: '2001-06-14', id: 'STU-008', counselor: counselor3 },
    { email: 'student9@atlas.com', name: 'Zhao Rui', gender: 'MALE' as const, phone: '+86-138-0009', dob: '2000-12-01', id: 'STU-009', counselor: counselor3 },
    { email: 'student10@atlas.com', name: 'Sun Ying', gender: 'FEMALE' as const, phone: '+86-138-0010', dob: '2001-08-20', id: 'STU-010', counselor: counselor1 },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.create({
      data: {
        email: s.email, password, name: s.name, role: 'STUDENT',
        gender: s.gender, phone: s.phone, dateOfBirth: new Date(s.dob),
        studentId: s.id, assignedCounselorId: s.counselor.id,
      },
    });
    students.push(student);
  }

  // ── Projects with milestones, tasks, and messages ──
  const projectData = [
    { student: students[0], counselor: counselor1, uni: 'University of Oxford', major: 'Computer Science', deadline: '2026-01-15' },
    { student: students[0], counselor: counselor1, uni: 'Imperial College London', major: 'Data Science', deadline: '2026-02-01' },
    { student: students[1], counselor: counselor1, uni: 'University of Cambridge', major: 'Economics', deadline: '2026-01-20' },
    { student: students[2], counselor: counselor1, uni: 'UCL', major: 'Law', deadline: '2026-03-01' },
    { student: students[3], counselor: counselor2, uni: 'MIT', major: 'Computer Science', deadline: '2026-01-01' },
    { student: students[4], counselor: counselor2, uni: 'Stanford University', major: 'Business Administration', deadline: '2026-01-10' },
    { student: students[5], counselor: counselor2, uni: 'Harvard University', major: 'Public Health', deadline: '2026-02-15' },
    { student: students[6], counselor: counselor3, uni: 'University of Toronto', major: 'Mechanical Engineering', deadline: '2026-03-01' },
    { student: students[7], counselor: counselor3, uni: 'McGill University', major: 'Biology', deadline: '2026-02-20' },
    { student: students[8], counselor: counselor3, uni: 'University of British Columbia', major: 'Physics', deadline: '2026-03-15' },
  ];

  for (let i = 0; i < projectData.length; i++) {
    const pd = projectData[i];
    const project = await prisma.project.create({
      data: {
        universityName: pd.uni, major: pd.major,
        deadline: new Date(pd.deadline),
        studentId: pd.student.id, counselorId: pd.counselor.id,
        status: i < 2 ? 'ACTIVE' : i === 2 ? 'COMPLETED' : 'ACTIVE',
      },
    });

    // Create milestones
    const milestoneNames = ['Document Preparation', 'Application Submission', 'Interview Preparation', 'Final Review'];
    for (let j = 0; j < milestoneNames.length; j++) {
      const milestone = await prisma.milestone.create({
        data: {
          name: milestoneNames[j], projectId: project.id, order: j,
          status: i === 2 ? 'COMPLETED' : j === 0 ? 'IN_PROGRESS' : j === 1 && i < 3 ? 'IN_PROGRESS' : 'PENDING',
        },
      });

      // Create 2 tasks per milestone
      const taskNames = [
        [`Prepare ${milestoneNames[j]} - Part A`, `Review ${milestoneNames[j]} - Part B`],
      ][0];

      for (let k = 0; k < taskNames.length; k++) {
        const task = await prisma.task.create({
          data: {
            name: taskNames[k], milestoneId: milestone.id,
            description: `Complete ${taskNames[k].toLowerCase()} for ${pd.uni}`,
            deadline: new Date(pd.deadline),
            status: i === 2 ? 'COMPLETED' : j === 0 && k === 0 ? 'IN_PROGRESS' : 'PENDING',
            assignedTo: k === 0 ? 'STUDENT' : 'COUNSELOR',
          },
        });

        // Add messages to first task of first milestone
        if (j === 0 && k === 0) {
          await prisma.message.create({
            data: {
              content: `Hi ${pd.student.name}, please start working on ${taskNames[k]} for ${pd.uni}. Let me know if you have questions!`,
              senderId: pd.counselor.id, taskId: task.id,
            },
          });
          await prisma.message.create({
            data: {
              content: `Thank you! I'll start right away. Do I need to prepare any specific documents?`,
              senderId: pd.student.id, taskId: task.id,
            },
          });
          await prisma.message.create({
            data: {
              content: `Yes, please prepare your personal statement and transcripts first. I've attached a template.`,
              senderId: pd.counselor.id, taskId: task.id,
            },
          });
        }
      }
    }
  }

  // ── Feedback types ──
  await Promise.all(
    ['Account Problem', 'File Upload Error', 'Task Issue', 'General Feedback', 'Feature Request'].map(
      (name) => prisma.feedbackType.create({ data: { name } })
    )
  );

  // ── FAQs ──
  const faqData = [
    { question: 'How do I upload documents?', answer: 'Navigate to your task view and click the Attach button in the center panel. Select your files and click Upload.', category: 'General', order: 1 },
    { question: 'How do I contact my counselor?', answer: 'Use the message input at the bottom of any task view to send messages directly to your counselor.', category: 'Communication', order: 2 },
    { question: 'What file formats are supported?', answer: 'We support Word, Excel, PDF, images (JPG, PNG, GIF), video, and audio files.', category: 'General', order: 3 },
    { question: 'How do I check my application status?', answer: 'Visit the Progress Tracking page in your dashboard to see all your application statuses and milestone progress.', category: 'Applications', order: 4 },
    { question: 'Can I change my password?', answer: 'Go to Account Management > Change Password. You\'ll need to verify your email first.', category: 'Account', order: 5 },
    { question: 'How do notifications work?', answer: 'You receive notifications for new tasks, messages, file uploads, and announcements. Check the Notifications page to view all.', category: 'Communication', order: 6 },
  ];
  await Promise.all(faqData.map((f) => prisma.fAQ.create({ data: f })));

  // ── Announcements ──
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Admission Atlas',
      content: 'Welcome to the platform! Please complete your profile and check your assigned tasks.',
      target: 'ALL',
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'Application Deadline Reminder',
      content: 'Please check your upcoming application deadlines and ensure all documents are submitted on time.',
      target: 'STUDENTS',
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'New Counselor Guidelines',
      content: 'Updated guidelines for counselor task management are now available. Please review the latest procedures.',
      target: 'COUNSELORS',
    },
  });

  // ── Notifications for first student ──
  await prisma.notification.create({
    data: {
      type: 'TASK', title: 'New Task Assigned',
      content: 'You have been assigned a new task: Prepare Document Preparation - Part A',
      userId: students[0].id,
    },
  });
  await prisma.notification.create({
    data: {
      type: 'ANNOUNCEMENT', title: 'Welcome to Admission Atlas',
      content: 'Welcome to the platform! Please complete your profile.',
      userId: students[0].id,
    },
  });
  await prisma.notification.create({
    data: {
      type: 'MESSAGE', title: 'New message from Dr. Sarah Chen',
      content: 'Your counselor sent you a message regarding your Oxford application.',
      userId: students[0].id,
    },
  });

  // ── Feedback ──
  const feedback = await prisma.feedback.create({
    data: {
      type: 'General Feedback', description: 'The platform is very easy to use. Great job!',
      userId: students[0].id, status: 'REPLIED',
    },
  });
  await prisma.feedbackReply.create({
    data: {
      content: 'Thank you for your positive feedback! We are glad you enjoy the platform.',
      feedbackId: feedback.id, userId: admin.id,
    },
  });

  // ── Login logs ──
  for (const user of [admin, counselor1, counselor2, students[0], students[1]]) {
    await prisma.loginLog.create({
      data: { userId: user.id, ip: '192.168.1.' + Math.floor(Math.random() * 255), userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    });
  }

  console.log('Seed complete!');
  console.log('');
  console.log('Login credentials (all passwords: password123):');
  console.log('  Admin:      admin@atlas.com');
  console.log('  Counselor:  counselor@atlas.com / counselor2@atlas.com / counselor3@atlas.com');
  console.log('  Students:   student@atlas.com through student10@atlas.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
