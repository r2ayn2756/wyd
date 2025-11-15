import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">wyd</h1>
          <p className="text-2xl text-muted-foreground">What You Doing?</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A minimalist, invite-only time tracking app with gamified leaderboards.
            Track your productive time and compete with your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg">
            <Clock className="h-12 w-12 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Simple Time Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Clock in with a task description. Clock out when done. That's it.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Gamified Leaderboards</h3>
            <p className="text-sm text-muted-foreground">
              Daily, weekly, monthly, yearly, and all-time rankings to keep you motivated.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Invite-Only Teams</h3>
            <p className="text-sm text-muted-foreground">
              Create a private workspace for your team with single-use invite links.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Prisma, and shadcn/ui
          </p>
        </div>
      </div>
    </main>
  );
}
