# Prisma Database Migrations

This project uses [Prisma](https://www.prisma.io/) with PostgreSQL.

## Migration Workflow

### Creating a New Migration (Development)

After making changes to `schema.prisma`, create a migration:

```bash
npx prisma migrate dev --name description_of_change
```

This will:
1. Generate a SQL migration file in `prisma/migrations/`
2. Apply the migration to your local database
3. Regenerate the Prisma Client

### Applying Migrations in Production

```bash
npx prisma migrate deploy
```

This applies all pending migrations without generating new ones. Use this in CI/CD pipelines and production deployments.

### Resetting the Development Database

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Re-apply all migrations
3. Run the seed script (if configured)

**Warning:** This destroys all data. Only use in development.

### Generating the Prisma Client

```bash
npx prisma generate
```

Regenerates the Prisma Client after schema changes without running migrations. This is also run automatically by `postinstall`.

### Viewing Data with Prisma Studio

```bash
npx prisma studio
```

Opens a visual editor for your database at `http://localhost:5555`.

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run db:generate` | `prisma generate` | Regenerate Prisma Client |
| `npm run db:migrate` | `prisma migrate dev` | Create and apply a new migration |
| `npm run db:deploy` | `prisma migrate deploy` | Apply pending migrations (production) |
| `npm run db:push` | `prisma db push` | Push schema changes without migrations |
| `npm run db:seed` | `npx tsx prisma/seed.ts` | Seed the database |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio |

## Baseline Migration

This project previously used `prisma db push` to sync the schema. To transition to proper migrations, create a baseline migration against an existing database:

```bash
# 1. Create a migrations directory and initial migration (without applying it)
mkdir -p prisma/migrations/0_init

# 2. Generate the SQL for the current schema
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3. Mark the migration as already applied (since the DB already has this schema)
npx prisma migrate resolve --applied 0_init

# 4. From now on, use `prisma migrate dev` for all schema changes
```

## Important Notes

- Always commit migration files to version control
- Never manually edit migration SQL files after they have been applied
- Use `prisma db push` only for rapid prototyping; use migrations for production
- The `postinstall` script automatically runs `prisma generate`
