-- Secondary stat allocations via status points
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS alloc_crit INT NOT NULL DEFAULT 0 CHECK (alloc_crit >= 0),
  ADD COLUMN IF NOT EXISTS alloc_crit_dmg INT NOT NULL DEFAULT 0 CHECK (alloc_crit_dmg >= 0),
  ADD COLUMN IF NOT EXISTS alloc_resist INT NOT NULL DEFAULT 0 CHECK (alloc_resist >= 0),
  ADD COLUMN IF NOT EXISTS alloc_eva INT NOT NULL DEFAULT 0 CHECK (alloc_eva >= 0),
  ADD COLUMN IF NOT EXISTS alloc_acc INT NOT NULL DEFAULT 0 CHECK (alloc_acc >= 0);
