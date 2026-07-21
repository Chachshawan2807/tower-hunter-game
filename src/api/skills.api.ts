import { apiRequest } from "./request";
import type {
  SkillLoadout,
  SkillPathResponse,
  SkillProgressionResponse,
  SkillUnlockResponse,
  SkillUpgradeResponse,
  SkillCatalogEntry,
} from "./types";

export const skillsApi = {
  getSkillCatalog() {
    return apiRequest<{ skills: SkillCatalogEntry[] }>("/api/skills/catalog");
  },

  getSkillPath(userId: string) {
    return apiRequest<SkillPathResponse>(`/api/skills/${userId}/path`);
  },

  setSkillPath(userId: string, path: "imperial" | "knight" | "vanguard") {
    return apiRequest<SkillPathResponse>(`/api/skills/${userId}/path`, {
      method: "PATCH",
      body: JSON.stringify({ path }),
    });
  },

  patchSkillLoadout(
    userId: string,
    payload: { path: "imperial" | "knight" | "vanguard"; activeSlots: [string, string] }
  ) {
    return apiRequest<{ loadout: SkillLoadout }>(
      `/api/skills/${userId}/loadout`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  getSkillProgression(userId: string) {
    return apiRequest<SkillProgressionResponse>(
      `/api/skills/${userId}/progression`
    );
  },

  upgradeSkill(
    userId: string,
    payload: { skillId: string; branch: "damage" | "cooldown" | "mpCost" }
  ) {
    return apiRequest<SkillUpgradeResponse>(`/api/skills/${userId}/upgrade`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  unlockSkill(userId: string, skillId: string) {
    return apiRequest<SkillUnlockResponse>(`/api/skills/${userId}/unlock`, {
      method: "POST",
      body: JSON.stringify({ skillId }),
    });
  },
};
