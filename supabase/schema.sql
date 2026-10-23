-- VAGDO Tree Registry — Supabase schema
-- Run this once in your project's SQL Editor (https://supabase.com/dashboard
-- -> your project -> SQL Editor -> New query -> paste -> Run).
--
-- Access model:
--   - Every tree belongs to the user who added it (trees.user_id).
--   - A regular user can only see/edit/delete their OWN trees, and only if
--     their profile has can_add_tree = true for inserts.
--   - An admin (profiles.role = 'admin') can see/edit/delete ALL trees and
--     manage every user's profile (name, can_add_tree, role).
--   - New accounts are created by an admin via Supabase's "invite user"
--     flow (see the admin panel) — there is no public sign-up form.

create extension if not exists pgcrypto;

-- Profiles (one row per auth user) -----------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'user' check (role in ('admin', 'user')),
  can_add_tree boolean not null default true,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so it can read `profiles` without re-triggering RLS on
-- itself (a plain policy referencing `profiles` from inside a `profiles`
-- policy would recurse).
create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$;

-- Auto-create a profile row whenever a new auth user is created (covers
-- both the bootstrap admin signing up and every invited user accepting
-- their invite). `role` is always forced to 'user' here regardless of what
-- an invite payload contains — promoting to admin is a separate, explicit
-- step so an invite can never grant itself admin.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, can_add_tree, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce((new.raw_user_meta_data ->> 'can_add_tree')::boolean, true),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;

create policy "profiles: self or admin can read" on profiles
  for select to authenticated
  using (auth.uid() = id or is_admin(auth.uid()));

-- Only admins edit profiles (names, permissions, role) — regular users
-- cannot self-escalate can_add_tree/role by editing their own row.
create policy "profiles: admin can update" on profiles
  for update to authenticated
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- Tree types (species) ------------------------------------------------------
-- Shared across everyone so the same species maps to the same color/category
-- no matter who adds a tree of that type.

create table if not exists tree_types (
  name text primary key,
  category text not null default 'Other',
  color text not null
);

alter table tree_types enable row level security;

create policy "tree_types: any signed-in user can read" on tree_types
  for select to authenticated using (true);
create policy "tree_types: users with add access can insert" on tree_types
  for insert to authenticated
  with check (is_admin(auth.uid()) or exists (
    select 1 from profiles where id = auth.uid() and can_add_tree
  ));
create policy "tree_types: admin can update" on tree_types
  for update to authenticated using (is_admin(auth.uid()));
create policy "tree_types: admin can delete" on tree_types
  for delete to authenticated using (is_admin(auth.uid()));

-- Trees -----------------------------------------------------------------

create table if not exists trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  color text,
  location text,
  latitude double precision,
  longitude double precision,
  images text[] not null default '{}',
  description text,
  health text,
  location_type text,
  created_at timestamptz not null default now()
);

create index if not exists trees_user_id_idx on trees (user_id);

alter table trees enable row level security;

create policy "trees: owner or admin can read" on trees
  for select to authenticated
  using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "trees: users with add access can insert their own" on trees
  for insert to authenticated
  with check (
    is_admin(auth.uid())
    or (auth.uid() = user_id and exists (
      select 1 from profiles where id = auth.uid() and can_add_tree
    ))
  );

create policy "trees: owner or admin can update" on trees
  for update to authenticated
  using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "trees: owner or admin can delete" on trees
  for delete to authenticated
  using (auth.uid() = user_id or is_admin(auth.uid()));

-- Photo storage -----------------------------------------------------------
-- Public bucket so saved photo URLs work directly in <img src>. Uploads are
-- scoped to a per-user folder (`<user_id>/...`) so one user can't overwrite
-- or delete another's photos (admins can delete any).

insert into storage.buckets (id, name, public)
values ('tree-photos', 'tree-photos', true)
on conflict (id) do nothing;

create policy "tree-photos: users upload into their own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tree-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tree-photos: owner or admin can delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'tree-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_admin(auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- After running this once, sign in through the app's /login page with the
-- email you want as the first admin (Supabase Auth -> Users -> Add user, or
-- invite yourself from the admin panel once one exists — see the chat for
-- the one-time bootstrap command), then run:
--
--   update profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
