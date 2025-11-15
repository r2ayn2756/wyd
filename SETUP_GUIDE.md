# WYD App - Setup Guide

## Phase 2 Complete! 🎉

The "wyd" app is now **approximately 90% complete**. All core features have been implemented!

## What's Been Built

### ✅ Phase 1: Foundation
- Next.js 14+ with TypeScript
- Tailwind CSS with monochrome theme
- shadcn/ui components
- Prisma database schema
- NextAuth.js authentication

### ✅ Phase 2: Core Features
- **Dashboard** - Two-column layout with time tracker and leaderboard
- **Time Tracking System**
  - Clock in/out with task description
  - Live session timer
  - Session verification for >1 hour sessions
  - Manual time fix workflow
- **Leaderboard System**
  - Daily, Weekly, Monthly, Yearly, All-Time periods
  - Real-time updates (30s polling)
  - LinkedIn profile integration
  - Ranking display
- **Invite System**
  - Admin invite generation
  - Single-use invite links
  - Invite management page
  - Signup with invite validation
- **User Profile**
  - Edit name, email, LinkedIn URL
  - Profile update functionality
- **5 AM Reset Cron Job**
  - Automatic session splitting
  - Vercel Cron configuration

## Quick Start

### 1. Database Setup

Choose one option:

**Option A: Supabase (Recommended)**
```bash
# 1. Go to https://supabase.com and create a new project
# 2. Copy the connection string
# 3. Update .env:
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

**Option B: Local PostgreSQL**
```bash
# 1. Install PostgreSQL
# 2. Create database:
createdb wyd

# 3. Update .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wyd"
```

### 2. Environment Variables

Update `.env` with your values:

```bash
# Database
DATABASE_URL="your-database-url-here"

# NextAuth (generate secrets with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
APP_TIMEZONE="America/New_York"

# Cron Job Security
CRON_SECRET="your-cron-secret-here"
```

### 3. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Create Admin User

You need to manually create the first admin user in the database:

```bash
# Open Prisma Studio
npx prisma studio

# Or use SQL:
```

```sql
-- Hash a password first using bcrypt (10 rounds)
-- Example: password "admin123" hashed:
INSERT INTO users (id, email, password_hash, full_name, linkedin_url, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin User',
  'https://linkedin.com/in/yourprofile',
  'ADMIN',
  NOW()
);
```

**Better approach - Use Node.js to hash:**

```javascript
// hash-password.js
const bcrypt = require('bcryptjs');
const password = 'your-password';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Then run:
```bash
node hash-password.js
# Copy the output and use it in the SQL INSERT above
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## File Structure

```
wyd/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth endpoints
│   │   │   └── signup/route.ts         # User registration
│   │   ├── cron/
│   │   │   └── reset/route.ts          # 5 AM reset job
│   │   ├── invites/
│   │   │   ├── generate/route.ts       # Generate invite (admin)
│   │   │   ├── validate/route.ts       # Validate invite token
│   │   │   └── route.ts                # List invites
│   │   ├── leaderboard/route.ts        # Leaderboard data
│   │   ├── sessions/
│   │   │   ├── clock-in/route.ts       # Start session
│   │   │   ├── clock-out/route.ts      # End session
│   │   │   ├── current/route.ts        # Get active session
│   │   │   ├── verify/route.ts         # Verify session
│   │   │   └── [id]/route.ts           # Update session (manual fix)
│   │   └── user/
│   │       └── profile/route.ts        # User profile CRUD
│   ├── admin/
│   │   └── invites/page.tsx            # Admin invite management
│   ├── dashboard/page.tsx              # Main dashboard
│   ├── login/page.tsx                  # Login page
│   ├── profile/page.tsx                # User profile editor
│   ├── signup/[token]/page.tsx         # Signup with invite
│   ├── layout.tsx                      # Root layout
│   └── globals.css                     # Global styles
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── ClockInDialog.tsx               # "wyd?" modal
│   ├── Header.tsx                      # App header
│   ├── Leaderboard.tsx                 # Leaderboard component
│   ├── TimeTracker.tsx                 # Time tracking UI
│   └── VerificationDialog.tsx          # Session verification
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── leaderboard.ts                  # Leaderboard logic
│   ├── prisma.ts                       # Prisma client
│   └── utils.ts                        # Utility functions
├── prisma/
│   └── schema.prisma                   # Database schema
├── types/
│   └── next-auth.d.ts                  # NextAuth types
├── middleware.ts                       # Route protection
├── vercel.json                         # Cron configuration
└── .env                                # Environment variables
```

## Testing the App

### 1. Login
- Go to http://localhost:3000/login
- Use the admin credentials you created

### 2. Generate an Invite
- Click "Manage Invites" in the header
- Generate a new invite link
- Copy the link

### 3. Create a Member Account
- Open the invite link in an incognito window
- Complete the signup form
- Login with the new account

### 4. Test Time Tracking
- Click "Clock In"
- Enter a task description
- Watch the timer count up
- Click "Clock Out"
- If session > 1 hour, verify or fix times

### 5. Check Leaderboard
- Switch between time periods (Daily, Weekly, etc.)
- See rankings update in real-time
- Click on names to view LinkedIn profiles

### 6. Update Profile
- Click "Profile" in header
- Update your information
- See changes reflected on leaderboard

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - wyd app"
git branch -M main
git remote add origin https://github.com/your-username/wyd.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain)
   - `APP_TIMEZONE`
   - `CRON_SECRET`
5. Deploy!

### 3. Run Migrations on Production

```bash
# After deployment, run migrations:
npx prisma migrate deploy
```

### 4. Create Production Admin User

Use Prisma Studio or SQL to create the admin user in your production database.

## Cron Job Configuration

The 5 AM reset is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset",
      "schedule": "0 5 * * *"
    }
  ]
}
```

This runs daily at 5:00 AM in UTC. To adjust for your timezone, modify the cron expression.

**Important:** Add `CRON_SECRET` to your Vercel environment variables for security.

## Known Issues & Limitations

1. **Timezone Handling**: The 5 AM reset uses a simplified timezone approach. For production, consider using `date-fns-tz` for more robust timezone handling.

2. **Real-time Updates**: Currently uses 30-second polling. For true real-time, consider implementing WebSockets or Server-Sent Events.

3. **Session Verification**: Auto-verifies sessions ≤1 hour. The >1 hour threshold is hardcoded but can be made configurable.

4. **Password Reset**: Not implemented. Users cannot reset their passwords yet.

5. **Email Notifications**: No email notifications for invites or other events.

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email notifications
- [ ] Export time data (CSV, PDF)
- [ ] Team statistics and analytics
- [ ] Dark mode toggle (currently monochrome only)
- [ ] Mobile app (React Native)
- [ ] Session notes/tags
- [ ] Weekly summary emails
- [ ] Integration with calendar apps
- [ ] Time goals and achievements

## Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution:** Check your `DATABASE_URL` in `.env` and ensure the database is running.

### Prisma Client Error
```
Error: @prisma/client did not initialize yet
```
**Solution:** Run `npx prisma generate`

### NextAuth Error
```
Error: NEXTAUTH_SECRET is not defined
```
**Solution:** Add `NEXTAUTH_SECRET` to your `.env` file

### Cron Job Not Running
**Solution:**
- Ensure `CRON_SECRET` is set in environment variables
- Check Vercel cron logs in the dashboard
- Verify `vercel.json` is committed to your repository

## Support

For issues or questions:
1. Check the [BUILD_PROGRESS.md](BUILD_PROGRESS.md) for implementation details
2. Review the code comments
3. Check Prisma docs: https://www.prisma.io/docs
4. Check NextAuth docs: https://next-auth.js.org

## License

MIT
