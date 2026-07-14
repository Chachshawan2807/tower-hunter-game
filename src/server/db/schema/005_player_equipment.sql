-- Player equipped gear (paper doll slots)
CREATE TABLE IF NOT EXISTS player_equipment (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('weapon', 'helm', 'chest', 'gloves', 'boots', 'cloak')),
  gear_id TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slot)
);

CREATE INDEX IF NOT EXISTS player_equipment_user_id_idx ON player_equipment (user_id);
