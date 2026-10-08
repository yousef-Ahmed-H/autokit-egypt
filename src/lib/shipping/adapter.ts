import type {
  ShipmentDraft,
  ShipmentResult,
  ShippingAdapterId,
} from "@/lib/shipping/types";

/**
 * Shipping Adapter — واجهة موحّدة للربط مستقبلًا مع شركات الشحن.
 *
 * الحالة الحالية: كل الشركات غير متصلة.
 * - `manual`: إدخال يدوي من لوحة التحكم (لا API).
 * - `bosta` / `mylerz` / `aramex`: هيكل جاهز، لكن التنفيذ لا يُرسل أي شحنة
 *   إلا بعد ضبط المفاتيح وموافقة المشرف. لا بيانات وهمية ولا إرسال فعلي.
 */

export class NotConfiguredError extends Error {
  constructor(adapter: ShippingAdapterId) {
    super(`شركة الشحن «${adapter}» غير مربوطة بعد — أدخل الشحنة يدويًا أو اضبط مفاتيح الاتصال.`);
  }
}

export interface ShippingAdapter {
  id: ShippingAdapterId;
  name: string;
  /** هل المفاتيح مضبوطة في متغيرات البيئة؟ */
  isConfigured: () => boolean;
  /** إنشاء شحنة — لا يُرسل فعليًا في الوضع الحالي */
  createShipment: (draft: ShipmentDraft) => Promise<ShipmentResult>;
  /** هل التتبع مباشر من الشركة؟ */
  liveTracking: boolean;
}

const manualAdapter: ShippingAdapter = {
  id: "manual",
  name: "إدخال يدوي",
  isConfigured: () => true,
  liveTracking: false,
  async createShipment() {
    return { ok: true, live: false };
  },
};

/** Adapter هيكلي لشركة لا يُنفّذ إرسالًا فعليًا */
function createExternalAdapter(
  id: Exclude<ShippingAdapterId, "manual">,
  name: string,
  envKeys: string[],
): ShippingAdapter {
  return {
    id,
    name,
    liveTracking: true,
    isConfigured: () => envKeys.every((key) => Boolean(process.env[key])),
    async createShipment() {
      const configured = envKeys.every((key) => Boolean(process.env[key]));
      if (!configured) throw new NotConfiguredError(id);
      // لا نُرسل أي شحنة فعلية: التكامل الحقيقي يتطلب موافقة المشرف الصريحة
      return {
        ok: false,
        error: `التكامل مع «${name}» جاهز هيكليًا لكنه غير مفعّل — يتطلب موافقة المشرف قبل إرسال أي شحنة.`,
      };
    },
  };
}

const ADAPTERS: Record<ShippingAdapterId, ShippingAdapter> = {
  manual: manualAdapter,
  bosta: createExternalAdapter("bosta", "Bosta", ["BOSTA_API_KEY"]),
  mylerz: createExternalAdapter("mylerz", "Mylerz", ["MYLERZ_API_KEY"]),
  aramex: createExternalAdapter("aramex", "Aramex", [
    "ARAMEX_USERNAME",
    "ARAMEX_PASSWORD",
    "ARAMEX_ACCOUNT_NUMBER",
  ]),
};

export function getShippingAdapter(id: ShippingAdapterId): ShippingAdapter {
  return ADAPTERS[id] ?? manualAdapter;
}

export function listShippingAdapters(): ShippingAdapter[] {
  return Object.values(ADAPTERS);
}