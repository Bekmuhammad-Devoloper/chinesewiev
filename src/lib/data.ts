import fs from "fs";
import path from "path";

/**
 * Production uchun data fayllarni saqlash joyi.
 * Standalone output da process.cwd() `.next/standalone` bo'ladi,
 * shuning uchun data fayllarini markaziy bir joyda boshqaramiz.
 */
function getDataDir(): string {
  // Production da DATA_DIR env variable ishlatilishi mumkin
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  return path.join(process.cwd(), "data");
}

export function getDataPath(filename: string): string {
  const dir = getDataDir();
  // Papka mavjud bo'lmasa yaratamiz
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

/**
 * JSON faylni xavfsiz o'qish
 */
export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * JSON faylga xavfsiz yozish
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Upload fayllarni saqlash uchun papka
 */
export function getUploadDir(subDir?: string): string {
  const baseDir = path.join(process.cwd(), "public", "assets");
  const dir = subDir ? path.join(baseDir, subDir) : baseDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
