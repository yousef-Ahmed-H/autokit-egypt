import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * مخزن JSON بسيط (تطوير فقط) مع كاش في الذاكرة وسلسلة كتابة.
 * يُستخدم لحين ربط قاعدة البيانات. استبدله باستعلامات Supabase عند التفعيل.
 */

export const DATA_DIR = path.join(process.cwd(), ".data");

export interface JsonStore<T> {
  read: () => Promise<T>;
  write: (value: T) => Promise<void>;
  update: (fn: (current: T) => T | Promise<T>) => Promise<T>;
}

export function createJsonStore<T>(fileName: string, fallback: T): JsonStore<T> {
  const file = path.join(DATA_DIR, fileName);

  let cache: T | null = null;
  let queue: Promise<unknown> = Promise.resolve();

  function serialize<R>(task: () => Promise<R>): Promise<R> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  async function readFile(): Promise<T> {
    if (cache !== null) return cache;
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw) as T;
      cache = parsed ?? fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  }

  async function writeFile(value: T): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
    cache = value;
  }

  return {
    read: () => serialize(readFile),
    write: (value: T) => serialize(() => writeFile(value)),
    update: (fn) =>
      serialize(async () => {
        const current = await readFile();
        const next = await fn(current);
        await writeFile(next);
        return next;
      }),
  };
}