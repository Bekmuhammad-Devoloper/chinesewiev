import { NextRequest, NextResponse } from "next/server";
import { getDataPath, readJsonFile, mutateJsonFile } from "@/lib/data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

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

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "CW-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// GET /api/users — admin only (returns full user records with keys/devices/phones).
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id");
  const users = readJsonFile<UserRecord[]>(getDataPath(DATA_FILE), []);
  if (id) {
    const user = users.find((u) => u.id === id);
    if (!user) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(user);
  }
  return NextResponse.json(users);
}

// POST /api/users — create user + auto-generate key (admin only)
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  let created: UserRecord | null = null;
  await mutateJsonFile<UserRecord[]>(getDataPath(DATA_FILE), (users) => {
    created = {
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
    return [...users, created];
  }, []);
  return NextResponse.json(created, { status: 201 });
}

// PUT /api/users?id=xxx — update user (admin only)
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id kerak" }, { status: 400 });

  const body = (await req.json()) as Record<string, unknown>;
  let updated: UserRecord | null = null;
  let notFound = false;
  await mutateJsonFile<UserRecord[]>(getDataPath(DATA_FILE), (users) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) { notFound = true; return users; }
    const patch = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined)
    );
    const next = users.slice();
    next[idx] = { ...users[idx], ...patch, id } as UserRecord;
    updated = next[idx];
    return next;
  }, []);
  if (notFound) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE /api/users?id=xxx (admin only)
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id kerak" }, { status: 400 });

  let removed = false;
  await mutateJsonFile<UserRecord[]>(getDataPath(DATA_FILE), (users) => {
    const next = users.filter((u) => u.id !== id);
    removed = next.length !== users.length;
    return next;
  }, []);
  if (!removed) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ success: true });
}
