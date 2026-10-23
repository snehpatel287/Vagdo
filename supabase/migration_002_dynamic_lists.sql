-- VAGDO — migration 002: make Category, Health Status, and Location Type
-- admin-editable instead of hardcoded in the app.
-- Run this in the SQL Editor the same way as schema.sql (it's additive —
-- safe to run even if some of this already partially exists).

-- Categories (used on tree types) -------------------------------------------

create table if not exists categories (
  name text primary key,
  sort_order int not null default 0
);

alter table categories enable row level security;

create policy "categories: any signed-in user can read" on categories
  for select to authenticated using (true);
create policy "categories: admin can insert" on categories
  for insert to authenticated with check (is_admin(auth.uid()));
create policy "categories: admin can update" on categories
  for update to authenticated using (is_admin(auth.uid()));
create policy "categories: admin can delete" on categories
  for delete to authenticated using (is_admin(auth.uid()));

insert into categories (name, sort_order) values
  ('Fruit', 1), ('Shade', 2), ('Flowering', 3),
  ('Timber', 4), ('Medicinal', 5), ('Other', 6)
on conflict (name) do nothing;

-- Health statuses (used on trees) --------------------------------------------

create table if not exists health_statuses (
  value text primary key,
  label text not null,
  color text not null,
  sort_order int not null default 0
);

alter table health_statuses enable row level security;

create policy "health_statuses: any signed-in user can read" on health_statuses
  for select to authenticated using (true);
create policy "health_statuses: admin can insert" on health_statuses
  for insert to authenticated with check (is_admin(auth.uid()));
create policy "health_statuses: admin can update" on health_statuses
  for update to authenticated using (is_admin(auth.uid()));
create policy "health_statuses: admin can delete" on health_statuses
  for delete to authenticated using (is_admin(auth.uid()));

insert into health_statuses (value, label, color, sort_order) values
  ('healthy', 'Healthy', '#22c55e', 1),
  ('needs_attention', 'Needs attention', '#f59e0b', 2),
  ('dead', 'Dead', '#ef4444', 3)
on conflict (value) do nothing;

-- Location types (used on trees) ---------------------------------------------

create table if not exists location_types (
  name text primary key,
  sort_order int not null default 0
);

alter table location_types enable row level security;

create policy "location_types: any signed-in user can read" on location_types
  for select to authenticated using (true);
create policy "location_types: admin can insert" on location_types
  for insert to authenticated with check (is_admin(auth.uid()));
create policy "location_types: admin can update" on location_types
  for update to authenticated using (is_admin(auth.uid()));
create policy "location_types: admin can delete" on location_types
  for delete to authenticated using (is_admin(auth.uid()));

insert into location_types (name, sort_order) values
  ('Roadside', 1), ('Farm', 2), ('Backyard', 3),
  ('Government Land', 4), ('Community Land', 5)
on conflict (name) do nothing;
