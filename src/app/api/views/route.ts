import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, mutateJsonFile } from "@/lib/data";

export const dynamic = "force-dynamic";

interface DailyView {
  date: string; // "2026-04-04"
  count: number;
}

interface ViewsData {
  daily: DailyView[];
  total: number;
}

const VIEWS_FILE = "views.json";
const EMPTY: ViewsData = { daily: [], total: 0 };

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// GET — ko'rishlar statistikasini olish
export async function GET() {
  const views = readJsonFile<ViewsData>(getDataPath(VIEWS_FILE), EMPTY);
  return NextResponse.json(views);
}

// POST — yangi ko'rish yozish (concurrent page loads can stack up; the lock
// in mutateJsonFile serializes them so increments aren't dropped).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = (body as { page?: string }).page || "/";
    const today = getTodayStr();

    let total = 0;
    await mutateJsonFile<ViewsData>(getDataPath(VIEWS_FILE), (views) => {
      const daily = views.daily.slice();
      const idx = daily.findIndex((d) => d.date === today);
      if (idx >= 0) {
        daily[idx] = { ...daily[idx], count: daily[idx].count + 1 };
      } else {
        daily.push({ date: today, count: 1 });
      }
      const trimmed = daily.length > 90 ? daily.slice(-90) : daily;
      total = views.total + 1;
      return { daily: trimmed, total };
    }, EMPTY);

    return NextResponse.json({ ok: true, page, today, total });
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
