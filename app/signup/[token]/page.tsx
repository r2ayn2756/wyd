"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    linkedinUrl: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Validate token on mount
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/invites/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setIsValidToken(true);
      } else {
        setError("This invite link is invalid or has already been used.");
      }
    } catch (error) {
      setError("Failed to validate invite link.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.linkedinUrl.trim()) {
      setError("LinkedIn profile URL is required");
      return;
    }

    // Validate LinkedIn URL format
    if (!formData.linkedinUrl.includes("linkedin.com")) {
      setError("Please enter a valid LinkedIn profile URL");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          token: token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create account");
        return;
      }

      // Redirect to login
      router.push("/login?registered=true");
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Validating invite link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">wyd</CardTitle>
          <CardDescription className="text-center">
            Create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Your name on the leaderboard will link to your LinkedIn profile
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
