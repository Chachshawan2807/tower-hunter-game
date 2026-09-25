ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS last_equipped_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS inventory_items_user_last_equipped_idx
  ON inventory_items (user_id, last_equipped_at DESC NULLS LAST);
