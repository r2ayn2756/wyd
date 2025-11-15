"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Invite {
  id: string;
  token: string;
  used: boolean;
  createdAt: string;
  usedBy: {
    fullName: string;
    email: string;
  } | null;
}

export function InvitesClient() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newInviteUrl, setNewInviteUrl] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invites", {
        cache: "no-store",
      });
      const data = await response.json();
      setInvites(data.invites || []);
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvite = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/invites/generate", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("Failed to generate invite");
        return;
      }

      const data = await response.json();
      setNewInviteUrl(data.invite.url);
      fetchInvites(); // Refresh list
      toast.success("Invite link generated!");
    } catch (error) {
      console.error("Failed to generate invite:", error);
      toast.error("Failed to generate invite");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Invite link copied to clipboard!");
  };

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/signup/${token}`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Invite</CardTitle>
            <CardDescription>
              Create a single-use invite link for a new team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={generateInvite}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Invite Link"}
            </Button>

            {newInviteUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium">New Invite Link:</p>
                <div className="flex gap-2">
                  <Input value={newInviteUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newInviteUrl, "new")}
                  >
                    {copiedId === "new" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Invites</CardTitle>
            <CardDescription>
              View all invite links you've created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : invites.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No invites created yet
              </p>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            invite.used
                              ? "bg-muted text-muted-foreground"
                              : "bg-green-100 text-green-900"
                          }`}
                        >
                          {invite.used ? "Used" : "Active"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!invite.used && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              getInviteUrl(invite.token),
                              invite.id
                            )
                          }
                        >
                          {copiedId === invite.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {invite.used && invite.usedBy && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Used by:{" "}
                        </span>
                        <span className="font-medium">
                          {invite.usedBy.fullName} ({invite.usedBy.email})
                        </span>
                      </div>
                    )}

                    {!invite.used && (
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {getInviteUrl(invite.token)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
