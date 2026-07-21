import { combatApi } from "../../api/combat.api";
import { shopApi } from "../../api/shop.api";
import { skillsApi } from "../../api/skills.api";
import { userApi } from "../../api/user.api";

export const api = {
  ...userApi,
  ...shopApi,
  ...skillsApi,
  startBattle: combatApi.startBattle,
  battleStep: combatApi.battleStep,
  battleIntent: combatApi.battleIntent,
};
