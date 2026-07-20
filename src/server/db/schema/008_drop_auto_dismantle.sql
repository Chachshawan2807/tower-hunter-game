-- Remove auto-dismantle common setting (game has no item rarity tiers)
ALTER TABLE users DROP COLUMN IF EXISTS auto_dismantle_common;
