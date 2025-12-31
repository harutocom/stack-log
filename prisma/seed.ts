import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // IDをここで固定定義して、絶対にズレないようにする
  const FIXED_USER_ID = "user-001";
  const FIXED_SEASON_ID = "season-001";
  const FIXED_MONTHLY_ID = "monthly-001";
  const FIXED_WEEKLY_ID = "weekly-001";

  // 1. ユーザーを作成 (Upsert)
  await prisma.user.upsert({
    where: { id: FIXED_USER_ID },
    update: {},
    create: {
      id: FIXED_USER_ID,
      name: "Haruto Tech",
      email: "haruto@example.com",
      image: "https://i.pravatar.cc/150?u=haruto",
    },
  });

  // 2. Season Goalを作成
  await prisma.seasonGoal.upsert({
    where: { id: FIXED_SEASON_ID },
    update: {},
    create: {
      id: FIXED_SEASON_ID,
      userId: FIXED_USER_ID,
      title: "🚀 個人開発でアプリをリリースして100ユーザー獲得する",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-03-31"),
      isActive: true,
    },
  });

  // 3. Monthly Goalを作成
  await prisma.monthlyGoal.upsert({
    where: { id: FIXED_MONTHLY_ID },
    update: {},
    create: {
      id: FIXED_MONTHLY_ID,
      seasonGoalId: FIXED_SEASON_ID,
      userId: FIXED_USER_ID,
      title: "📱 MVPを完成させてベータ版を公開する",
      month: 1,
      year: 2025,
    },
  });

  // 4. Weekly Goalを作成 (これでID: weekly-001 が確実に作られる)
  const weeklyGoal = await prisma.weeklyGoal.upsert({
    where: { id: FIXED_WEEKLY_ID },
    update: {},
    create: {
      id: FIXED_WEEKLY_ID,
      monthlyGoalId: FIXED_MONTHLY_ID,
      userId: FIXED_USER_ID,
      title: "🎨 UIデザインを固めてフロントエンドの実装を完了する",
      weekNumber: 2,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  console.log(`✅ Weekly Goal created/ensured: ${weeklyGoal.id}`);

  // (オプション) 確認用にタスクを1つ入れておく
  await prisma.task.upsert({
    where: { id: "task-sample-01" },
    update: {},
    create: {
      id: "task-sample-01",
      weeklyGoalId: FIXED_WEEKLY_ID, // 確実に存在する親IDを指定
      userId: FIXED_USER_ID,
      title: "Seedで作成したテストタスク",
      date: new Date(),
      durationMinutes: 30,
      isCompleted: false,
    },
  });

  console.log("✨ Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
