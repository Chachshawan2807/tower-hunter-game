import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { AnimationEvent, BattleSnapshot } from "../../engine/types";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { AnimationSpeed } from "../../hooks/useAnimationQueue";
import type { BattleStepResponse } from "../../utils/api";
import type { Locale } from "../../utils/i18n";

export interface BattleArenaProps {
  locale: Locale;
  /** Tower floor for this session (shown in HUD; falls back to snapshot). */
  floor?: number;
  snapshot: BattleSnapshot | null;
  displayedEvents: AnimationEvent[];
  actionRequired: boolean;
  autoBattle: boolean;
  isComplete: boolean;
  result: "win" | "lose" | null;
  rewards?: BattleStepResponse["rewards"];
  busy: boolean;
  isPlaying: boolean;
  speed: AnimationSpeed;
  skillPath?: "imperial" | "knight" | "vanguard";
  /** Home / HUD display name for the player slot label. */
  playerDisplayName?: string;
  playerEquipment: CharacterEquipmentVisual;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onToggleAuto: (enabled: boolean) => void;
  onOpenSettings: () => void;
  onSkill?: (skillId: string, targetId: string) => void;
  commandSlotIds: string[];
  playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds?: string[];
  enemyTargetId?: string;
  /** New battle / refresh — remounts 3D turntable at default yaw. */
  battleSessionKey?: string | null;
  onReset: () => void;
  onNextFloor?: () => void;
  nextFloorDisabled?: boolean;
}

export interface EntityHpView {
  hp: number;
  maxHp: number;
  percent: number;
}
