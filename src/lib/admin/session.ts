import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminRole, AdminSession } from "@/lib/admin/types";

/**
 * جلسة المشرف: كوكي موقّع (HMAC-SHA256) على الخادم فقط.
 * لا تُخزَّن أي صلاحيات داخل الكوكي — يُعاد قراءة الدور من المخزن في كل طلب
 * حتى تُطبَّق تغييرات الصلاحيات فورًا.
 */

export const SESSION_COOKIE = "ak_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 ساعات

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 16) return value;
  // في الإنتاج نفشل مغلقًا بدل استخدام سرّ معرّوف.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET غير مضبوط أو قصير (مطلوب 16 حرفًا على الأقل في الإنتاج).",
    );
  }
  // سرّ تطوير فقط — يُستبدل إجباريًا في الإنتاج أعلاه.
  return "autokit-dev-session-secret-change-me";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export interface SessionPayload {
  userId: string;
  role: AdminRole;
  email: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
}

export function createSessionToken(user: {
  id: string;
  role: AdminRole;
  email: string;
  name: string;
}): { token: string; maxAge: number } {
  const now = Date.now();
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  };

  const body = b64url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return { token: `${body}.${signature}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || typeof payload.expiresAt !== "number") return null;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function toAdminSession(payload: SessionPayload): AdminSession {
  return {
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
    name: payload.name,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  };
}