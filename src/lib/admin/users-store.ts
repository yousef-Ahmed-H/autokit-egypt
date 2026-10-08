import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/admin/json-store";
import { hashPassword, verifyPassword } from "@/lib/admin/passwords";
import type { AdminRole, AdminUser, AdminUserPublic } from "@/lib/admin/types";
import { toPublicUser } from "@/lib/admin/types";

/**
 * مخزن مستخدمي لوحة التحكم (تطوير فقط — ملف JSON).
 * عند ربط Supabase استبدل هذه الدوال باستعلامات جدولي `users` و`admin_roles`.
 */

const store = createJsonStore<AdminUser[]>("admin-users.json", []);

/** حسابات تجريبية لكل دور — تُنشأ مرة واحدة فقط عند أول تشغيل */
export const DEMO_ACCOUNTS: { email: string; password: string; role: AdminRole; name: string }[] = [
  { email: "owner@autokit.demo", password: "Owner@2026", role: "owner", name: "مالك المتجر (تجريبي)" },
  { email: "admin@autokit.demo", password: "Admin@2026", role: "admin", name: "مدير المتجر (تجريبي)" },
  { email: "staff@autokit.demo", password: "Staff@2026", role: "staff", name: "موظف تجهيز (تجريبي)" },
  { email: "support@autokit.demo", password: "Support@2026", role: "support", name: "دعم العملاء (تجريبي)" },
];

function seedUsers(): AdminUser[] {
  const now = new Date().toISOString();
  return DEMO_ACCOUNTS.map((acc) => ({
    id: randomUUID(),
    email: acc.email.toLowerCase(),
    name: acc.name,
    role: acc.role,
    passwordHash: hashPassword(acc.password),
    active: true,
    demo: true as const,
    createdAt: now,
    updatedAt: now,
  }));
}

let seeded = false;

/** هل نزرع حسابات الديمو؟ (ديمو في التطوير فقط، ما لم يُطلب صراحةً) */
function shouldSeedDemo(): boolean {
  if (process.env.ADMIN_DEMO_SEED === "false") return false;
  if (process.env.ADMIN_DEMO_SEED === "true") return true;
  return process.env.NODE_ENV !== "production";
}

/**
 * تهيئة المخزن عند أول تشغيل فقط:
 * - في الديمو: نزرع حسابات تجريبية لكل دور.
 * - في الإنتاج: نُنشئ أول مالك من متغيرات البيئة (ADMIN_BOOTSTRAP_*) بدل بيانات وهمية.
 */
async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const users = await store.read();
  if (users.length > 0) return;

  if (shouldSeedDemo()) {
    await store.write(seedUsers());
    return;
  }

  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
  if (email && password.length >= 8) {
    const now = new Date().toISOString();
    await store.write([
      {
        id: randomUUID(),
        email,
        name: (process.env.ADMIN_BOOTSTRAP_NAME || "المالك").trim(),
        role: "owner",
        passwordHash: hashPassword(password),
        active: true,
        demo: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

export async function listUsers(): Promise<AdminUserPublic[]> {
  await ensureSeeded();
  const users = await store.read();
  return users.map(toPublicUser);
}

export async function listRawUsers(): Promise<AdminUser[]> {
  await ensureSeeded();
  return store.read();
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  await ensureSeeded();
  const users = await store.read();
  return users.find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  await ensureSeeded();
  const normalized = email.trim().toLowerCase();
  const users = await store.read();
  return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

/** التحقق من بيانات الدخول — يعيد المستخدم عند النجاح */
export async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  const updated = await store.update((users) =>
    users.map((u) => (u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u)),
  );
  return updated.find((u) => u.id === user.id) ?? user;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: AdminRole;
  password: string;
}

export async function createUser(input: CreateUserInput): Promise<AdminUserPublic> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("يوجد مستخدم بنفس البريد الإلكتروني");

  const now = new Date().toISOString();
  const user: AdminUser = {
    id: randomUUID(),
    email,
    name: input.name.trim(),
    role: input.role,
    passwordHash: hashPassword(input.password),
    active: true,
    demo: true,
    createdAt: now,
    updatedAt: now,
  };
  await store.update((users) => [...users, user]);
  return toPublicUser(user);
}

export interface UpdateUserInput {
  name?: string;
  role?: AdminRole;
  active?: boolean;
  password?: string;
  /** null لتعطيل المصادقة الثنائية، أو سر جديد لتفعيلها */
  twoFactorSecret?: string | null;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUserPublic | null> {
  let result: AdminUser | null = null;
  await store.update((users) =>
    users.map((u) => {
      if (u.id !== id) return u;
      const next: AdminUser = {
        ...u,
        name: input.name?.trim() || u.name,
        role: input.role ?? u.role,
        active: input.active ?? u.active,
        passwordHash: input.password ? hashPassword(input.password) : u.passwordHash,
        twoFactorSecret:
          input.twoFactorSecret === null ? undefined : input.twoFactorSecret ?? u.twoFactorSecret,
        updatedAt: new Date().toISOString(),
      };
      result = next;
      return next;
    }),
  );
  return result ? toPublicUser(result as AdminUser) : null;
}

/** عدد المالكين النشطين (لمنع تعطيل آخر مالك) */
export async function countActiveOwners(): Promise<number> {
  const users = await store.read();
  return users.filter((u) => u.role === "owner" && u.active).length;
}

export async function deleteUser(id: string): Promise<boolean> {
  let removed = false;
  await store.update((users) => {
    const next = users.filter((u) => u.id !== id);
    removed = next.length !== users.length;
    return next;
  });
  return removed;
}