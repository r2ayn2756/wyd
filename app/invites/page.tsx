"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientHeader } from "@/components/ClientHeader";
import { Copy, Check, UserPlus } from "lucide-react";

export default function InvitesPage() {
  const [inviteUrl, setInviteUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/invites/generate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate invite");
      }

      const data = await response.json();
      setInviteUrl(data.invite.url);
    } catch (error) {
      console.error("Generate invite error:", error);
      alert("Failed to generate invite link");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Friends
              </CardTitle>
              <CardDescription>
                Generate a one-time invite link to invite someone to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!inviteUrl ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Click the button below to generate a new invite link.
                    <br />
                    Each link can only be used once.
                  </p>
                  <Button
                    onClick={generateInvite}
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? "Generating..." : "Generate Invite Link"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite Link</label>
                    <div className="flex gap-2">
                      <Input
                        value={inviteUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="icon"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this link with someone you want to invite. It can only be used once.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setInviteUrl("");
                      generateInvite();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another Invite
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
