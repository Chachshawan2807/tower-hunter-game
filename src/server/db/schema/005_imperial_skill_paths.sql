-- Rename legacy skill paths to Imperial Knight Hero identity
UPDATE player_stats SET active_skill_path = 'imperial' WHERE active_skill_path = 'murim';
UPDATE player_stats SET active_skill_path = 'vanguard' WHERE active_skill_path = 'fantasy';

ALTER TABLE player_stats DROP CONSTRAINT IF EXISTS player_stats_active_skill_path_check;
ALTER TABLE player_stats ADD CONSTRAINT player_stats_active_skill_path_check
  CHECK (active_skill_path IN ('imperial', 'knight', 'vanguard'));

ALTER TABLE player_stats ALTER COLUMN active_skill_path SET DEFAULT 'imperial';
