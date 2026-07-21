-- Skill system v2: 4-slot equip loadout + expanded upgrade ranks

CREATE TABLE IF NOT EXISTS player_skill_loadout_v2 (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  equipped_slots TEXT[] NOT NULL DEFAULT '{}',
  heal_override BOOLEAN NOT NULL DEFAULT true,
  heal_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.35,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT equipped_slots_max_4 CHECK (cardinality(equipped_slots) <= 4)
);

ALTER TABLE player_skill_upgrades
  ADD COLUMN IF NOT EXISTS status_rank SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heal_rank SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passive_rank SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE player_skill_upgrades DROP CONSTRAINT IF EXISTS player_skill_upgrades_damage_rank_check;
ALTER TABLE player_skill_upgrades DROP CONSTRAINT IF EXISTS player_skill_upgrades_cd_rank_check;
ALTER TABLE player_skill_upgrades DROP CONSTRAINT IF EXISTS player_skill_upgrades_mp_rank_check;

ALTER TABLE player_skill_upgrades
  ADD CONSTRAINT player_skill_upgrades_damage_rank_check CHECK (damage_rank BETWEEN 0 AND 4),
  ADD CONSTRAINT player_skill_upgrades_cd_rank_check CHECK (cd_rank BETWEEN 0 AND 4),
  ADD CONSTRAINT player_skill_upgrades_mp_rank_check CHECK (mp_rank BETWEEN 0 AND 4),
  ADD CONSTRAINT player_skill_upgrades_status_rank_check CHECK (status_rank BETWEEN 0 AND 4),
  ADD CONSTRAINT player_skill_upgrades_heal_rank_check CHECK (heal_rank BETWEEN 0 AND 4),
  ADD CONSTRAINT player_skill_upgrades_passive_rank_check CHECK (passive_rank BETWEEN 0 AND 4);

-- Migrate legacy 2-slot loadouts into v2 (first two active slots)
INSERT INTO player_skill_loadout_v2 (user_id, equipped_slots)
SELECT DISTINCT ON (user_id)
  user_id,
  ARRAY[active_slot_1, active_slot_2]::TEXT[]
FROM player_skill_loadout
WHERE active_slot_1 IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Map legacy unlock IDs to v2 catalog IDs
UPDATE player_skill_unlocks SET skill_id = 'active_iron_palm' WHERE skill_id = 'murim_palm';
UPDATE player_skill_unlocks SET skill_id = 'move_shadow_step' WHERE skill_id = 'murim_dash';
UPDATE player_skill_unlocks SET skill_id = 'active_inner_qi' WHERE skill_id = 'murim_qi';
UPDATE player_skill_unlocks SET skill_id = 'active_dragon_fist' WHERE skill_id = 'murim_dragon';
UPDATE player_skill_unlocks SET skill_id = 'active_power_slash' WHERE skill_id = 'knight_slash';
UPDATE player_skill_unlocks SET skill_id = 'passive_guardian_aura' WHERE skill_id = 'knight_guard';
UPDATE player_skill_unlocks SET skill_id = 'cc_shield_bash' WHERE skill_id = 'knight_bash';
UPDATE player_skill_unlocks SET skill_id = 'move_cavalry_charge' WHERE skill_id = 'knight_charge';
UPDATE player_skill_unlocks SET skill_id = 'active_arcane_bolt' WHERE skill_id = 'fantasy_bolt';
UPDATE player_skill_unlocks SET skill_id = 'cc_frost_nova' WHERE skill_id = 'fantasy_freeze';
UPDATE player_skill_unlocks SET skill_id = 'active_holy_light' WHERE skill_id = 'fantasy_heal';
UPDATE player_skill_unlocks SET skill_id = 'active_meteor' WHERE skill_id = 'fantasy_meteor';

UPDATE player_skill_loadout_v2
SET equipped_slots = ARRAY(
  SELECT CASE skill_id
    WHEN 'murim_palm' THEN 'active_iron_palm'
    WHEN 'murim_dash' THEN 'move_shadow_step'
    WHEN 'murim_qi' THEN 'active_inner_qi'
    WHEN 'murim_dragon' THEN 'active_dragon_fist'
    WHEN 'knight_slash' THEN 'active_power_slash'
    WHEN 'knight_guard' THEN 'passive_guardian_aura'
    WHEN 'knight_bash' THEN 'cc_shield_bash'
    WHEN 'knight_charge' THEN 'move_cavalry_charge'
    WHEN 'fantasy_bolt' THEN 'active_arcane_bolt'
    WHEN 'fantasy_freeze' THEN 'cc_frost_nova'
    WHEN 'fantasy_heal' THEN 'active_holy_light'
    WHEN 'fantasy_meteor' THEN 'active_meteor'
    ELSE skill_id
  END
  FROM unnest(equipped_slots) AS skill_id
);
