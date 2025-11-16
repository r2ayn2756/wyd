# Vercel Postgres Setup Guide (No Supabase Required!)

## Step 1: Add Vercel Postgres to Your Project

1. Go to your Vercel project: https://vercel.com/r2ayn2756/wyd
2. Click the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it "wyd-db" (or whatever you prefer)
6. Select your region (closest to you)
7. Click "Create"

**That's it!** Vercel automatically adds these environment variables to your project:
- `POSTGRES_PRISMA_URL` (for connection pooling)
- `POSTGRES_URL_NON_POOLING` (for direct connections)
- `POSTGRES_URL`

## Step 2: Run Database Migration

After creating the database:

1. Go to the "Data" tab in your Postgres database
2. Click "Query"
3. Run this SQL to create the tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for roles
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- Create users table
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "linkedin_url" TEXT,
  "role" "Role" DEFAULT 'MEMBER',
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create invites table
CREATE TABLE "invites" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "token" TEXT UNIQUE NOT NULL,
  "admin_id" TEXT NOT NULL,
  "used" BOOLEAN DEFAULT false,
  "used_by_id" TEXT UNIQUE,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("admin_id") REFERENCES "users"("id"),
  FOREIGN KEY ("used_by_id") REFERENCES "users"("id")
);

-- Create sessions table
CREATE TABLE "sessions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "task_description" TEXT,
  "start_time" TIMESTAMP(3) NOT NULL,
  "end_time" TIMESTAMP(3),
  "duration" INTEGER,
  "verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- Create indexes
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_start_time_idx" ON "sessions"("start_time");
CREATE INDEX "sessions_end_time_idx" ON "sessions"("end_time");
```

## Step 3: Set Other Environment Variables

You still need to set these manually in Vercel:

1. Go to Settings → Environment Variables
2. Add:

**NEXTAUTH_SECRET**
```bash
# Generate with: openssl rand -base64 32
# Or use any random 32+ character string
```

**NEXTAUTH_URL**
```
https://wyd.vercel.app
# Or your actual Vercel URL
```

## Step 4: Create Your First Admin User

1. Run this in the Postgres query editor:

```sql
-- Create an initial invite
INSERT INTO "invites" (id, token, admin_id, used, created_at)
VALUES (
  gen_random_uuid()::text,
  'initial-admin-setup',
  gen_random_uuid()::text,
  false,
  CURRENT_TIMESTAMP
);
```

2. Go to your app: `https://your-app.vercel.app/signup/initial-admin-setup`

3. Sign up with your details (include LinkedIn URL!)

4. After signup, make yourself admin:

```sql
UPDATE "users"
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

## Step 5: Redeploy

After setting environment variables:
1. Go to Vercel → Deployments
2. Click the three dots on your latest deployment
3. Click "Redeploy"

## Local Development

For local development, update your `.env` file:

```env
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/wyd"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/wyd"
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Then run:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Why Vercel Postgres?

- ✅ **Free tier**: 256MB database, 60 hours compute/month
- ✅ **No setup**: Automatically integrated with Vercel
- ✅ **Connection pooling**: Built-in via POSTGRES_PRISMA_URL
- ✅ **Automatic backups**: Included in free tier
- ✅ **Same region**: Deployed close to your app for low latency

## Troubleshooting

### "No database connection"
- Make sure you created the Vercel Postgres database
- Verify env vars are automatically set (check Settings → Environment Variables)
- Redeploy after creating the database

### "Table doesn't exist"
- Run the migration SQL in the Postgres query editor
- Make sure all tables were created successfully

### Still getting errors?
- Check Vercel function logs for specific errors
- Verify NEXTAUTH_SECRET is set
- Make sure NEXTAUTH_URL matches your deployment URL
