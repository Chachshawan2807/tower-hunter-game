import { useCallback, useEffect, useRef, useState } from "react";
import {
  deriveAutoSkills,
  getSkillsForPath,
  isSkillUnlocked,
  pickAutoSkill,
} from "../engine/skills";
import type { SkillLoadout } from "../engine/skills/loadout";
import type { SkillUpgradeRanks } from "../engine/skills/types";
import type { BattleSnapshot, PlayerIntent, SkillPath } from "../engine/types";
import { api, type BattleStepResponse } from "../utils/api";
import { useAnimationQueue } from "./useAnimationQueue";

export interface BattleLoadoutContext {
  autoBattle: boolean;
  playerLoadout: SkillLoadout;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  playerSkillPath: SkillPath;
}

function extractLoadoutContext(
  state: BattleStepResponse["state"]
): BattleLoadoutContext | null {
  const full = state as BattleStepResponse["state"] & {
    playerLoadout?: SkillLoadout;
    playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
    playerSkillPath?: SkillPath;
  };
  if (!full.playerLoadout) return null;
  return {
    autoBattle: full.autoBattle,
    playerLoadout: full.playerLoadout,
    playerSkillUpgrades: full.playerSkillUpgrades ?? {},
    playerSkillPath: full.playerSkillPath ?? full.playerLoadout.path,
  };
}

export function useBattle(userId: string | null, onComplete?: () => void | Promise<void>) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [floor, setFloor] = useState(1);
  const [battleSnapshot, setBattleSnapshot] = useState<BattleSnapshot | null>(null);
  const [loadoutContext, setLoadoutContext] = useState<BattleLoadoutContext | null>(
    null
  );
  const [actionRequired, setActionRequired] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [busy, setBusy] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<BattleStepResponse["rewards"]>();
  const startingRef = useRef(false);

  const animation = useAnimationQueue({
    onQueueComplete: (snapshot) => {
      setBattleSnapshot(snapshot);
      setIsComplete(snapshot.isComplete);
      setResult(snapshot.result ?? null);
      if (snapshot.isComplete) {
        void Promise.resolve(onComplete?.());
      }
    },
  });

  const applyStep = useCallback(
    (step: BattleStepResponse) => {
      setActionRequired(step.actionRequired);
      setRewards(step.rewards);
      const context = extractLoadoutContext(step.state);
      if (context) {
        setLoadoutContext(context);
      }
      animation.enqueue(step.animationQueue);

      if (step.animationQueue.events.length === 0) {
        setBattleSnapshot(step.animationQueue.finalState);
        setIsComplete(step.state.isComplete);
        setResult(step.state.result ?? null);
      }
    },
    [animation]
  );

  const startBattle = useCallback(
    async (targetFloor: number) => {
      if (!userId || startingRef.current) return;

      startingRef.current = true;
      setBusy(true);
      setStartError(null);
      animation.reset();
      setBattleSnapshot(null);
      setLoadoutContext(null);
      setIsComplete(false);
      setResult(null);
      setRewards(undefined);
      setFloor(targetFloor);

      try {
        const session = await api.startBattle(userId, targetFloor, true);
        setSessionId(session.id);
        const context = extractLoadoutContext(session.state);
        if (context) {
          setLoadoutContext(context);
        }
        const step = await api.battleStep(session.id, 20);
        applyStep(step);
      } catch (err) {
        console.error("Failed to start battle:", err);
        setStartError(err instanceof Error ? err.message : "Battle failed");
      } finally {
        startingRef.current = false;
        setBusy(false);
      }
    },
    [userId, applyStep, animation]
  );

  const continueBattle = useCallback(async () => {
    if (!sessionId || busy || isComplete || animation.isPlaying) return;

    setBusy(true);
    try {
      const step = await api.battleStep(sessionId, 20);
      applyStep(step);
    } finally {
      setBusy(false);
    }
  }, [sessionId, busy, isComplete, animation.isPlaying, applyStep]);

  const manualSkill = useCallback(
    async (skillId: string, targetId: string) => {
      if (!sessionId || busy) return;

      setBusy(true);
      try {
        const step = await api.battleIntent(sessionId, {
          type: "request_action",
          skillId,
          targetId,
        } satisfies PlayerIntent);
        applyStep(step);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, busy, applyStep]
  );

  const manualAttack = useCallback(
    async (targetId: string) => manualSkill("basic_attack", targetId),
    [manualSkill]
  );

  const submitAutoFromPool = useCallback(async () => {
    if (!sessionId || busy || !loadoutContext || !battleSnapshot) return;

    const playerEntity = battleSnapshot.entities.find((e) => e.side === "player");
    if (!playerEntity) return;

    const unlocked = getSkillsForPath(loadoutContext.playerSkillPath)
      .filter((s) => isSkillUnlocked(s, playerEntity.stats.level))
      .map((s) => s.id);
    const autoIds = deriveAutoSkills(
      unlocked,
      loadoutContext.playerLoadout.activeSlots
    );

    const skill = pickAutoSkill(
      playerEntity,
      loadoutContext.playerSkillPath,
      autoIds,
      loadoutContext.playerSkillUpgrades
    );

    const enemyEntity = battleSnapshot.entities.find((e) => e.side === "enemy");
    const targetId =
      skill.targetType === "self"
        ? playerEntity.id
        : (enemyEntity?.id ?? "");
    if (!targetId) return;

    await manualSkill(skill.id, targetId);
  }, [sessionId, busy, loadoutContext, battleSnapshot, manualSkill]);

  useEffect(() => {
    if (
      !actionRequired ||
      loadoutContext?.autoBattle ||
      busy ||
      animation.isPlaying ||
      isComplete
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void submitAutoFromPool();
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [
    actionRequired,
    loadoutContext?.autoBattle,
    busy,
    animation.isPlaying,
    isComplete,
    submitAutoFromPool,
  ]);

  const resetBattle = useCallback(() => {
    setSessionId(null);
    setStartError(null);
    animation.reset();
    setBattleSnapshot(null);
    setLoadoutContext(null);
    setActionRequired(false);
    setIsComplete(false);
    setResult(null);
    setRewards(undefined);
  }, [animation]);

  useEffect(() => {
    if (!isComplete || animation.isPlaying || result !== "win" || !loadoutContext?.autoBattle) {
      return;
    }

    const timer = window.setTimeout(() => {
      resetBattle();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [isComplete, animation.isPlaying, result, loadoutContext?.autoBattle, resetBattle]);

  return {
    floor,
    battleSnapshot,
    loadoutContext,
    displayedEvents: animation.displayedEvents,
    actionRequired,
    isComplete,
    result,
    rewards,
    busy,
    startError,
    isPlaying: animation.isPlaying,
    speed: animation.speed,
    setSpeed: animation.setSpeed,
    skip: animation.skip,
    startBattle,
    continueBattle,
    manualAttack,
    manualSkill,
    submitAutoFromPool,
    resetBattle,
  };
}
