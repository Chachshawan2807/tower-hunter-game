-- Player active skill path (imperial / knight / vanguard)
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS active_skill_path TEXT NOT NULL DEFAULT 'imperial'
    CHECK (active_skill_path IN ('imperial', 'knight', 'vanguard'));

CREATE INDEX IF NOT EXISTS player_stats_skill_path_idx
  ON player_stats (active_skill_path);
