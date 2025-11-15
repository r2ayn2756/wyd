import { Header } from "@/components/Header";
import { InvitesClient } from "./invites-client";

export default function AdminInvitesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <InvitesClient />
    </div>
  );
}
