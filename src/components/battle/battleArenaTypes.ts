import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { AnimationEvent, BattleSnapshot } from "../../engine/types";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { AnimationSpeed } from "../../hooks/useAnimationQueue";
import type { Locale } from "../../utils/i18n";

export interface BattleArenaProps {
  locale: Locale;
  snapshot: BattleSnapshot | null;
  displayedEvents: AnimationEvent[];
  actionRequired: boolean;
  autoBattle: boolean;
  isComplete: boolean;
  result: "win" | "lose" | null;
  busy: boolean;
  isPlaying: boolean;
  speed: AnimationSpeed;
  skillPath?: "imperial" | "knight" | "vanguard";
  playerEquipment: CharacterEquipmentVisual;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onSkip: () => void;
  onAttack: () => void;
  onSkill?: (skillId: string, targetId: string) => void;
  equippedSlots: string[];
  passiveLabel?: string | null;
  playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds?: string[];
  enemyTargetId?: string;
  onContinue: () => void;
  onReset: () => void;
}

export interface EntityHpView {
  hp: number;
  maxHp: number;
  percent: number;
}
