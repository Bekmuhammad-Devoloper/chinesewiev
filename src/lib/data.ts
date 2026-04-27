import fs from "fs";
import path from "path";

function getDataDir(): string {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data");
}

export function getDataPath(filename: string): string {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

type CacheEntry = { mtimeMs: number; size: number; value: unknown };
const jsonCache = new Map<string, CacheEntry>();

export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const stat = fs.statSync(filePath);
    const cached = jsonCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.value as T;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const value = JSON.parse(raw) as T;
    jsonCache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size, value });
    return value;
  } catch {
    return fallback;
  }
}

export function writeJsonFile<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  jsonCache.delete(filePath);
}

/**
 * Upload fayllarni saqlash uchun papka
 */
export function getUploadDir(subDir?: string): string {
  const baseDir = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "assets");
  const dir = subDir ? path.join(baseDir, subDir) : baseDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
