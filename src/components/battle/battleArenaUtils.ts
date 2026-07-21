import type { BattleSnapshot } from "../../engine/types";
import type { EntityHpView } from "./battleArenaTypes";

export function getEntityHp(
  snapshot: BattleSnapshot | null,
  side: "player" | "enemy"
): EntityHpView {
  const entity = snapshot?.entities.find((e) => e.side === side);
  if (!entity) return { hp: 0, maxHp: 1, percent: 0 };
  const percent = Math.max(0, (entity.stats.hp / entity.stats.maxHp) * 100);
  return {
    hp: Math.ceil(entity.stats.hp),
    maxHp: Math.ceil(entity.stats.maxHp),
    percent,
  };
}
