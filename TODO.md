# TODO - Before First Use

## Critical (Required for App to Work)

- [ ] **Set up PostgreSQL database**
  - Option A: Create Supabase project at https://supabase.com
  - Option B: Install PostgreSQL locally
  - Copy DATABASE_URL to `.env`

- [ ] **Configure environment variables in `.env`:**
  ```bash
  DATABASE_URL="your-database-url"
  NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
  NEXTAUTH_URL="http://localhost:3000"
  APP_TIMEZONE="America/New_York"
  CRON_SECRET="generate-with-openssl-rand-base64-32"
  ```

- [ ] **Run database migrations:**
  ```bash
  npx prisma generate
  npx prisma migrate dev --name init
  ```

- [ ] **Create first admin user:**
  ```bash
  # Generate password hash:
  node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"

  # Then use Prisma Studio or SQL to insert user:
  npx prisma studio
  ```

  Or use SQL:
  ```sql
  INSERT INTO users (id, email, password_hash, full_name, linkedin_url, role, created_at)
  VALUES (
    gen_random_uuid(),
    'admin@example.com',
    '$2a$10$YOUR_HASHED_PASSWORD_HERE',
    'Admin User',
    'https://linkedin.com/in/yourprofile',
    'ADMIN',
    NOW()
  );
  ```

- [ ] **Start the dev server:**
  ```bash
  npm run dev
  ```

- [ ] **Test login at http://localhost:3000/login**

## Testing Checklist

### Authentication & Onboarding
- [ ] Login with admin account
- [ ] Navigate to "Manage Invites"
- [ ] Generate an invite link
- [ ] Copy invite link
- [ ] Open invite in incognito window
- [ ] Complete signup form
- [ ] Verify invite is marked as "used"
- [ ] Login with new user account

### Time Tracking
- [ ] Clock in with a task description
- [ ] Verify timer starts and counts up
- [ ] Wait a few seconds
- [ ] Clock out (session <1hr, auto-verified)
- [ ] Clock in again
- [ ] Wait over 1 hour (or manually test with session >1hr in database)
- [ ] Clock out and verify verification dialog appears
- [ ] Test "Yes, Correct" button
- [ ] Clock in again, clock out after >1hr
- [ ] Test "No, Fix It" button
- [ ] Adjust start/end times
- [ ] Verify corrected session saved

### Leaderboard
- [ ] Check Daily tab shows correct totals
- [ ] Check Weekly tab
- [ ] Check Monthly tab
- [ ] Check Yearly tab
- [ ] Check All Time tab
- [ ] Verify rankings are correct
- [ ] Click on user name to verify LinkedIn link works
- [ ] Clock out and wait 30 seconds
- [ ] Verify leaderboard auto-updates

### Profile
- [ ] Click "Profile" in header
- [ ] Update full name
- [ ] Update LinkedIn URL
- [ ] Save changes
- [ ] Go back to dashboard
- [ ] Verify name updated on leaderboard
- [ ] Click name to verify new LinkedIn URL

### Admin Features
- [ ] Generate multiple invite links
- [ ] Verify they appear in the list
- [ ] Copy invite link from the list
- [ ] Use one invite to signup
- [ ] Verify it shows as "Used" with user info

### Edge Cases
- [ ] Try to access /dashboard when logged out (should redirect to login)
- [ ] Try to access /login when logged in (should redirect to dashboard)
- [ ] Try to access /admin/invites as non-admin (should show forbidden)
- [ ] Try to use an already-used invite (should show error)
- [ ] Try to signup with existing email (should show error)
- [ ] Try to clock in while already clocked in (should show error)
- [ ] Try to clock out when not clocked in (should show error)

## Before Deploying to Production

- [ ] **Update environment variables for production:**
  - [ ] Change `NEXTAUTH_URL` to production domain
  - [ ] Generate new `NEXTAUTH_SECRET`
  - [ ] Generate new `CRON_SECRET`
  - [ ] Use production `DATABASE_URL`

- [ ] **Run migrations on production database:**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Create admin user in production database**

- [ ] **Configure Vercel:**
  - [ ] Add all environment variables
  - [ ] Verify cron job is scheduled
  - [ ] Add `CRON_SECRET` to Vercel environment

- [ ] **Test 5 AM reset:**
  - Option A: Wait until 5 AM and verify
  - Option B: Manually trigger via API (requires auth)
  - Option C: Create test session and manually split

- [ ] **Security checks:**
  - [ ] Ensure `.env` is in `.gitignore`
  - [ ] Verify no secrets in code
  - [ ] Test that protected routes require auth
  - [ ] Test that admin routes require admin role
  - [ ] Verify cron endpoint requires secret

## Optional Enhancements

- [ ] Add password reset flow
- [ ] Add email notifications for invites
- [ ] Add export functionality (CSV/PDF)
- [ ] Add team analytics dashboard
- [ ] Add dark mode toggle
- [ ] Add mobile responsive improvements
- [ ] Add session notes/tags
- [ ] Add weekly summary emails
- [ ] Add calendar integration
- [ ] Add time goals/achievements
- [ ] Add session pause/resume
- [ ] Add keyboard shortcuts
- [ ] Add user avatars
- [ ] Add activity feed
- [ ] Add data visualization charts

## Performance Optimizations (Future)

- [ ] Add Redis caching for leaderboard
- [ ] Implement WebSocket for real-time updates
- [ ] Add database indexes for slow queries
- [ ] Implement CDN for static assets
- [ ] Add service worker for offline support
- [ ] Optimize bundle size
- [ ] Add image optimization
- [ ] Implement lazy loading

## Documentation (Future)

- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Add component storybook
- [ ] Add video walkthrough
- [ ] Add deployment guide for other platforms
- [ ] Add troubleshooting guide
- [ ] Add contributing guidelines
- [ ] Add changelog

---

**Current Status:** Ready for database setup and testing!

**Estimated Time to Launch:** 30-60 minutes (database setup + testing)
