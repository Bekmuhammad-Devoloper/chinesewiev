import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, writeJsonFile } from "@/lib/data";

interface DailyView {
  date: string; // "2026-04-04"
  count: number;
}

interface ViewsData {
  daily: DailyView[];
  total: number;
}

const VIEWS_FILE = "views.json";

function getViews(): ViewsData {
  const filePath = getDataPath(VIEWS_FILE);
  return readJsonFile<ViewsData>(filePath, { daily: [], total: 0 });
}

function saveViews(data: ViewsData): void {
  const filePath = getDataPath(VIEWS_FILE);
  writeJsonFile(filePath, data);
}

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// GET — ko'rishlar statistikasini olish
export async function GET() {
  const views = getViews();
  return NextResponse.json(views);
}

// POST — yangi ko'rish yozish
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = (body as { page?: string }).page || "/";

    const views = getViews();
    const today = getTodayStr();

    // Bugungi yozuv bormi?
    const idx = views.daily.findIndex((d) => d.date === today);
    if (idx >= 0) {
      views.daily[idx].count += 1;
    } else {
      views.daily.push({ date: today, count: 1 });
    }

    // Oxirgi 90 kunni saqlash (ortiqchasini o'chirish)
    if (views.daily.length > 90) {
      views.daily = views.daily.slice(-90);
    }

    views.total += 1;

    saveViews(views);

    return NextResponse.json({ ok: true, page, today, total: views.total });
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
