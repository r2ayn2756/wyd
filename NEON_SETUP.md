# Neon Postgres Setup Guide

## Step 1: Get Your Neon Connection String

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Set Environment Variables in Vercel

1. Go to https://vercel.com/r2ayn2756/wyd/settings/environment-variables
2. Add these variables:

**DATABASE_URL**
```
Your Neon connection string (pooled connection)
Example: postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**DIRECT_URL** (Optional but recommended for migrations)
```
Same as DATABASE_URL or use the direct (non-pooled) connection from Neon
```

**NEXTAUTH_SECRET**
```bash
# Generate with: openssl rand -base64 32
```

**NEXTAUTH_URL**
```
https://your-app.vercel.app
```

## Step 3: Run Database Migration

### Option A: Using Prisma Migrate (Recommended)

If you have the Neon connection string locally:

```bash
# Set DATABASE_URL in your .env file
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push the schema to Neon
npx prisma db push
```

### Option B: Using SQL Query in Neon Console

1. Go to Neon Console → SQL Editor
2. Run this migration:

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

## Step 4: Create Your First Admin User

1. In Neon SQL Editor, create an initial invite:

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

2. Sign up at: `https://your-app.vercel.app/signup/initial-admin-setup`

3. Make yourself admin:

```sql
UPDATE "users"
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

## Step 5: Deploy

After setting environment variables:

1. Go to Vercel → Deployments
2. Click "Redeploy" on your latest deployment

## Neon Connection Modes

Neon provides two connection strings:

**Pooled Connection** (Recommended for production)
- Use this for DATABASE_URL
- Handles connection pooling automatically
- Format: `postgresql://...?sslmode=require`

**Direct Connection** (Optional)
- Use this for DIRECT_URL if needed
- Direct connection to database
- Better for migrations

## Why Neon?

- ✅ **Generous Free Tier**: 0.5 GB storage, always-on compute
- ✅ **Serverless**: Auto-scales with your app
- ✅ **Instant branching**: Great for dev/staging environments
- ✅ **Fast**: Built on top of Postgres with performance optimizations
- ✅ **Connection pooling**: Built-in

## Troubleshooting

### "Cannot connect to database"
- Make sure SSL mode is enabled: `?sslmode=require`
- Verify connection string is correct
- Check that Neon project is not suspended (free tier auto-suspends after inactivity)

### "Table doesn't exist"
- Run the migration SQL in Neon Console
- Or use `npx prisma db push` if you have local access

### SSL Certificate Issues
- Always include `?sslmode=require` in your connection string
- Neon requires SSL connections

### Connection Pool Exhausted
- Use the pooled connection string (default)
- Neon handles pooling automatically

## Local Development

Update your local `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Then run:
```bash
npx prisma generate
npm run dev
```

That's it! Your app should now be connected to Neon Postgres! 🚀
