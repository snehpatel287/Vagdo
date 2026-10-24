-- Two things an admin asked for around deleting users:
--
--   1. A tree's "added by" name/email should keep showing even after the
--      person who added it is deleted (today it disappears, since the name
--      is only ever resolved live via a join to `profiles`, which is gone
--      once the user is deleted).
--   2. If that same email is invited again later, their old trees should
--      automatically become theirs again instead of staying orphaned
--      forever.
--
-- Approach: snapshot the owner's email/name onto the tree row itself at
-- insert time (survives the profile being deleted), and re-link orphaned
-- trees (user_id is null) to a newly created account when its email
-- matches a snapshot.

alter table trees add column if not exists owner_email text;
alter table trees add column if not exists owner_first_name text;
alter table trees add column if not exists owner_last_name text;

-- Backfill existing rows from their current (still-active) owner.
update trees t
set owner_email = p.email,
    owner_first_name = p.first_name,
    owner_last_name = p.last_name
from profiles p
where p.id = t.user_id
  and t.owner_email is null;

-- Snapshot the adding user's identity onto the row so it survives them
-- later being deleted. SECURITY DEFINER so it can read `profiles` under
-- RLS the same way `is_admin()` does.
create or replace function set_tree_owner_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null and new.owner_email is null then
    select email, first_name, last_name
      into new.owner_email, new.owner_first_name, new.owner_last_name
      from profiles
      where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trees_owner_snapshot on trees;
create trigger trees_owner_snapshot
  before insert on trees
  for each row execute function set_tree_owner_snapshot();

-- Re-link orphaned trees (left behind by a deleted user) back to a new
-- account that's invited later with the same email.
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

  update trees
    set user_id = new.id
    where user_id is null
      and owner_email = new.email;

  return new;
end;
$$;
