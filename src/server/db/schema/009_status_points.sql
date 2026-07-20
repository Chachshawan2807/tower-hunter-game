-- Character stat allocation (STATUS POINT / SKILL POINT for character menu)
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS status_points INT NOT NULL DEFAULT 0 CHECK (status_points >= 0),
  ADD COLUMN IF NOT EXISTS alloc_hp INT NOT NULL DEFAULT 0 CHECK (alloc_hp >= 0),
  ADD COLUMN IF NOT EXISTS alloc_mp INT NOT NULL DEFAULT 0 CHECK (alloc_mp >= 0),
  ADD COLUMN IF NOT EXISTS alloc_atk INT NOT NULL DEFAULT 0 CHECK (alloc_atk >= 0),
  ADD COLUMN IF NOT EXISTS alloc_def INT NOT NULL DEFAULT 0 CHECK (alloc_def >= 0),
  ADD COLUMN IF NOT EXISTS alloc_spd INT NOT NULL DEFAULT 0 CHECK (alloc_spd >= 0);

-- Backfill earned points for existing players (1 per level above 1, minus spent allocations)
UPDATE player_stats
SET status_points = GREATEST(
  0,
  (level - 1)
    - (alloc_hp + alloc_mp + alloc_atk + alloc_def + alloc_spd)
)
WHERE status_points = 0
  AND level > 1;
