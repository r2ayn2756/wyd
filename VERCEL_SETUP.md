# Vercel Deployment Setup Guide

## Required Environment Variables

You need to set these in your Vercel project settings:

1. Go to https://vercel.com/r2ayn2756/wyd/settings/environment-variables

2. Add the following environment variables:

### Database Configuration

**DATABASE_URL**
```
Your Supabase connection pooler URL
Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**DIRECT_URL**
```
Your Supabase direct connection URL
Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### NextAuth Configuration

**NEXTAUTH_SECRET**
```
Generate with: openssl rand -base64 32
Or use any random 32+ character string
```

**NEXTAUTH_URL**
```
Your production URL (e.g., https://wyd.vercel.app)
Or https://wyd-[your-vercel-id].vercel.app
```

## Database Setup

After environment variables are set:

1. Run the Prisma migrations in Supabase SQL Editor:

```sql
-- Make task_description nullable
ALTER TABLE "sessions" ALTER COLUMN "task_description" DROP NOT NULL;
```

2. Create your first admin user:

```sql
-- First, create an invite token
INSERT INTO "invites" (id, token, "adminId", used, "createdAt")
VALUES (
  gen_random_uuid(),
  'initial-admin-invite',
  gen_random_uuid(),
  false,
  NOW()
);
```

3. Use the signup page with the invite link:
   https://your-app.vercel.app/signup/initial-admin-invite

4. After creating the admin account, update their role:

```sql
UPDATE "users"
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

## Redeploy

After setting environment variables, redeploy:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Click the three dots on the latest deployment
4. Click "Redeploy"

## Troubleshooting

### "Server error" after login
- Check that all environment variables are set correctly
- Verify DATABASE_URL and DIRECT_URL are correct
- Make sure NEXTAUTH_SECRET is set
- Check Vercel function logs for specific errors

### Cannot connect to database
- Verify Supabase connection string
- Check that pooler port (6543) is correct for DATABASE_URL
- Ensure your database is running and accessible

### Session issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your deployment URL
- Clear browser cookies and try again
