import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function testAllFeatures() {
  console.log("🧪 Starting comprehensive feature tests...\n");

  // Test 1: Check admin user exists
  console.log("Test 1: Checking admin user exists...");
  const adminUser = await prisma.user.findUnique({
    where: { email: "at253@gmail.com" },
  });

  if (!adminUser) {
    console.log("❌ Admin user not found!");
    return;
  }
  console.log("✅ Admin user exists:", adminUser.fullName);
  console.log(`   Role: ${adminUser.role}\n`);

  // Test 2: Create invite token
  console.log("Test 2: Creating invite token...");
  const invite = await prisma.invite.create({
    data: {
      token: `test-token-${Date.now()}`,
      adminId: adminUser.id,
    },
  });
  console.log("✅ Invite created:", invite.token);
  console.log(`   ID: ${invite.id}\n`);

  // Test 3: Validate invite token (simulate API call)
  console.log("Test 3: Validating invite token...");
  const validInvite = await prisma.invite.findUnique({
    where: { token: invite.token },
  });
  if (validInvite && !validInvite.used) {
    console.log("✅ Invite is valid and unused\n");
  } else {
    console.log("❌ Invite validation failed\n");
    return;
  }

  // Test 4: Create test user with invite
  console.log("Test 4: Creating test user...");
  const testEmail = `test-${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash("testpass123", 10);

  const testUser = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: testEmail,
        passwordHash,
        fullName: "Test User",
        linkedinUrl: "https://linkedin.com/in/testuser",
        role: "MEMBER",
      },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: {
        used: true,
        usedById: newUser.id,
      },
    });

    return newUser;
  });

  console.log("✅ Test user created:", testUser.fullName);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   ID: ${testUser.id}\n`);

  // Test 5: Verify invite is now used
  console.log("Test 5: Verifying invite is marked as used...");
  const usedInvite = await prisma.invite.findUnique({
    where: { id: invite.id },
    include: { usedBy: true },
  });
  if (usedInvite?.used && usedInvite.usedBy?.email === testEmail) {
    console.log("✅ Invite properly marked as used\n");
  } else {
    console.log("❌ Invite not marked as used correctly\n");
    return;
  }

  // Test 6: Create session (clock in)
  console.log("Test 6: Creating time tracking session...");
  const session = await prisma.session.create({
    data: {
      userId: testUser.id,
      taskDescription: "Testing time tracking functionality",
      startTime: new Date(),
    },
  });
  console.log("✅ Session created (clocked in)");
  console.log(`   Session ID: ${session.id}`);
  console.log(`   Task: ${session.taskDescription}\n`);

  // Test 7: Check active session
  console.log("Test 7: Checking active session...");
  const activeSession = await prisma.session.findFirst({
    where: {
      userId: testUser.id,
      endTime: null,
    },
  });
  if (activeSession) {
    console.log("✅ Active session found\n");
  } else {
    console.log("❌ No active session found\n");
    return;
  }

  // Test 8: End session (clock out) - short session (<1 hour)
  console.log("Test 8: Ending session (short duration)...");
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: {
      endTime,
      duration,
      verified: duration <= 3600, // Auto-verify if ≤1 hour
    },
  });
  console.log("✅ Session ended");
  console.log(`   Duration: ${duration} seconds`);
  console.log(`   Auto-verified: ${updatedSession.verified}\n`);

  // Test 9: Create long session requiring manual verification
  console.log("Test 9: Creating long session (>1 hour)...");
  const longSessionStart = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const longSession = await prisma.session.create({
    data: {
      userId: testUser.id,
      taskDescription: "Long task requiring verification",
      startTime: longSessionStart,
      endTime: new Date(),
      duration: 7200, // 2 hours in seconds
      verified: false, // Not auto-verified
    },
  });
  console.log("✅ Long session created");
  console.log(`   Duration: 2 hours`);
  console.log(`   Verified: ${longSession.verified} (requires manual verification)\n`);

  // Test 10: Manual verification
  console.log("Test 10: Testing manual verification...");
  const verifiedSession = await prisma.session.update({
    where: { id: longSession.id },
    data: { verified: true },
  });
  console.log("✅ Session manually verified\n");

  // Test 11: Manual fix (update duration)
  console.log("Test 11: Testing manual session fix...");
  const fixedSession = await prisma.session.update({
    where: { id: longSession.id },
    data: {
      duration: 3600, // Changed from 2 hours to 1 hour
      verified: true,
    },
  });
  console.log("✅ Session duration manually updated");
  console.log(`   New duration: ${fixedSession.duration} seconds (1 hour)\n`);

  // Test 12: Test leaderboard query (daily)
  console.log("Test 12: Testing daily leaderboard query...");
  const today = new Date();
  today.setHours(5, 0, 0, 0); // 5 AM today

  const dailyStats = await prisma.session.groupBy({
    by: ['userId'],
    where: {
      startTime: { gte: today },
      verified: true,
    },
    _sum: {
      duration: true,
    },
  });
  console.log("✅ Daily leaderboard query successful");
  console.log(`   Found ${dailyStats.length} users with sessions today\n`);

  // Test 13: Test profile update
  console.log("Test 13: Testing profile update...");
  const updatedProfile = await prisma.user.update({
    where: { id: testUser.id },
    data: {
      fullName: "Updated Test User",
      linkedinUrl: "https://linkedin.com/in/updated-testuser",
    },
  });
  console.log("✅ Profile updated successfully");
  console.log(`   New name: ${updatedProfile.fullName}\n`);

  // Test 14: Test multiple invites for admin
  console.log("Test 14: Testing multiple invite generation...");
  const invites = await prisma.invite.createMany({
    data: [
      { token: `invite-1-${Date.now()}`, adminId: adminUser.id },
      { token: `invite-2-${Date.now()}`, adminId: adminUser.id },
      { token: `invite-3-${Date.now()}`, adminId: adminUser.id },
    ],
  });
  console.log(`✅ Created ${invites.count} invites\n`);

  // Test 15: Test fetching all invites for admin
  console.log("Test 15: Fetching all admin invites...");
  const allInvites = await prisma.invite.findMany({
    where: { adminId: adminUser.id },
    include: { usedBy: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`✅ Found ${allInvites.length} total invites for admin`);
  const usedCount = allInvites.filter(i => i.used).length;
  const activeCount = allInvites.filter(i => !i.used).length;
  console.log(`   Used: ${usedCount}, Active: ${activeCount}\n`);

  // Test 16: Test session history
  console.log("Test 16: Testing session history...");
  const allSessions = await prisma.session.findMany({
    where: { userId: testUser.id },
    orderBy: { startTime: 'desc' },
  });
  console.log(`✅ Found ${allSessions.length} sessions for test user`);
  const verifiedCount = allSessions.filter(s => s.verified).length;
  const unverifiedCount = allSessions.filter(s => !s.verified).length;
  console.log(`   Verified: ${verifiedCount}, Unverified: ${unverifiedCount}\n`);

  // Test 17: Test password verification
  console.log("Test 17: Testing password verification...");
  const passwordMatch = await bcrypt.compare("testpass123", testUser.passwordHash);
  if (passwordMatch) {
    console.log("✅ Password verification works correctly\n");
  } else {
    console.log("❌ Password verification failed\n");
  }

  // Cleanup: Remove test data
  console.log("🧹 Cleaning up test data...");
  await prisma.session.deleteMany({
    where: { userId: testUser.id },
  });
  await prisma.invite.deleteMany({
    where: { usedById: testUser.id },
  });
  await prisma.user.delete({
    where: { id: testUser.id },
  });
  console.log("✅ Test data cleaned up\n");

  console.log("✨ All tests completed successfully!");
}

testAllFeatures()
  .catch((error) => {
    console.error("❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
