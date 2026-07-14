-- Player combat stats (linked 1:1 with users)
CREATE TABLE player_stats (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  exp BIGINT NOT NULL DEFAULT 0 CHECK (exp >= 0),
  hp BIGINT NOT NULL DEFAULT 500 CHECK (hp > 0),
  max_hp BIGINT NOT NULL DEFAULT 500 CHECK (max_hp > 0),
  mp BIGINT NOT NULL DEFAULT 100 CHECK (mp >= 0),
  max_mp BIGINT NOT NULL DEFAULT 100 CHECK (max_mp >= 0),
  atk BIGINT NOT NULL DEFAULT 50 CHECK (atk >= 0),
  def BIGINT NOT NULL DEFAULT 20 CHECK (def >= 0),
  speed BIGINT NOT NULL DEFAULT 100 CHECK (speed > 0),
  crit_chance NUMERIC(10, 4) NOT NULL DEFAULT 0.1,
  crit_damage NUMERIC(10, 4) NOT NULL DEFAULT 1.5,
  crit_resist BIGINT NOT NULL DEFAULT 0,
  accuracy BIGINT NOT NULL DEFAULT 100,
  evasion BIGINT NOT NULL DEFAULT 10,
  status_chance NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
  status_resist NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
  current_floor INT NOT NULL DEFAULT 1 CHECK (current_floor >= 1 AND current_floor <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX player_stats_current_floor_idx ON player_stats (current_floor);

-- Seed stats for existing users (safe re-run)
INSERT INTO player_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
