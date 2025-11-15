import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex");

    // Create invite - any logged-in user can create invites
    const invite = await prisma.invite.create({
      data: {
        token,
        adminId: session.user.id, // Track who created the invite
      },
    });

    // Generate invite URL
    const inviteUrl = `${process.env.NEXTAUTH_URL}/signup/${token}`;

    return NextResponse.json({
      invite: {
        id: invite.id,
        token: invite.token,
        url: inviteUrl,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error("Generate invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
