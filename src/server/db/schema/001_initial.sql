-- Tower Hunter Game — Phase 3 Database Schema
-- PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  gold_balance BIGINT NOT NULL DEFAULT 0 CHECK (gold_balance >= 0),
  auto_dismantle_common BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_locale TEXT NOT NULL DEFAULT 'en' CHECK (preferred_locale IN ('th', 'en')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_external_id_idx ON users (external_id);

-- ---------------------------------------------------------------------------
-- idempotency_keys — duplicate request protection
-- ---------------------------------------------------------------------------
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idempotency_keys_user_id_idx ON idempotency_keys (user_id);
CREATE INDEX idempotency_keys_status_idx ON idempotency_keys (status);

-- ---------------------------------------------------------------------------
-- wallet_ledger — append-only ledger (balance updated via trigger)
-- ---------------------------------------------------------------------------
CREATE TABLE wallet_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount <> 0),
  transaction_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE REFERENCES idempotency_keys (key),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wallet_ledger_user_id_idx ON wallet_ledger (user_id);
CREATE INDEX wallet_ledger_created_at_idx ON wallet_ledger (created_at);

-- ---------------------------------------------------------------------------
-- inventory_items — player inventory (supports overflow → mailbox)
-- ---------------------------------------------------------------------------
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX inventory_items_user_id_idx ON inventory_items (user_id);

-- ---------------------------------------------------------------------------
-- mailbox_items — temporary overflow storage (14-day TTL)
-- ---------------------------------------------------------------------------
CREATE TABLE mailbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  source_floor INT CHECK (source_floor IS NULL OR source_floor > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX mailbox_items_user_id_idx ON mailbox_items (user_id);
CREATE INDEX mailbox_items_expires_at_idx ON mailbox_items (expires_at);

-- ---------------------------------------------------------------------------
-- localization_dictionary — String_ID → locale text
-- ---------------------------------------------------------------------------
CREATE TABLE localization_dictionary (
  string_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('th', 'en')),
  text_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (string_id, locale)
);

CREATE INDEX localization_dictionary_locale_idx ON localization_dictionary (locale);

-- ---------------------------------------------------------------------------
-- Trigger: apply ledger entry to users.gold_balance atomically
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_apply_wallet_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance BIGINT;
BEGIN
  UPDATE users
  SET
    gold_balance = gold_balance + NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.user_id
  RETURNING gold_balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'User % not found for wallet ledger entry', NEW.user_id;
  END IF;

  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient gold balance for user %', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_wallet_ledger
AFTER INSERT ON wallet_ledger
FOR EACH ROW
EXECUTE FUNCTION fn_apply_wallet_ledger();

-- ---------------------------------------------------------------------------
-- Trigger: keep users.updated_at fresh
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_touch_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_touch_users_updated_at();
