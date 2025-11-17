import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        linkedinUrl: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    console.log("=== PATCH /api/user/profile - Start ===");

    const session = await auth();
    console.log("Session:", session?.user?.id ? `User ID: ${session.user.id}` : "No session");

    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const { fullName, email, linkedinUrl } = body;

    if (!fullName || !email) {
      console.log("Validation failed: Missing fullName or email");
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL format if provided
    if (linkedinUrl && linkedinUrl.trim() !== "") {
      const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
      if (!linkedinPattern.test(linkedinUrl)) {
        console.log("Validation failed: Invalid LinkedIn URL format");
        return NextResponse.json(
          { error: "Invalid LinkedIn URL format. Must be like: https://linkedin.com/in/username" },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken by another user
    console.log("Checking if email exists:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      console.log("Email already in use by another user:", existingUser.id);
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Update user
    console.log("Updating user:", session.user.id);
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: fullName.trim(),
        email: email.trim(),
        linkedinUrl: linkedinUrl && linkedinUrl.trim() !== "" ? linkedinUrl.trim() : null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        linkedinUrl: true,
        role: true,
      },
    });

    console.log("User updated successfully:", updatedUser);
    console.log("=== PATCH /api/user/profile - Success ===");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("=== PATCH /api/user/profile - Error ===");
    console.error("Update profile error:", error);

    // Check if it's a Prisma error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
