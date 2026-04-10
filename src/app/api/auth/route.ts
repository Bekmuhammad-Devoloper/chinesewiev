import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, writeJsonFile } from "@/lib/data";

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

function readUsers(): UserRecord[] {
  return readJsonFile<UserRecord[]>(getDataPath(DATA_FILE), []);
}

function writeUsers(users: UserRecord[]) {
  writeJsonFile(getDataPath(DATA_FILE), users);
}

// POST /api/auth — kalit orqali login
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, deviceId } = body;

  if (!key) {
    return NextResponse.json({ error: "Kalit kiritilmagan" }, { status: 400 });
  }

  const users = readUsers();
  const user = users.find((u) => u.key === key);

  if (!user) {
    return NextResponse.json({ error: "Kalit topilmadi" }, { status: 404 });
  }

  if (!user.active) {
    return NextResponse.json({ error: "Kalit bloklangan" }, { status: 403 });
  }

  // Muddati tekshirish
  if (new Date(user.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Kalit muddati tugagan" }, { status: 403 });
  }

  // Device tekshirish
  if (deviceId && !user.devices.includes(deviceId)) {
    if (user.devices.length >= user.maxDevices) {
      return NextResponse.json(
        { error: `Maksimum ${user.maxDevices} ta qurilma ruxsat etilgan` },
        { status: 403 }
      );
    }
    // Yangi deviceni qo'shish
    user.devices.push(deviceId);
    const idx = users.findIndex((u) => u.id === user.id);
    users[idx] = user;
    writeUsers(users);
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
