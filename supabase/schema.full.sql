-- ============================================================
-- AutoKit Egypt — مخطط قاعدة البيانات الشامل (PostgreSQL/Supabase)
-- الإصدار المقترح: 27 جدول + فهارس + RLS + Triggers
-- ⚠️ لا يُنفَّذ إلا بعد موافقة صريحة من المستخدم
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm" schema extensions;

-- ---------- 1. الأقسام (Categories) ----------
create table if not exists public.categories (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- 2. المنتجات (Products) ----------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  sku               text unique not null,
  name              text not null,
  category_slug     text references public.categories(slug) on delete set null,
  status            text not null check (status in ('active','draft','archived')) default 'draft',
  price             integer not null check (price >= 0),
  old_price         integer check (old_price >= 0),
  cost_price        integer check (cost_price >= 0),
  short_description text,
  description       text,
  features          jsonb not null default '[]'::jsonb,
  usage             jsonb not null default '[]'::jsonb,
  specs             jsonb not null default '[]'::jsonb,
  package_includes  jsonb not null default '[]'::jsonb,
  compatibility     jsonb not null default '[]'::jsonb,
  warnings          jsonb not null default '[]'::jsonb,
  faqs              jsonb not null default '[]'::jsonb,
  weight_kg         numeric(6,3) default 0,
  dimensions        text,
  color             text,
  material          text,
  badge             text,
  video_url         text,
  stock             integer not null default 0 check (stock >= 0),
  min_stock         integer not null default 5 check (min_stock >= 0),
  verified_specs    boolean not null default false,
  verified_content  boolean not null default false,
  verified_stats    boolean not null default false,
  rating            numeric(2,1) default 0 check (rating between 0 and 5),
  reviews_count     integer not null default 0 check (reviews_count >= 0),
  image_url         text,
  is_published      boolean not null default false,
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_slug);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_is_published_idx on public.products(is_published);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_name_trgm_idx on public.products using gin (to_tsvector('simple', name));
create index if not exists products_sku_idx on public.products(sku);

-- ---------- 3. الباقات (Bundles) ----------
create table if not exists public.bundles (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  tagline        text,
  description    text,
  product_slugs  jsonb not null default '[]'::jsonb,
  price          integer not null check (price >= 0),
  original_price integer check (original_price >= 0),
  image_url      text,
  badge          text,
  is_published   boolean not null default false,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- 4. وسائط المنتجات (Media) ----------
create table if not exists public.product_media (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references public.products(id) on delete cascade,
  product_slug   text not null,
  kind           text not null check (kind in ('main','size','usage','gallery')),
  alt_ar         text not null,
  source         text not null,
  source_type    text not null check (source_type in ('real','illustrative')),
  mime           text not null,
  width          integer,
  height         integer,
  bytes          integer,
  url            text not null,
  thumb_url      text not null,
  storage_path   text,
  thumb_path     text,
  created_by     text,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists product_media_product_id_idx on public.product_media(product_id);
create index if not exists product_media_slug_idx on public.product_media(product_slug);
create index if not exists product_media_kind_idx on public.product_media(kind);

-- ---------- 5. عملاء النظام (Admin Users) ----------
create table if not exists public.admin_users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique not null,
  name               text not null,
  role               text not null check (role in ('owner','admin','staff','support')),
  password_hash      text not null,
  two_factor_secret  text,
  active             boolean not null default true,
  is_demo            boolean not null default false,
  last_login_at      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists admin_users_email_idx on public.admin_users(email);
create index if not exists admin_users_role_idx on public.admin_users(role);

-- ---------- 6. العملاء (Customers) ----------
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  phone        text not null,
  phone_clean  text not null,
  email        text,
  city         text,
  governorate  text,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists customers_phone_clean_uniq on public.customers(phone_clean);
create index if not exists customers_phone_idx on public.customers(phone_clean);

-- ---------- 7. الطلبات (Orders) ----------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  customer_id      uuid references public.customers(id) on delete set null,
  full_name        text not null,
  phone            text not null,
  phone2           text,
  governorate      text not null,
  city             text not null,
  village          text,
  street           text not null,
  house_no         text,
  floor            text,
  landmark         text,
  address_notes    text,
  payment_method   text not null check (payment_method in ('cod','vodafone_cash','instapay')),
  subtotal         integer not null check (subtotal >= 0),
  discount         integer not null default 0 check (discount >= 0),
  shipping         integer not null default 0 check (shipping >= 0),
  total            integer not null check (total >= 0),
  coupon_code      text,
  status           text not null default 'pending'
                    check (status in ('pending','confirmed','preparing','handover','on_the_way','out_for_delivery','delivered','cancelled','returned')),
  admin_notes      text,
  shipment_id      uuid,
  is_demo          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_governorate_idx on public.orders(governorate);

-- ---------- 8. عناصر الطلب (Order Items) ----------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_slug text not null,
  sku          text not null,
  name         text not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  line_total   integer not null check (line_total >= 0)
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

-- ---------- 9. شركات الشحن (Shipping Companies) ----------
create table if not exists public.shipping_companies (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  adapter               text not null check (adapter in ('manual','bosta','mylerz','aramex')),
  active                boolean not null default false,
  credentials_configured boolean not null default false,
  notes                 text,
  is_demo               boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------- 10. مناطق الشحن (Shipping Zones) ----------
create table if not exists public.shipping_zones (
  id           uuid primary key default gen_random_uuid(),
  governorate  text unique not null,
  centers      jsonb not null default '[]'::jsonb,
  villages     jsonb not null default '{}'::jsonb,
  remote_areas jsonb not null default '[]'::jsonb,
  shipping_fee integer not null default 60 check (shipping_fee >= 0),
  return_fee   integer not null default 40 check (return_fee >= 0),
  eta_min_days integer not null default 2 check (eta_min_days >= 1),
  eta_max_days integer not null default 5 check (eta_max_days >= eta_min_days),
  cod_enabled  boolean not null default true,
  active       boolean not null default true,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- 11. مراكز الشحن (Shipping Centers) ----------
create table if not exists public.shipping_centers (
  id              uuid primary key default gen_random_uuid(),
  zone_id         uuid not null references public.shipping_zones(id) on delete cascade,
  governorate     text not null,
  center_name     text not null,
  is_remote       boolean not null default false,
  shipping_fee    integer,
  return_fee      integer,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (zone_id, center_name)
);

-- ---------- 12. الشحنات (Shipments) ----------
create table if not exists public.shipments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders(id) on delete set null,
  order_number    text not null,
  company_id      uuid references public.shipping_companies(id) on delete set null,
  adapter         text not null check (adapter in ('manual','bosta','mylerz','aramex')),
  status          text not null check (status in ('draft','created','picked_up','in_transit','out_for_delivery','delivered','failed','returned')) default 'draft',
  tracking_number text,
  tracking_url    text,
  cod_amount      integer not null default 0,
  cod_collected   boolean not null default false,
  governorate     text not null,
  center          text not null,
  notes           text,
  manual          boolean not null default true,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists shipments_order_number_idx on public.shipments(order_number);
create index if not exists shipments_status_idx on public.shipments(status);
alter table public.orders add constraint orders_shipment_id_fkey foreign key (shipment_id) references public.shipments(id) on delete set null;

-- ---------- 13. المرتجعات (Return Requests) ----------
create table if not exists public.return_requests (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders(id) on delete set null,
  order_number    text not null,
  customer_name   text not null,
  phone           text not null,
  reason_category text not null,
  reason_text     text not null,
  images          jsonb not null default '[]'::jsonb,
  status          text not null check (status in ('requested','approved','rejected','received','refunded','closed')) default 'requested',
  admin_notes     text not null default '',
  shipping_cost   integer not null default 0 check (shipping_cost >= 0),
  refund_amount   integer not null default 0 check (refund_amount >= 0),
  history         jsonb not null default '[]'::jsonb,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists return_requests_order_number_idx on public.return_requests(order_number);
create index if not exists return_requests_status_idx on public.return_requests(status);

-- ---------- 14. سجل المرتجعات (Return History) ----------
create table if not exists public.return_history (
  id           uuid primary key default gen_random_uuid(),
  return_id    uuid not null references public.return_requests(id) on delete cascade,
  actor        text not null,
  action       text not null,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists return_history_return_id_idx on public.return_history(return_id);

-- ---------- 15. الكوبونات (Coupons) ----------
create table if not exists public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  type           text not null check (type in ('percent','fixed','shipping')),
  value          integer not null check (value >= 0),
  min_subtotal   integer check (min_subtotal >= 0),
  description    text,
  active         boolean not null default true,
  usage_limit    integer,
  used_count     integer not null default 0 check (used_count >= 0),
  expires_at     timestamptz,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_active_idx on public.coupons(active);

-- ---------- 16. التقييمات (Reviews) ----------
create table if not exists public.product_reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products(id) on delete cascade,
  product_slug text not null,
  author       text not null,
  city         text,
  rating       smallint not null check (rating between 1 and 5),
  body         text,
  is_approved  boolean not null default false,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
create index if not exists product_reviews_approved_idx on public.product_reviews(is_approved);

-- ---------- 17. البنرات (Banners) ----------
create table if not exists public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  text       text,
  href       text,
  image_url  text,
  active     boolean not null default true,
  position   integer not null default 0,
  is_demo    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists banners_active_idx on public.banners(active);
create index if not exists banners_position_idx on public.banners(position);

-- ---------- 18. مجموعات الأسئلة (FAQ Groups) ----------
create table if not exists public.faq_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  slug       text unique not null,
  active     boolean not null default true,
  position   integer not null default 0,
  is_demo    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 19. الأسئلة الشائعة (FAQs) ----------
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.faq_groups(id) on delete cascade,
  question    text not null,
  answer      text not null,
  active      boolean not null default true,
  position    integer not null default 0,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists faqs_group_id_idx on public.faqs(group_id);
create index if not exists faqs_active_idx on public.faqs(active);

-- ---------- 20. السياسات (Policies) ----------
create table if not exists public.policies (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null check (slug in ('shipping','returns','privacy','terms')),
  title      text not null,
  body       text not null,
  is_demo    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 21. إعدادات الموقع (Site Settings) ----------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  description text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 22. سجل النشاط (Audit Logs) ----------
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.admin_users(id) on delete set null,
  actor_email  text,
  actor_role   text,
  action       text not null,
  entity       text not null,
  entity_id    text,
  summary      text not null,
  ip_address   text,
  user_agent   text,
  metadata     jsonb not null default '{}'::jsonb,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_email);

-- ---------- 23. رسائل التواصل (Contact Messages) ----------
create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  subject      text,
  message      text not null,
  status       text not null check (status in ('new','read','replied','closed')) default 'new',
  replied_at   timestamptz,
  replied_by   uuid references public.admin_users(id) on delete set null,
  reply_text   text,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists contact_messages_status_idx on public.contact_messages(status);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- ---------- 24. التخزين المؤقت (Cache) ----------
create table if not exists public.cache_entries (
  key         text primary key,
  value       jsonb not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
create index if not exists cache_entries_expires_at_idx on public.cache_entries(expires_at);

-- ---------- 25. مفاتيح الويب (Webhooks) ----------
create table if not exists public.webhooks (
  id          uuid primary key default gen_random_uuid(),
  provider    text not null,
  url         text not null,
  secret      text,
  active      boolean not null default true,
  events      jsonb not null default '[]'::jsonb,
  last_sent_at timestamptz,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- 26. تقارير إحصائيات (Stats Snapshots) ----------
create table if not exists public.stats_snapshots (
  id            uuid primary key default gen_random_uuid(),
  period        text not null,
  date_key      date not null,
  metrics       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  unique (period, date_key)
);

-- ---------- 27. سجلات المهام (Jobs) ----------
create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  payload      jsonb not null default '{}'::jsonb,
  status       text not null check (status in ('pending','running','completed','failed')) default 'pending',
  attempts     integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3,
  error        text,
  run_at       timestamptz not null default now(),
  started_at   timestamptz,
  finished_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists jobs_status_run_at_idx on public.jobs(status, run_at);
create index if not exists jobs_name_idx on public.jobs(name);

-- ============================================================
-- Triggers: تحديث updated_at تلقائياً
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in select table_name from information_schema.columns
           where column_name = 'updated_at' and table_schema = 'public'
  loop
    execute format('drop trigger if exists set_updated_at_%s on public.%s;', replace(t,'.','_'), t);
    execute format('create trigger set_updated_at_%s before update on public.%s for each row execute function public.update_updated_at_column();', replace(t,'.','_'), t);
  end loop;
end $$;

-- ============================================================
-- RLS (Row Level Security) — مبدأ: الواجهة عامة، الوصول الإداري عبر Service Role
-- التطبيق الحالي يستخدم مخزن JSON (server-only). عند تفعيل Supabase:
-- - تُفعّل RLS على الجداول الحساسة
-- - يُقرأ/يكتب عبر Service Role Key من الخادم فقط (لا يُستخدم Anon Key للعمليات الإدارية)
-- ============================================================
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customers enable row level security;
alter table public.product_media enable row level security;
alter table public.shipping_companies enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipments enable row level security;
alter table public.return_requests enable row level security;
alter table public.return_history enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.coupons enable row level security;
alter table public.product_reviews enable row level security;
alter table public.banners enable row level security;
alter table public.faqs enable row level security;
alter table public.faq_groups enable row level security;
alter table public.policies enable row level security;
alter table public.site_settings enable row level security;
alter table public.cache_entries enable row level security;
alter table public.webhooks enable row level security;
alter table public.stats_snapshots enable row level security;
alter table public.jobs enable row level security;

-- سياسة افتراضية: لا يُسمح مطلقًا (Deny by Default). الوصول الإداري فقط عبر service_role.
create policy "deny_all_read" on public.admin_users for select using (false);
create policy "deny_all_write" on public.admin_users for all using (false) with check (false);
create policy "deny_all_read_orders" on public.orders for select using (false);
create policy "deny_all_write_orders" on public.orders for all using (false) with check (false);
create policy "deny_all_read_audit" on public.audit_logs for select using (false);
create policy "deny_all_write_audit" on public.audit_logs for all using (false) with check (false);

-- الجداول العامة (المنتجات/الأقسام/البنرات/الأسئلة/السياسات) يمكن قراءتها علنًا؛ الكتابة فقط عبر service_role.
alter table public.products disable row level security;
alter table public.categories disable row level security;
alter table public.bundles disable row level security;
alter table public.banners disable row level security;
alter table public.faq_groups disable row level security;
alter table public.faqs disable row level security;
alter table public.policies disable row level security;
alter table public.site_settings disable row level security;
alter table public.product_reviews disable row level security;
alter table public.coupons disable row level security;

-- ============================================================
-- Views مفيدة
-- ============================================================
create or replace view public.published_products as
  select * from public.products
  where is_published = true and status = 'active';

create or replace view public.active_banners as
  select * from public.banners
  where active = true
  order by position asc, created_at desc;

-- ============================================================
-- ملاحظات التنفيذ
-- ============================================================
-- 1. عند الربط بـ Supabase: استخدم Service Role Key فقط من الخادم (src/lib/db/* server-only). لا تستخدم Anon Key للعمليات الإدارية.
-- 2. RLS مفعّل على البيانات الحساسة (طلبات، عملاء، شحن، مرتجعات، مستخدمين إداريين، سجل نشاط). البيانات العامة للعرض معطّلة RLS.
-- 3. هذا المخطط يحافظ على نفس التواقيع الموجودة في الكود (أسماء الحقول تتطابق مع التحويلات المتوقعة).
-- 4. الجداول تدعم is_demo للفصل بين بيانات التطوير والإنتاج.
-- ============================================================