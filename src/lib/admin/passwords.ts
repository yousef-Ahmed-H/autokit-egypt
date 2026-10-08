import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * تجزئة كلمات المرور (scrypt) — تعمل على الخادم فقط.
 * الصيغة: scrypt$N$r$p$saltHex$hashHex
 */

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, n, r, p, saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** التحقق من قوة كلمة المرور (سياسة بسيطة) */
export function checkPasswordStrength(password: string): string | null {
  if (password.length < 8) return "كلمة المرور يجب ألا تقل عن 8 أحرف";
  if (!/[A-Za-z]/.test(password)) return "يجب أن تحتوي على حرف واحد على الأقل";
  if (!/[0-9]/.test(password)) return "يجب أن تحتوي على رقم واحد على الأقل";
  return null;
}