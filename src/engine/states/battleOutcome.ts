import type { BattleSnapshot } from "../../types";

export function inferBattleResultFromEntities(
  snapshot: BattleSnapshot | null
): "win" | "lose" | null {
  if (!snapshot) return null;
  const player = snapshot.entities.find((e) => e.side === "player");
  const enemy = snapshot.entities.find((e) => e.side === "enemy");
  if (enemy && enemy.stats.hp <= 0) return "win";
  if (player && player.stats.hp <= 0) return "lose";
  return null;
}

export function resolveBattleOutcomeDisplay(
  snapshot: BattleSnapshot | null,
  isComplete: boolean,
  result: "win" | "lose" | null
): { showResult: boolean; outcome: "win" | "lose" | null } {
  const inferred = inferBattleResultFromEntities(snapshot);
  const outcome = result ?? snapshot?.result ?? inferred;
  const battleEnded =
    isComplete || Boolean(snapshot?.isComplete) || outcome !== null;

  return {
    showResult: battleEnded && outcome !== null,
    outcome,
  };
}
