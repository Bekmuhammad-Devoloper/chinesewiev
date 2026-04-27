import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getUploadDir } from "@/lib/data";

export const dynamic = "force-dynamic";

const MAX_IMAGE_DIMENSION = 1600;
const JPG_QUALITY = 80;
const PNG_QUALITY = 80;

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
    let buffer = Buffer.from(await file.arrayBuffer());

    // Rasm bo'lsa avtomatik kichraytirish (SVG ham audio ham emas)
    if (!isAudio && file.type !== "image/svg+xml") {
      try {
        let pipeline = sharp(buffer, { failOn: "none" }).rotate();
        const meta = await sharp(buffer).metadata();
        if (
          (meta.width && meta.width > MAX_IMAGE_DIMENSION) ||
          (meta.height && meta.height > MAX_IMAGE_DIMENSION)
        ) {
          pipeline = pipeline.resize({
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          });
        }
        let out: Buffer;
        if (file.type === "image/png") {
          out = await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
        } else if (file.type === "image/webp") {
          out = await pipeline.webp({ quality: 82 }).toBuffer();
        } else {
          out = await pipeline.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
        }
        buffer = Buffer.from(out);
      } catch (err) {
        console.error("Image resize failed, saving original:", err);
      }
    }

    fs.writeFileSync(filePath, buffer);

    const publicUrl = subDir ? `/assets/${subDir}/${filename}` : `/assets/${filename}`;

    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
