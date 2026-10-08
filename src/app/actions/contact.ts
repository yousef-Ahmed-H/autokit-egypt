"use server";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { ContactState } from "@/app/actions/contact-state";

const DATA_DIR = path.join(process.cwd(), ".data");
const MESSAGES_FILE = path.join(DATA_DIR, "contact-messages.json");

/**
 * استقبال رسائل التواصل.
 * ⚠️ يُحفظ محليًا كبيانات تطوير في `.data/contact-messages.json`
 * حتى يتم ربط جدول `contact_messages` في قاعدة البيانات.
 */
export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const field = (key: string) => String(formData.get(key) ?? "").trim();

  const name = field("name");
  const email = field("email");
  const phone = field("phone");
  const subject = field("subject");
  const message = field("message");

  const issues: { field: string; message: string }[] = [];

  if (name.length < 3) issues.push({ field: "name", message: "الاسم مطلوب (3 أحرف على الأقل)" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    issues.push({ field: "email", message: "البريد الإلكتروني غير صحيح" });
  }
  if (phone && !/^01[0125]\d{8}$/.test(phone)) {
    issues.push({ field: "phone", message: "رقم الموبايل غير صحيح (01xxxxxxxxx)" });
  }
  if (!email && !phone) {
    issues.push({ field: "email", message: "أدخل بريدًا إلكترونيًا أو رقم موبايل للتواصل" });
  }
  if (message.length < 10) {
    issues.push({ field: "message", message: "اكتب رسالتك (10 أحرف على الأقل)" });
  }

  const values = { name, email, phone, subject, message };

  if (issues.length > 0) {
    return { status: "error", issues, message: "راجع الحقول المطلوبة", values };
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let list: unknown[] = [];
    try {
      const raw = await fs.readFile(MESSAGES_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
    list.push({ ...values, createdAt: new Date().toISOString(), demo: true });
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    return {
      status: "error",
      issues: [],
      message: "تعذّر إرسال الرسالة الآن — حاول مرة أخرى",
      values,
    };
  }

  return {
    status: "success",
    issues: [],
    message: "تم استلام رسالتك — سنتواصل معك في أقرب وقت (نسخة تجريبية).",
  };
}