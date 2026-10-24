-- VAGDO — migration 003: add a "Bird Nesting" Yes/No field to trees.
-- Run this in the SQL Editor the same way as the earlier migrations.

alter table trees add column if not exists has_bird_nesting boolean;
