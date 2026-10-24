-- Lets an admin permanently delete a user account while keeping every tree
-- they added. Previously trees.user_id cascaded on delete, which would have
-- wiped their trees along with their account.

alter table trees alter column user_id drop not null;

alter table trees drop constraint if exists trees_user_id_fkey;
alter table trees
  add constraint trees_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete set null;
