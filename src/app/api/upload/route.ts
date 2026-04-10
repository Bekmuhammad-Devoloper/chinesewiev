import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUploadDir } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/aac",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Faqat rasm (PNG, JPG, WEBP, SVG) yoki audio (MP3, WAV, OGG, M4A) fayllari ruxsat etilgan" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fayl hajmi 10MB dan oshmasligi kerak" }, { status: 400 });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `${timestamp}-${safeName}`;

    // Determine subfolder based on type
    const isAudio = file.type.startsWith("audio/");
    const subDir = isAudio ? "words" : undefined;

    // Save to public/assets/ (or public/assets/words/ for audio)
    const uploadDir = getUploadDir(subDir);

    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = subDir ? `/assets/${subDir}/${filename}` : `/assets/${filename}`;

    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
