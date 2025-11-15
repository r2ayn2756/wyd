"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ClientHeaderProps {
  userName?: string;
  userRole?: string;
}

export function ClientHeader({ userName, userRole }: ClientHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/auth/signout", { method: "POST" });
    if (response.ok) {
      router.push("/login");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">wyd</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-muted-foreground">{userName}</span>
          )}

          {userRole === "ADMIN" && (
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

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
