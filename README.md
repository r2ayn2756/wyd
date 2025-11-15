# wyd - What You Doing?

A minimalist, invite-only time tracking application with gamified leaderboards. Built to foster productivity and accountability within closed teams.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)

## Features

### ✅ Implemented

- **Time Tracking**
  - Simple clock in/out workflow
  - Task description required on clock-in
  - Live session timer
  - Session verification for >1 hour sessions
  - Manual time correction workflow

- **Leaderboards**
  - Daily, Weekly, Monthly, Yearly, All-Time periods
  - Automatic resets at 5:00 AM
  - Real-time updates (30-second polling)
  - LinkedIn profile integration
  - Ranked display

- **Authentication & Authorization**
  - Secure login with NextAuth.js
  - Role-based access (Admin/Member)
  - Protected routes with middleware

- **Invite System**
  - Admin-only invite generation
  - Single-use invite links
  - Invite management dashboard
  - Validated signup flow

- **User Management**
  - Profile editing (name, email, LinkedIn)
  - Password hashing with bcrypt

- **5 AM Reset System**
  - Automatic session splitting for active users
  - Vercel Cron job configured
  - Timezone-aware resets

### 🚧 Not Implemented (Future)

- Password reset functionality
- Email notifications
- Export time data
- Team statistics/analytics
- Dark mode toggle
- Mobile app

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL
- **ORM:** Prisma 6.0
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wyd.git
cd wyd

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your values
# DATABASE_URL, NEXTAUTH_SECRET, etc.

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Visit http://localhost:3000

## Documentation

- **[pdr.md](pdr.md)** - Original Product Design Requirements
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[BUILD_PROGRESS.md](BUILD_PROGRESS.md)** - Development progress and architecture
- **[PHASE_3_COMPLETE.md](PHASE_3_COMPLETE.md)** - Testing & QA report
- **[PHASE_4_COMPLETE.md](PHASE_4_COMPLETE.md)** - Polish & UX improvements
- **[TESTING_REPORT.md](TESTING_REPORT.md)** - Detailed test results

## Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  fullName     String
  linkedinUrl  String?
  role         Role     @default(MEMBER)
  createdAt    DateTime @default(now())
}

model Invite {
  id        String   @id @default(uuid())
  token     String   @unique
  adminId   String
  used      Boolean  @default(false)
  usedById  String?  @unique
  createdAt DateTime @default(now())
}

model Session {
  id              String    @id @default(uuid())
  userId          String
  taskDescription String
  startTime       DateTime
  endTime         DateTime?
  duration        Int?
  verified        Boolean   @default(false)
  createdAt       DateTime  @default(now())
}
```

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Sessions
- `POST /api/sessions/clock-in` - Start tracking
- `POST /api/sessions/clock-out` - Stop tracking
- `GET /api/sessions/current` - Get active session
- `POST /api/sessions/verify` - Verify session
- `PATCH /api/sessions/[id]` - Manual fix

### Leaderboard
- `GET /api/leaderboard?period=[daily|weekly|monthly|yearly|alltime]`

### Invites (Admin Only)
- `POST /api/invites/generate` - Generate invite link
- `GET /api/invites` - List all invites
- `POST /api/invites/validate` - Validate token

### User
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile

### Cron
- `GET /api/cron/reset` - 5 AM reset job (secured)

## Environment Variables

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
APP_TIMEZONE="America/New_York"
CRON_SECRET="random-secret-here"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Run `npx prisma migrate deploy` in production

The cron job is automatically configured via `vercel.json`.

## Project Structure

```
wyd/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Login page
│   ├── profile/           # User profile
│   ├── signup/[token]/    # Invite signup
│   └── admin/invites/     # Admin panel
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── leaderboard.ts    # Leaderboard logic
│   └── prisma.ts         # Prisma client
├── prisma/               # Database
│   └── schema.prisma     # Schema definition
└── types/                # TypeScript types
```

## Contributing

This is a personal project built from a PDR specification. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Acknowledgments

- Built following the PDR specification in [pdr.md](pdr.md)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Authentication via [NextAuth.js](https://next-auth.js.org)

---

## Development Timeline

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Foundation setup (Next.js, Tailwind, Prisma, Auth) |
| Phase 2 | ✅ Complete | Core features implementation |
| Phase 3 | ✅ Complete | Testing & quality assurance |
| Phase 4 | ✅ Complete | Polish & UX improvements |
| Phase 5 | 🔜 Next | Production deployment |

**Current Status:** Production-Ready ✅
**Next Step:** Deploy to Vercel
