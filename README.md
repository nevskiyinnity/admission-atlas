# Admission Atlas

Full-stack admin portal for managing the university admissions consulting pipeline. Supports three roles (Admin, Counselor, Student) with project-based application tracking, file management, messaging, and notifications.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Auth:** NextAuth.js (Credentials + JWT)
- **Database:** PostgreSQL + Prisma ORM
- **File Storage:** Vercel Blob
- **i18n:** next-intl (English, Chinese)
- **UI:** Tailwind CSS + Radix UI + Lucide icons
- **Deployment:** Docker (multi-stage) / Vercel

## Getting Started

```bash
npm install
cp .env.example .env  # fill in values below

npx prisma migrate dev
npx prisma db seed
npm run dev            # http://localhost:3000
```

### Docker

```bash
docker-compose up --build
# App on :3000, Postgres on :5432
```

### Database Commands

```bash
npm run db:generate    # prisma generate
npm run db:push        # push schema without migrations
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed initial data
npm run db:studio      # Prisma Studio UI
```

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob token for file uploads |

## Features

- **Three-role system** — Admin, Counselor, Student with separate dashboard namespaces and middleware-enforced access control.
- **Project-based workflow** — each university application is a Project containing ordered Milestones, Tasks, Messages, and File attachments.
- **Bilingual UI** — English and Chinese with locale-prefixed routing.
- **File management** — uploads to Vercel Blob with type classification and audit logging.
- **Notification system** — announcements, messages, task updates, file uploads, feedback, and system notifications with per-user read status.
- **Feedback & FAQ** — typed feedback with reply threading; admin-managed FAQ content.
- **Admin tools** — user management, tag management, announcement broadcasting, login/upload audit logs, system settings.
- **Account locking** — locked accounts are blocked at the auth layer.

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/        # Login, forgot password
│   │   │   ├── (admin)/       # Admin dashboard, users, tasks, files, logs
│   │   │   ├── (counselor)/   # Counselor dashboard, students, projects
│   │   │   └── (student)/     # Student dashboard, projects, messages
│   │   └── api/               # REST API routes
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   └── prisma.ts          # Prisma singleton
│   ├── i18n/
│   └── middleware.ts          # Locale routing + role guards
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```
