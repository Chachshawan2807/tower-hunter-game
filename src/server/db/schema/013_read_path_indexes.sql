-- List and count queries filter by user, then sort or range-scan by time.
-- Composite indexes stay selective as inventory, mailbox, and ledger rows grow.

CREATE INDEX IF NOT EXISTS inventory_items_user_created_idx
  ON inventory_items (user_id, created_at);

CREATE INDEX IF NOT EXISTS mailbox_items_user_created_idx
  ON mailbox_items (user_id, created_at);

CREATE INDEX IF NOT EXISTS wallet_ledger_user_created_idx
  ON wallet_ledger (user_id, created_at DESC);
