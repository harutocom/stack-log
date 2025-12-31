import {
  User,
  SeasonGoal,
  MonthlyGoal,
  WeeklyGoal,
  Task,
  DailyLog,
} from "@prisma/client";

// ---------------------------
// 1. Current Mock User
// ---------------------------
export const mockUser: User = {
  id: "user-001",
  name: "Haruto Tech",
  email: "haruto@example.com",
  emailVerified: new Date(),
  image: "https://i.pravatar.cc/150?u=haruto", // Placeholder avatar
  bio: "フルスタックエンジニアを目指して勉強中。朝活頑張る！",
  wakeUpTime: "06:30",
  bedTime: "23:00",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------
// 2. Goal Hierarchy
// ---------------------------

// Season Goal (3 months)
export const mockSeasonGoal: SeasonGoal = {
  id: "season-001",
  userId: mockUser.id,
  title: "🚀 個人開発でアプリをリリースして100ユーザー獲得する",
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-03-31"),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Monthly Goal (1 month)
export const mockMonthlyGoal: MonthlyGoal = {
  id: "monthly-001",
  seasonGoalId: mockSeasonGoal.id,
  userId: mockUser.id,
  title: "📱 MVPを完成させてベータ版を公開する",
  month: 1,
  year: 2025,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Weekly Goal (1 week)
export const mockWeeklyGoal: WeeklyGoal = {
  id: "weekly-001",
  monthlyGoalId: mockMonthlyGoal.id,
  userId: mockUser.id,
  title: "🎨 UIデザインを固めてフロントエンドの実装を完了する",
  weekNumber: 2,
  startDate: new Date("2025-01-05"),
  endDate: new Date("2025-01-11"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------
// 3. Tasks (Today's Tasks)
// ---------------------------
const today = new Date();

export const mockTasks: Task[] = [
  {
    id: "task-001",
    weeklyGoalId: mockWeeklyGoal.id,
    userId: mockUser.id,
    title: "Morning Checkの実装",
    date: today,
    durationMinutes: 45,
    isCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-002",
    weeklyGoalId: mockWeeklyGoal.id,
    userId: mockUser.id,
    title: "Daily Logスキーマの設計",
    date: today,
    durationMinutes: 30,
    isCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-003",
    weeklyGoalId: mockWeeklyGoal.id,
    userId: mockUser.id,
    title: "Shutdown画面のUI作成",
    date: today,
    durationMinutes: 0,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-004",
    weeklyGoalId: mockWeeklyGoal.id,
    userId: mockUser.id,
    title: "ソーシャル機能のモックデータ作成",
    date: today,
    durationMinutes: 0,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-005",
    weeklyGoalId: mockWeeklyGoal.id,
    userId: mockUser.id,
    title: "Next.js 15の新機能キャッチアップ",
    date: today,
    durationMinutes: 0,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ---------------------------
// 4. History (Past 3 Days DailyLog)
// ---------------------------
export const mockHistory: DailyLog[] = [
  {
    id: "log-001",
    userId: mockUser.id,
    date: new Date(new Date().setDate(today.getDate() - 1)), // Yesterday
    commitTime: new Date("2025-01-09T22:30:00"),
    achievementRate: 85,
    journal:
      "今日は集中できた。Prismaの設定で少し手間取ったが解決できてよかった。明日はフロントエンドを一気に進めたい。",
    imageUrl:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=400",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "log-002",
    userId: mockUser.id,
    date: new Date(new Date().setDate(today.getDate() - 2)), // 2 days ago
    commitTime: new Date("2025-01-08T23:15:00"),
    achievementRate: 60,
    journal:
      "少しダラダラしてしまった。午後からの切り替えが遅かったのが反省点。デトックス機能を自分で使うのが楽しみ。",
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "log-003",
    userId: mockUser.id,
    date: new Date(new Date().setDate(today.getDate() - 3)), // 3 days ago
    commitTime: new Date("2025-01-07T22:00:00"),
    achievementRate: 100,
    journal:
      "最高のスタートが切れた！要件定義もしっかりできたし、モチベーションが高い。この調子で12週間走り切りたい。",
    imageUrl:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ---------------------------
// 5. Timeline (Friends' DailyLog)
// ---------------------------
// We need an extended type to include User info for the feed
export type DailyLogWithUser = DailyLog & { user: User };

export const mockTimeline: DailyLogWithUser[] = [
  {
    id: "friend-log-01",
    userId: "user-002",
    date: new Date(),
    commitTime: new Date("2025-01-10T21:45:00"),
    achievementRate: 90,
    journal: "ランニング5km達成！継続は力なり。",
    imageUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "user-002",
      name: "Yuki Fitness",
      email: "yuki@example.com",
      emailVerified: null,
      image: "https://i.pravatar.cc/150?u=yuki",
      bio: "毎日走る！",
      wakeUpTime: "06:00",
      bedTime: "22:30",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: "friend-log-02",
    userId: "user-003",
    date: new Date(),
    commitTime: new Date("2025-01-10T23:00:00"),
    achievementRate: 75,
    journal: "英語の勉強、単語帳30ページ進んだ。明日は文法をやる。",
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "user-003",
      name: "Ken Study",
      email: "ken@example.com",
      emailVerified: null,
      image: "https://i.pravatar.cc/150?u=ken",
      bio: "TOEIC 900点目指してます",
      wakeUpTime: "07:00",
      bedTime: "23:30",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: "friend-log-03",
    userId: "user-004",
    date: new Date(),
    commitTime: new Date("2025-01-10T22:15:00"),
    achievementRate: 100,
    journal: "コード書きまくった！バグも解消できてスッキリ。",
    imageUrl:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "user-004",
      name: "Dev Taro",
      email: "taro@example.com",
      emailVerified: null,
      image: "https://i.pravatar.cc/150?u=taro",
      bio: "Webエンジニア",
      wakeUpTime: "08:00",
      bedTime: "00:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];
