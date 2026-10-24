-- VAGDO — migration 004: track revoked access on profiles so the admin
-- panel can show status without needing to query auth.users directly.
-- Run this in the SQL Editor the same way as the earlier migrations.

alter table profiles add column if not exists access_revoked boolean not null default false;
