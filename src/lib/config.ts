/**
 * إعدادات عامة آمنة للعميل والخادم.
 *
 * `IS_DEMO` يتحكم في إظهار بيانات/وسوم الديمو.
 * افتراضيًا: ديمو في التطوير فقط، وإنتاج في النشر.
 * يمكن تجاوزه صراحةً عبر NEXT_PUBLIC_DEMO_MODE=true|false.
 */
function readDemoMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const IS_DEMO = readDemoMode();