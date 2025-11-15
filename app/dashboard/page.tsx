import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { TimeTracker } from "@/components/TimeTracker";
import { Leaderboard } from "@/components/Leaderboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Motivational Banner */}
        <div className="mb-8 p-6 bg-black border-4 border-black rounded-lg">
          <p className="text-center text-xl md:text-3xl lg:text-4xl font-mono font-black tracking-tight text-white uppercase">
            There is always someone working harder than you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Time Tracker */}
          <div>
            <TimeTracker userId={session.user.id} />
          </div>

          {/* Right Column: Leaderboard */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}
