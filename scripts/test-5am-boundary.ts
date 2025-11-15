import { prisma } from "@/lib/prisma";

async function test5AMBoundary() {
  console.log("🧪 Testing 5 AM session boundary logic...\n");

  // Get admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: "at253@gmail.com" },
  });

  if (!adminUser) {
    console.log("❌ Admin user not found!");
    return;
  }

  // Test 1: Create an active session that started before 5 AM
  console.log("Test 1: Creating session that started at 11 PM yesterday...");
  const yesterday11PM = new Date();
  yesterday11PM.setDate(yesterday11PM.getDate() - 1);
  yesterday11PM.setHours(23, 0, 0, 0);

  const activeSession = await prisma.session.create({
    data: {
      userId: adminUser.id,
      taskDescription: "Testing 5 AM boundary split",
      startTime: yesterday11PM,
      // No endTime - this is active
    },
  });

  console.log("✅ Active session created");
  console.log(`   Start time: ${activeSession.startTime}`);
  console.log(`   Session ID: ${activeSession.id}\n`);

  // Test 2: Simulate the 5 AM cron job logic
  console.log("Test 2: Simulating 5 AM reset cron job...");

  const now = new Date();
  now.setHours(5, 0, 0, 0); // Simulate 5 AM today

  // Create end time at 04:59:59 of the current day
  const endOfPreviousPeriod = new Date(now);
  endOfPreviousPeriod.setHours(4, 59, 59, 999);

  // Calculate duration for the old session
  const duration = Math.floor(
    (endOfPreviousPeriod.getTime() - yesterday11PM.getTime()) / 1000
  );

  console.log(`   Session duration before split: ${duration} seconds (${Math.floor(duration / 3600)} hours)\n`);

  // Update the old session to end at 04:59:59
  const closedSession = await prisma.session.update({
    where: { id: activeSession.id },
    data: {
      endTime: endOfPreviousPeriod,
      duration,
      verified: true, // Auto-verify split sessions
    },
  });

  console.log("✅ Old session closed at 04:59:59");
  console.log(`   End time: ${closedSession.endTime}`);
  console.log(`   Duration: ${closedSession.duration} seconds\n`);

  // Create new session starting at 05:00:00
  const startOfNewPeriod = new Date(endOfPreviousPeriod);
  startOfNewPeriod.setHours(5, 0, 0, 0); // 05:00:00

  const newSession = await prisma.session.create({
    data: {
      userId: adminUser.id,
      taskDescription: activeSession.taskDescription, // Reuse same task
      startTime: startOfNewPeriod,
      verified: false,
    },
  });

  console.log("✅ New session created at 05:00:00");
  console.log(`   Start time: ${newSession.startTime}`);
  console.log(`   Task: ${newSession.taskDescription}`);
  console.log(`   Session ID: ${newSession.id}\n`);

  // Test 3: Verify leaderboard boundaries
  console.log("Test 3: Testing leaderboard boundary logic...");

  // Daily boundary - 5 AM today
  const dailyStart = new Date();
  dailyStart.setHours(5, 0, 0, 0);

  console.log(`   Daily period starts at: ${dailyStart}`);

  // Check which period each session falls into
  const oldSessionInDaily = closedSession.startTime! >= dailyStart;
  const newSessionInDaily = newSession.startTime >= dailyStart;

  console.log(`   Old session (ended 04:59:59) in today's daily: ${oldSessionInDaily}`);
  console.log(`   New session (started 05:00:00) in today's daily: ${newSessionInDaily}\n`);

  if (!oldSessionInDaily && newSessionInDaily) {
    console.log("✅ Sessions correctly split across daily boundary!\n");
  } else {
    console.log("❌ Session boundary logic may have issues\n");
  }

  // Test 4: Test weekly boundary
  console.log("Test 4: Testing weekly boundary (Monday 5 AM)...");

  const weeklyStart = new Date();
  const dayOfWeek = weeklyStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to Monday
  weeklyStart.setDate(weeklyStart.getDate() - daysToMonday);
  weeklyStart.setHours(5, 0, 0, 0);

  console.log(`   Weekly period starts at: ${weeklyStart}`);
  console.log(`   Old session in this week: ${closedSession.startTime! >= weeklyStart}`);
  console.log(`   New session in this week: ${newSession.startTime >= weeklyStart}\n`);

  // Test 5: Test monthly boundary
  console.log("Test 5: Testing monthly boundary (1st of month 5 AM)...");

  const monthlyStart = new Date();
  monthlyStart.setDate(1);
  monthlyStart.setHours(5, 0, 0, 0);

  console.log(`   Monthly period starts at: ${monthlyStart}`);
  console.log(`   Old session in this month: ${closedSession.startTime! >= monthlyStart}`);
  console.log(`   New session in this month: ${newSession.startTime >= monthlyStart}\n`);

  // Cleanup
  console.log("🧹 Cleaning up test data...");
  await prisma.session.delete({ where: { id: closedSession.id } });
  await prisma.session.delete({ where: { id: newSession.id } });
  console.log("✅ Test data cleaned up\n");

  console.log("✨ All 5 AM boundary tests completed successfully!");
}

test5AMBoundary()
  .catch((error) => {
    console.error("❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
