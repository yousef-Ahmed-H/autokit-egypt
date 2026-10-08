"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { saveContentFaqs, listContentFaqs } from "@/lib/content/store";
import type { FaqGroup, FaqItem } from "@/lib/types";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function lines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseFaqLines(raw: string): FaqItem[] {
  return lines(raw).map((line) => {
    const [q, ...rest] = line.split("|");
    return { question: (q ?? "").trim(), answer: rest.join("|").trim() };
  });
}

export async function saveFaqsAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("content.manage");
  const current = await listContentFaqs();
  const groups: FaqGroup[] = current.map((g) => ({
    ...g,
    title: str(formData, `title_${g.id}`) || g.title,
    items: parseFaqLines(str(formData, `items_${g.id}`)),
  }));

  if (!groups.some((g) => g.id === "general")) {
    groups.push({ id: "general", title: "عام", items: parseFaqLines(str(formData, "items_general") || "") });
  }

  await saveContentFaqs(groups);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "faqs", summary: "تحديث الأسئلة الشائعة" },
  );

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs?ok=" + encodeURIComponent("تم حفظ الأسئلة الشائعة"));
}

export async function addFaqGroupAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("content.manage");
  const title = str(formData, "title");
  const id = randomUUID().slice(0, 8);
  const current = await listContentFaqs();
  const groups = [...current, { id, title: title || "مجموعة جديدة", items: [] }];
  await saveContentFaqs(groups);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "create", entity: "faqs", summary: "إضافة مجموعة أسئلة" },
  );
  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}