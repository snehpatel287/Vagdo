-- VAGDO — migration 005: remove the per-user "can add tree" restriction.
-- Any signed-in user can now add trees and tree types — only the admin
-- role distinction remains. The `can_add_tree` column on `profiles` is
-- left in place (unused) rather than dropped, so no data is lost.
-- Run this in the SQL Editor the same way as the earlier migrations.

drop policy if exists "trees: users with add access can insert their own" on trees;
create policy "trees: any signed-in user can insert their own" on trees
  for insert to authenticated
  with check (is_admin(auth.uid()) or auth.uid() = user_id);

drop policy if exists "tree_types: users with add access can insert" on tree_types;
create policy "tree_types: any signed-in user can insert" on tree_types
  for insert to authenticated
  with check (true);
