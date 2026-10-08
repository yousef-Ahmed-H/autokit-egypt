-- ============================================================
-- AutoKit Egypt — مخطط قاعدة البيانات (PostgreSQL / Supabase)
-- الحالة: جاهز للتفعيل لاحقًا. المشروع يعمل حاليًا ببيانات Demo.
--
-- طريقة التفعيل:
--   1) أنشئ مشروعًا على https://supabase.com
--   2) شغّل هذا الملف في SQL Editor
--   3) انسخ NEXT_PUBLIC_SUPABASE_URL / ANON_KEY إلى .env.local
--   4) فعّل الاستعلامات في src/lib/db/queries.ts
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- الأقسام ----------
create table if not exists categories (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text,
  image_url   text,
  created_at  timestamptz default now()
);

-- ---------- المنتجات ----------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  category_slug     text references categories(slug) on delete set null,
  price             integer not null check (price >= 0),
  old_price         integer check (old_price >= 0),
  short_description text,
  description       text,
  features          jsonb default '[]'::jsonb,
  specs             jsonb default '[]'::jsonb,
  package_includes  jsonb default '[]'::jsonb,
  image_url         text,
  rating            numeric(2,1) default 0,
  reviews_count     integer default 0,
  stock             integer default 0,
  badge             text,
  is_published      boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists products_category_idx on products(category_slug);
create index if not exists products_name_trgm_idx on products using gin (to_tsvector('simple', name));

-- ---------- الباقات ----------
create table if not exists bundles (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  tagline        text,
  description    text,
  product_slugs  jsonb default '[]'::jsonb,
  price          integer not null,
  original_price integer,
  image_url      text,
  badge          text,
  is_published   boolean default true
);

-- ---------- الطلبات ----------
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  full_name        text not null,
  phone            text not null,
  governorate      text not null,
  address          text not null,
  notes            text,
  payment_method   text not null check (payment_method in ('cod','vodafone_cash','instapay')),
  subtotal         integer not null,
  shipping         integer not null default 0,
  total            integer not null,
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  is_demo          boolean default true,
  created_at       timestamptz default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  product_slug text not null,
  title        text not null,
  unit_price   integer not null,
  quantity     integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ---------- رسائل التواصل ----------
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

-- ---------- إعدادات الموقع (الشعار مثلاً) ----------
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

-- ---------- التقييمات (مستقبلي) ----------
create table if not exists product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_slug text not null,
  author      text not null,
  city        text,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  is_approved boolean default false,
  created_at  timestamptz default now()
);

-- ---------- عرض مفيد للمنتجات المنشورة ----------
create or replace view published_products as
select * from products where is_published = true;
