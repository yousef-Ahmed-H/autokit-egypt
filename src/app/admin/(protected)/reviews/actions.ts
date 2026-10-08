"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";

const KEY = "reviews";
const DATA_DIR = ".data";

async function readReviews(): Promise<any[]> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const file = path.join(process.cwd(), DATA_DIR, "reviews.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeReviews(list: any[]): Promise<void> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), DATA_DIR);
  const file = path.join(dir, "reviews.json");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf8");
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("reviews.manage");
  const id = str(formData, "id");
  const list = await readReviews();
  await writeReviews(list.filter((r: any) => r.id !== id));
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "delete", entity: "review", entityId: id, summary: "حذف تقييم" },
  );
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}