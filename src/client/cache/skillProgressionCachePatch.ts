import type {
  SkillRespecResponse,
  SkillUnlockResponse,
} from "../../api/types";
import { defaultSkillLoadout } from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import { getHotGameDataForUser } from "./gameDataMemory";
import { patchGameDataCache } from "./gameDataStore";

export function patchSkillProgressionAfterUnlock(
  userId: string,
  unlock: SkillUnlockResponse
): void {
  const hot = getHotGameDataForUser(userId);
  if (!hot) return;

  const unlockedSet = new Set(unlock.unlockedSkillIds);
  patchGameDataCache(userId, {
    skillProgression: {
      ...hot.skillProgression,
      skillPoints: unlock.skillPoints,
      unlockedSkillIds: unlock.unlockedSkillIds,
      skills: hot.skillProgression.skills.map((skill) => ({
        ...skill,
        unlocked: unlockedSet.has(skill.id),
      })),
    },
    stats: {
      ...hot.stats,
      stats: { ...hot.stats.stats, skill_points: unlock.skillPoints },
    },
  });
}

export function patchSkillProgressionAfterRespec(
  userId: string,
  respec: SkillRespecResponse
): void {
  const hot = getHotGameDataForUser(userId);
  if (!hot) return;

  patchGameDataCache(userId, {
    skillProgression: {
      ...hot.skillProgression,
      skillPoints: respec.skillPoints,
      unlockedSkillIds: [],
      loadout: defaultSkillLoadout([]),
      upgrades: {},
      skills: hot.skillProgression.skills.map((skill) => ({
        ...skill,
        unlocked: false,
        upgrades: EMPTY_SKILL_UPGRADES,
      })),
    },
    stats: {
      ...hot.stats,
      stats: { ...hot.stats.stats, skill_points: respec.skillPoints },
    },
  });
}
