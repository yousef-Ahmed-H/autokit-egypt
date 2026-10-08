import { coupons, computeTotals, findCoupon } from "@/lib/pricing";
import { getProduct } from "@/lib/db/queries";
import { createOrder, findOrderForTracking, listOrders, type NewOrderInput } from "@/lib/orders/store";
import { MAX_QTY_PER_ITEM, PHONE_RE } from "@/lib/orders/rules";
import { GOVERNORATES, type Order, type OrderAddress, type OrderItem } from "@/lib/orders/types";

/** حمولة إتمام الطلب القادمة من الواجهة أو الـ API */
export interface CheckoutPayload {
  fullName?: string;
  phone?: string;
  phone2?: string;
  governorate?: string;
  city?: string;
  village?: string;
  street?: string;
  houseNo?: string;
  floor?: string;
  landmark?: string;
  notes?: string;
  paymentMethod?: string;
  agreement?: boolean;
  couponCode?: string | null;
  items?: { slug: string; quantity: number }[];
  idempotencyKey?: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface CreateOrderResult {
  ok: boolean;
  order?: Order;
  issues: ValidationIssue[];
  /** true إذا أُعيد نفس الطلب بسبب مفتاح تكرار مطابق */
  duplicate: boolean;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * التحقق من الحمولة + إنشاء الطلب.
 * - لا يتم إنشاء الطلب إلا بعد نجاح كل التحققات.
 * - الأسعار تُقرأ من المصدر (الخادم) وتُحفظ كلقطة داخل الطلب.
 * - يُمنع تجاوز المخزون.
 */
export async function createOrderFromPayload(payload: CheckoutPayload): Promise<CreateOrderResult> {
  const issues: ValidationIssue[] = [];

  /* ---------- بيانات المستلم ---------- */
  const fullName = text(payload.fullName);
  const phone = text(payload.phone);
  const phone2 = text(payload.phone2);
  const governorate = text(payload.governorate);
  const city = text(payload.city);

  if (fullName.length < 3) {
    issues.push({ field: "fullName", message: "الاسم الكامل مطلوب (3 أحرف على الأقل)." });
  }

  if (!phone) {
    issues.push({ field: "phone", message: "رقم الموبايل مطلوب." });
  } else if (!PHONE_RE.test(phone)) {
    issues.push({ field: "phone", message: "رقم موبايل مصري غير صحيح (مثال: 01012345678)." });
  }

  if (phone2 && !PHONE_RE.test(phone2)) {
    issues.push({ field: "phone2", message: "رقم الهاتف الإضافي غير صحيح." });
  }

  if (!governorate || !GOVERNORATES.includes(governorate as (typeof GOVERNORATES)[number])) {
    issues.push({ field: "governorate", message: "اختر المحافظة من القائمة" });
  }

  if (city.length < 2) {
    issues.push({ field: "city", message: "المركز / المدينة مطلوب" });
  }

  const street = text(payload.street);
  if (street.length < 3) {
    issues.push({ field: "street", message: "اسم الشارع مطلوب" });
  }

  if (payload.paymentMethod && payload.paymentMethod !== "cod") {
    issues.push({ field: "paymentMethod", message: "طريقة الدفع غير مدعومة (الدفع عند الاستلام فقط)" });
  }

  if (payload.agreement !== true) {
    issues.push({ field: "agreement", message: "يجب الموافقة على شروط الشحن والاستبدال" });
  }

  /* ---------- المنتجات والمخزون ---------- */
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (rawItems.length === 0) {
    issues.push({ field: "items", message: "السلة فارغة — أضف منتجات قبل إتمام الطلب" });
  }

  const orderItems: OrderItem[] = [];

  for (const raw of rawItems) {
    const slug = text(raw?.slug);
    const quantity = Number(raw?.quantity);

    const product = await getProduct(slug);
    if (!product || product.status !== "active") {
      issues.push({ field: "items", message: `منتج غير متاح (${slug || "بدون معرّف"})` });
      continue;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      issues.push({ field: "items", message: `كمية غير صحيحة للمنتج «${product.name}»` });
      continue;
    }

    if (quantity > MAX_QTY_PER_ITEM) {
      issues.push({
        field: "items",
        message: `الحد الأقصى للكمية من «${product.name}» هو ${MAX_QTY_PER_ITEM} قطعة`,
      });
      continue;
    }

    if (product.stock <= 0) {
      issues.push({ field: "items", message: `«${product.name}» غير متوفر حاليًا (نفد المخزون)` });
      continue;
    }

    if (quantity > product.stock) {
      issues.push({
        field: "items",
        message: `الكمية المطلوبة من «${product.name}» تتجاوز المتاح (المتاح: ${product.stock})`,
      });
      continue;
    }

    orderItems.push({
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      image: product.image,
      unitPrice: product.price, // لقطة سعر من الخادم
      quantity,
      lineTotal: product.price * quantity,
    });
  }

  /* ---------- الكوبون ---------- */
  const couponCode = text(payload.couponCode).toUpperCase();
  let coupon = null;
  if (couponCode) {
    const found = findCoupon(couponCode);
    if (!found) {
      issues.push({ field: "couponCode", message: "كود الخصم غير صحيح" });
    } else {
      coupon = found;
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues, duplicate: false };
  }

  /* ---------- الحسابات ---------- */
  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totals = computeTotals({ subtotal, coupon });

  const address: OrderAddress = {
    fullName,
    phone,
    phone2: phone2 || undefined,
    governorate,
    city,
    village: text(payload.village) || undefined,
    street,
    houseNo: text(payload.houseNo) || undefined,
    floor: text(payload.floor) || undefined,
    landmark: text(payload.landmark) || undefined,
    notes: text(payload.notes) || undefined,
  };

  /* ---------- منع التكرار ---------- */
  const idempotencyKey = text(payload.idempotencyKey) || undefined;
  let existing: Order | undefined;

  if (idempotencyKey) {
    const orders = await listOrders();
    existing = orders.find((o) => o.idempotencyKey === idempotencyKey);
  }

  if (existing) {
    return { ok: true, order: existing, issues: [], duplicate: true };
  }

  const input: NewOrderInput = { address, items: orderItems, totals, idempotencyKey };
  const order = await createOrder(input);

  return { ok: true, order, issues: [], duplicate: false };
}

/** تتبّع طلب برقم الطلب + الهاتف */
export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  if (!orderNumber || !phone) return null;
  return findOrderForTracking(orderNumber, phone);
}

export { coupons, GOVERNORATES, MAX_QTY_PER_ITEM };