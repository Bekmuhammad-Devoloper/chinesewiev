import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, writeJsonFile } from "@/lib/data";

export interface UserRecord {
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

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "CW-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// GET /api/users — all users
// GET /api/users?id=xxx — one user
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const users = readUsers();
  if (id) {
    const user = users.find((u) => u.id === id);
    if (!user) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(user);
  }
  return NextResponse.json(users);
}

// POST /api/users — create user + auto-generate key
export async function POST(req: NextRequest) {
  const body = await req.json();
  const users = readUsers();

  const newUser: UserRecord = {
    id: `u-${Date.now()}`,
    name: body.name || "",
    phone: body.phone || "",
    telegram: body.telegram || "",
    course: body.course || "",
    lessonId: body.lessonId || undefined,
    key: body.key || generateKey(),
    devices: [],
    maxDevices: body.maxDevices ?? 2,
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
    expiresAt: body.expiresAt || new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return NextResponse.json(newUser, { status: 201 });
}

// PUT /api/users?id=xxx — update user
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id kerak" }, { status: 400 });

  const body = await req.json();
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  users[idx] = { ...users[idx], ...body, id };
  writeUsers(users);
  return NextResponse.json(users[idx]);
}

// DELETE /api/users?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id kerak" }, { status: 400 });

  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  writeUsers(filtered);
  return NextResponse.json({ success: true });
}
