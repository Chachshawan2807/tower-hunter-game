import { apiRequest } from "./request";
import type {
  SkillLoadout,
  SkillProgressionResponse,
  SkillUnlockResponse,
  SkillUpgradeResponse,
  SkillRespecResponse,
  SkillCatalogEntry,
} from "./types";

export const skillsApi = {
  getSkillCatalog(type?: string) {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiRequest<{ version: number; skills: SkillCatalogEntry[] }>(
      `/api/skills/catalog${query}`
    );
  },

  getSkillProgression(userId: string) {
    return apiRequest<SkillProgressionResponse>(
      `/api/skills/${userId}/progression`
    );
  },

  patchSkillLoadout(userId: string, payload: Partial<SkillLoadout>) {
    return apiRequest<{ loadout: SkillLoadout }>(
      `/api/skills/${userId}/loadout`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  upgradeSkill(
    userId: string,
    payload: {
      skillId: string;
      branch:
        | "damage"
        | "cooldown"
        | "mpCost"
        | "statusPotency"
        | "healPower"
        | "passivePotency";
    }
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

  respecSkills(userId: string) {
    return apiRequest<SkillRespecResponse>(`/api/skills/${userId}/respec`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};
