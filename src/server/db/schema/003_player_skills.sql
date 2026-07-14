-- Player active skill path (murim / knight / fantasy)
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS active_skill_path TEXT NOT NULL DEFAULT 'murim'
    CHECK (active_skill_path IN ('murim', 'knight', 'fantasy'));

CREATE INDEX IF NOT EXISTS player_stats_skill_path_idx
  ON player_stats (active_skill_path);
