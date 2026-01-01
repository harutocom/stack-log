import { getMonthlyHistory } from "@/app/actions";
import HistoryCalendar from "@/components/HistoryCalendar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function HistoryPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const userId = await getCurrentUser();

  // Parse Query Params or Default to Today
  const now = new Date();
  const yearParam = searchParams.year;
  const monthParam = searchParams.month;

  const year = yearParam ? parseInt(yearParam as string) : now.getFullYear();
  const month = monthParam
    ? parseInt(monthParam as string)
    : now.getMonth() + 1; // 1-based

  // Validate params simple check
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    redirect("/history");
  }

  const historyData = await getMonthlyHistory(year, month);

  return (
    <div className="min-h-screen bg-neutral-50 text-zinc-900 p-6 font-sans">
      <header className="mb-8 max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Review your journey and progress.
        </p>
      </header>

      <HistoryCalendar data={historyData} year={year} month={month} />
    </div>
  );
}
