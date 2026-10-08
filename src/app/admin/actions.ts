"use server";

import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/admin/audit";
import { endSession, getCurrentAdmin, startSession } from "@/lib/admin/auth";
import { verifyTotp } from "@/lib/admin/totp";
import { authenticate } from "@/lib/admin/users-store";
import type { LoginState } from "@/app/admin/login-state";

/**
 * Rate Limiting بسيط لتسجيل الدخول (في الذاكرة — للتطوير).
 * في الإنتاج يُستخدم Redis أو حد أقصى عبر Middleware/WAF.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function tooManyAttempts(key: string): boolean {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function registerFailure(key: string): void {
  const record = attempts.get(key);
  if (!record || Date.now() - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  record.count += 1;
}

function clearFailures(key: string): void {
  attempts.delete(key);
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !password) {
    return { error: "أدخل البريد وكلمة المرور" };
  }

  const limitKey = `login:${email}`;
  if (tooManyAttempts(limitKey)) {
    await writeAudit(
      { actorId: "system", actorEmail: email, actorRole: "support" },
      { action: "login_failed", entity: "admin_user", summary: `تجاوز عدد محاولات الدخول لحساب ${email}` },
    );
    return { error: "تم تجاوز عدد المحاولات المسموح. حاول بعد 10 دقائق." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    registerFailure(limitKey);
    await writeAudit(
      { actorId: "system", actorEmail: email, actorRole: "support" },
      { action: "login_failed", entity: "admin_user", summary: `فشل تسجيل دخول: ${email}` },
    );
    return { error: "بيانات الدخول غير صحيحة" };
  }

  // المصادقة الثنائية إن كانت مفعّلة لهذا المستخدم
  if (user.twoFactorSecret) {
    if (!code) {
      return { need2fa: true, email, error: undefined };
    }
    if (!verifyTotp(user.twoFactorSecret, code)) {
      registerFailure(limitKey);
      await writeAudit(
        { actorId: user.id, actorEmail: user.email, actorRole: user.role },
        { action: "login_failed", entity: "admin_user", summary: `رمز مصادقة ثنائية خاطئ: ${user.email}` },
      );
      return { need2fa: true, email, error: "رمز المصادقة غير صحيح" };
    }
  }

  clearFailures(limitKey);
  await startSession(user);
  await writeAudit(
    { actorId: user.id, actorEmail: user.email, actorRole: user.role },
    { action: "login", entity: "admin_user", entityId: user.id, summary: `تسجيل دخول ناجح: ${user.email}` },
  );

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const admin = await getCurrentAdmin();
  if (admin) {
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "logout", entity: "admin_user", entityId: admin.userId, summary: `تسجيل خروج: ${admin.email}` },
    );
  }
  await endSession();
  redirect("/admin/login");
}