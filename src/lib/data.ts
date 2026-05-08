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

// Distinguishes "file legitimately missing" (ok, return fallback) from
// "file present but unreadable / unparseable" (NOT ok, must propagate so the
// caller does not silently overwrite real data with a seed).
class JsonReadError extends Error {
  constructor(msg: string, readonly cause: unknown) { super(msg); }
}

export function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    throw new JsonReadError(`stat failed for ${filePath}`, err);
  }
  const cached = jsonCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached.value as T;
  }
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new JsonReadError(`read failed for ${filePath}`, err);
  }
  let value: T;
  try {
    value = JSON.parse(raw) as T;
  } catch (err) {
    throw new JsonReadError(`parse failed for ${filePath} (${stat.size} bytes)`, err);
  }
  jsonCache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size, value });
  return value;
}

// Atomic write via tmp + rename so a crash mid-write cannot leave a
// half-written/corrupt file in place. Also keeps a rolling .bak copy of the
// last good version as a safety net for accidental destructive writes.
export function writeJsonFile<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(data, null, 2);
  const tmp = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmp, json, "utf-8");
  if (fs.existsSync(filePath)) {
    try { fs.copyFileSync(filePath, `${filePath}.bak`); } catch {}
  }
  fs.renameSync(tmp, filePath);
  jsonCache.delete(filePath);
}

// Per-file write queues. Two concurrent admin saves on the same JSON
// previously raced read-modify-write: A reads, B reads (same data), A writes,
// B writes — A's edit silently lost. mutateJsonFile chains read+modify+write
// inside a single critical section per filePath, eliminating the race within
// one Node process (PM2 fork mode runs one instance, so this is sufficient
// for the current setup).
const writeQueues = new Map<string, Promise<unknown>>();

export async function mutateJsonFile<T>(
  filePath: string,
  mutator: (data: T) => T | Promise<T>,
  fallback: T,
): Promise<T> {
  const prev = writeQueues.get(filePath) ?? Promise.resolve();
  // Run sequentially regardless of whether the previous run resolved or rejected.
  const next = prev.then(
    () => runMutation<T>(filePath, mutator, fallback),
    () => runMutation<T>(filePath, mutator, fallback),
  );
  writeQueues.set(filePath, next);
  next.finally(() => {
    if (writeQueues.get(filePath) === next) writeQueues.delete(filePath);
  });
  return next;
}

async function runMutation<T>(
  filePath: string,
  mutator: (data: T) => T | Promise<T>,
  fallback: T,
): Promise<T> {
  // Re-read inside the lock so we work against the latest on-disk state.
  const current = readJsonFile<T>(filePath, fallback);
  const updated = await mutator(current);
  writeJsonFile(filePath, updated);
  return updated;
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
