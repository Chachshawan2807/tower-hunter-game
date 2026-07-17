-- Per-skill unlocks (SP-gated progression)
CREATE TABLE IF NOT EXISTS player_skill_unlocks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS player_skill_unlocks_user_idx
  ON player_skill_unlocks (user_id);
