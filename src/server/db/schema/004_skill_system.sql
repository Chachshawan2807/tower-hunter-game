-- Skill points wallet
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS skill_points INT NOT NULL DEFAULT 0 CHECK (skill_points >= 0);

-- Per-path loadout (persisted separately per path)
CREATE TABLE IF NOT EXISTS player_skill_loadout (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path TEXT NOT NULL CHECK (path IN ('imperial', 'knight', 'vanguard')),
  active_slot_1 TEXT NOT NULL,
  active_slot_2 TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, path)
);

-- Per-skill upgrade ranks
CREATE TABLE IF NOT EXISTS player_skill_upgrades (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  damage_rank SMALLINT NOT NULL DEFAULT 0 CHECK (damage_rank BETWEEN 0 AND 3),
  cd_rank SMALLINT NOT NULL DEFAULT 0 CHECK (cd_rank BETWEEN 0 AND 3),
  mp_rank SMALLINT NOT NULL DEFAULT 0 CHECK (mp_rank BETWEEN 0 AND 3),
  PRIMARY KEY (user_id, skill_id)
);
