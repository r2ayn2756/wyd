import { auth } from "@/lib/auth";
import { handleSignOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function Header() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">wyd</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session.user.name}</span>

          <Link href="/invites">
            <Button variant="outline" size="sm">
              Invite Friends
            </Button>
          </Link>

          {session.user.role === "ADMIN" && (
            <Link href="/admin/invites">
              <Button variant="outline" size="sm">
                Manage Invites
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </Link>

          <form action={handleSignOut}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
