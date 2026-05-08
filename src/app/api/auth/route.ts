import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, mutateJsonFile } from "@/lib/data";

export const dynamic = "force-dynamic";

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  course: string;
  lessonId?: number;
  key: string;
  devices: string[];
  maxDevices: number;
  active: boolean;
  createdAt: string;
  expiresAt: string;
}

const DATA_FILE = "users-data.json";

// POST /api/auth — kalit orqali login
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, deviceId } = body;

  if (!key) {
    return NextResponse.json({ error: "Kalit kiritilmagan" }, { status: 400 });
  }

  // Snapshot read first to validate the key + return early on auth failures
  // without acquiring the write lock unnecessarily.
  const users = readJsonFile<UserRecord[]>(getDataPath(DATA_FILE), []);
  const user = users.find((u) => u.key === key);

  if (!user) return NextResponse.json({ error: "Kalit topilmadi" }, { status: 404 });
  if (!user.active) return NextResponse.json({ error: "Kalit bloklangan" }, { status: 403 });
  if (new Date(user.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Kalit muddati tugagan" }, { status: 403 });
  }

  // Device registration is the only mutation. Do it inside the write lock so
  // concurrent logins from different devices cannot drop one another's id.
  if (deviceId && !user.devices.includes(deviceId)) {
    let exceeded = false;
    await mutateJsonFile<UserRecord[]>(getDataPath(DATA_FILE), (latest) => {
      const idx = latest.findIndex((u) => u.id === user.id);
      if (idx === -1) return latest;
      const u = latest[idx];
      if (u.devices.includes(deviceId)) return latest;
      if (u.devices.length >= u.maxDevices) { exceeded = true; return latest; }
      const next = latest.slice();
      next[idx] = { ...u, devices: [...u.devices, deviceId] };
      return next;
    }, []);
    if (exceeded) {
      return NextResponse.json(
        { error: `Maksimum ${user.maxDevices} ta qurilma ruxsat etilgan` },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      course: user.course,
      lessonId: user.lessonId || null,
      expiresAt: user.expiresAt,
    },
  });
}
