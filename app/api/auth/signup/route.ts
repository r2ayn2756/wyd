import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, linkedinUrl, token } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !token || !linkedinUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL
    if (!linkedinUrl.includes("linkedin.com")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn profile URL" },
        { status: 400 }
      );
    }

    // Validate invite token
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.used) {
      return NextResponse.json(
        { error: "Invalid or already used invite" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and mark invite as used in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          linkedinUrl: linkedinUrl,
          role: "MEMBER",
        },
      });

      // Mark invite as used
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          used: true,
          usedById: newUser.id,
        },
      });

      return newUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
