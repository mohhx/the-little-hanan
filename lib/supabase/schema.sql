-- schema.sql
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / guarded
-- backfills), so running it twice won't duplicate columns or overwrite data.

-- ── categories ──────────────────────────────────────────────────────────────

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  image      text,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read"
  on categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_admin_insert" on categories;
create policy "categories_admin_insert"
  on categories for insert
  to authenticated
  with check (true);

drop policy if exists "categories_admin_update" on categories;
create policy "categories_admin_update"
  on categories for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "categories_admin_delete" on categories;
create policy "categories_admin_delete"
  on categories for delete
  to authenticated
  using (true);

-- ── products ────────────────────────────────────────────────────────────────

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  price          numeric not null,
  original_price numeric,
  category       text not null,
  rating         numeric,
  image          text,        -- legacy single-image column, kept for now
  description    text,
  created_at     timestamptz not null default now()
);

-- New columns for the admin panel: multiple images (gallery) and
-- per-product size availability.
alter table products add column if not exists images text[];
alter table products add column if not exists sizes  text[];

-- Out-of-stock toggle, shown in the admin panel and as a "Sold out" badge
-- on the storefront. Defaults to true so existing products stay visible
-- as in-stock until an admin flips one off.
alter table products add column if not exists in_stock boolean not null default true;

-- No automatic backfill for images/sizes — existing products will have
-- these set manually, one at a time, through the admin panel.

-- Product detail/spec fields, shown in the "Details" tab on the product
-- page (replaces the old fake-reviews tab). All optional — existing
-- products just show an empty state until an admin fills these in.
alter table products add column if not exists fabric            text;
alter table products add column if not exists fit               text;
alter table products add column if not exists care_instructions text;
alter table products add column if not exists measurements      text;

alter table products enable row level security;

drop policy if exists "products_public_read" on products;
create policy "products_public_read"
  on products for select
  to anon, authenticated
  using (true);

drop policy if exists "products_admin_insert" on products;
create policy "products_admin_insert"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "products_admin_update" on products;
create policy "products_admin_update"
  on products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "products_admin_delete" on products;
create policy "products_admin_delete"
  on products for delete
  to authenticated
  using (true);

-- ── blog_posts ──────────────────────────────────────────────────────────────
-- Unchanged — read-only for now, no admin management requested for blog yet.

create table if not exists blog_posts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  category   text,
  title      text not null,
  date       text,
  image      text,
  excerpt    text,
  body       text,
  created_at timestamptz not null default now()
);

-- Optional Instagram embed/link shown on the blog post detail page.
alter table blog_posts add column if not exists instagram_url text;

alter table blog_posts enable row level security;

drop policy if exists "blog_posts_public_read" on blog_posts;
create policy "blog_posts_public_read"
  on blog_posts for select
  to anon, authenticated
  using (true);

-- ── orders ──────────────────────────────────────────────────────────────────
-- Checkout is anonymous (no customer login), so anyone can create an order —
-- but only a logged-in admin can ever read, update, or delete one. `items`
-- is a snapshot of the cart at time of purchase (name, size, qty, price) so
-- a later product-price change never retroactively alters a past order.

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  order_ref      text unique not null,
  full_name      text not null,
  phone          text not null,
  email          text not null,
  address        text not null,
  city           text not null,
  state          text not null,
  notes          text,
  items          jsonb not null,
  subtotal       numeric not null,
  payment_method text not null default 'bank_transfer',  -- 'bank_transfer' | 'pay_on_delivery'
  payment_status text not null default 'pending',        -- 'pending' | 'awaiting_confirmation' | 'paid'
  order_status   text not null default 'pending',        -- 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
  created_at     timestamptz not null default now()
);

alter table orders enable row level security;

drop policy if exists "orders_public_insert" on orders;
create policy "orders_public_insert"
  on orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "orders_admin_read" on orders;
create policy "orders_admin_read"
  on orders for select
  to authenticated
  using (true);

drop policy if exists "orders_admin_update" on orders;
create policy "orders_admin_update"
  on orders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "orders_admin_delete" on orders;
create policy "orders_admin_delete"
  on orders for delete
  to authenticated
  using (true);

-- ── settings ────────────────────────────────────────────────────────────────
-- Simple key/value store for editable site config — currently just the bank
-- transfer details and the WhatsApp number used for proof-of-payment links.
-- Public read is required since the anonymous checkout page needs to
-- display these. Key/value (rather than fixed columns) so more settings
-- can be added later without another migration.

create table if not exists settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Seed defaults if they don't already exist. These are placeholders —
-- replace them from the admin Settings page once it's built.
insert into settings (key, value) values
  ('bank_name', 'Update this in Admin → Settings'),
  ('account_number', '0000000000'),
  ('account_name', 'The Little Hanan'),
  ('whatsapp_number', '2340000000000')
on conflict (key) do nothing;

alter table settings enable row level security;

drop policy if exists "settings_public_read" on settings;
create policy "settings_public_read"
  on settings for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_admin_insert" on settings;
create policy "settings_admin_insert"
  on settings for insert
  to authenticated
  with check (true);

drop policy if exists "settings_admin_update" on settings;
create policy "settings_admin_update"
  on settings for update
  to authenticated
  using (true)
  with check (true);

-- ── storage: product-images bucket ─────────────────────────────────────────
-- Bucket itself is already public (read) since getPublicUrl() is already
-- working in the app. These policies only add write access, gated to
-- logged-in admins.

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ── storage: category-images bucket ────────────────────────────────────────
-- Same pattern, in case the admin sets a photo when creating a new category.

drop policy if exists "category_images_admin_insert" on storage.objects;
create policy "category_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'category-images');

drop policy if exists "category_images_admin_update" on storage.objects;
create policy "category_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'category-images')
  with check (bucket_id = 'category-images');

drop policy if exists "category_images_admin_delete" on storage.objects;
create policy "category_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'category-images');