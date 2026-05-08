import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getUploadDir } from "@/lib/data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const MAX_IMAGE_DIMENSION = 1600;
const JPG_QUALITY = 80;
const PNG_QUALITY = 80;
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    // Reject early on Content-Length so we never buffer 500 MB into memory.
    const lenHeader = req.headers.get("content-length");
    if (lenHeader && Number(lenHeader) > MAX_BYTES + 1024) {
      return NextResponse.json({ error: "Fayl hajmi 10MB dan oshmasligi kerak" }, { status: 413 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    // Validate file type. SVG is intentionally excluded — it can carry inline
    // <script> that runs same-origin from /assets/, an XSS vector.
    const allowedTypes = [
      "image/png", "image/jpeg", "image/jpg", "image/webp",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/aac",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Faqat rasm (PNG, JPG, WEBP) yoki audio (MP3, WAV, OGG, M4A) fayllari ruxsat etilgan" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Fayl hajmi 10MB dan oshmasligi kerak" }, { status: 413 });
    }

    // Generate unique filename. Sanitize the basename — strip path separators
    // and limit length so a maliciously long/traversal-style name cannot
    // escape the upload dir or fill the FS with one filename.
    const rawExt = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const ext = rawExt || ".bin";
    const baseRaw = path.basename(file.name, path.extname(file.name));
    const safeBase = baseRaw
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .toLowerCase() || "file";
    const timestamp = Date.now();
    const filename = `${timestamp}-${safeBase}${ext}`;

    // Determine subfolder based on type
    const isAudio = file.type.startsWith("audio/");
    const subDir = isAudio ? "words" : undefined;

    // Save to public/assets/ (or public/assets/words/ for audio)
    const uploadDir = getUploadDir(subDir);

    const filePath = path.join(uploadDir, filename);
    let buffer = Buffer.from(await file.arrayBuffer());

    // Rasm bo'lsa avtomatik kichraytirish
    if (!isAudio) {
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
