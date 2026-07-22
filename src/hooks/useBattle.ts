import { useCallback, useEffect, useRef, useState } from "react";
import {
  pickSkillForTurn,
} from "../engine/skills";
import type { BattleSnapshot, PlayerIntent } from "../types";
import { OFFLINE_FLUSH_EVENT, type OfflineFlushDetail } from "../client/offline/types";
import { api, type BattleStepResponse } from "../utils/api";
import {
  queueBattleIntent,
  queueBattleStart,
  queueBattleStep,
} from "./battleOfflineActions";
import {
  extractLoadoutContext,
  type BattleLoadoutContext,
} from "./battleLoadoutContext";
import { useCombatQueue } from "./use-combat-queue";
import { useBattleAutoReset, useBattleAutoSubmit } from "./useBattleEffects";

export type { BattleLoadoutContext } from "./battleLoadoutContext";

export function useBattle(
  userId: string | null,
  onComplete?: () => void | Promise<void>
) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [floor, setFloor] = useState(1);
  const [battleSnapshot, setBattleSnapshot] = useState<BattleSnapshot | null>(
    null
  );
  const [loadoutContext, setLoadoutContext] =
    useState<BattleLoadoutContext | null>(null);
  const [actionRequired, setActionRequired] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [busy, setBusy] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [rewards, setRewards] = useState<BattleStepResponse["rewards"]>();
  const [turnNonce, setTurnNonce] = useState<string | null>(null);
  const startingRef = useRef(false);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const animation = useCombatQueue({
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
      setTurnNonce(step.turnNonce);
      setActionRequired(step.actionRequired);
      setRewards(step.rewards);
      setOfflineMessage(null);
      const context = extractLoadoutContext(step.state);
      if (context) setLoadoutContext(context);
      animation.enqueue(step.animationQueue);

      if (step.animationQueue.events.length === 0) {
        setBattleSnapshot(step.animationQueue.finalState);
        setIsComplete(step.state.isComplete);
        setResult(step.state.result ?? null);
      }
    },
    [animation]
  );

  const syncBattleAfterFlush = useCallback(async () => {
    const activeSession = sessionIdRef.current;
    if (!activeSession) return;
    try {
      applyStep(await api.battleStep(activeSession, 20));
    } catch (err) {
      console.warn("[battle] Failed to sync after offline flush:", err);
    }
  }, [applyStep]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<OfflineFlushDetail>).detail;
      if (detail.hadBattleActions) {
        void syncBattleAfterFlush();
      }
    };
    window.addEventListener(OFFLINE_FLUSH_EVENT, handler);
    return () => window.removeEventListener(OFFLINE_FLUSH_EVENT, handler);
  }, [syncBattleAfterFlush]);

  const startBattle = useCallback(
    async (targetFloor: number) => {
      if (!userId || startingRef.current) return;

      startingRef.current = true;
      setBusy(true);
      setStartError(null);
      setOfflineMessage(null);
      animation.reset();
      setBattleSnapshot(null);
      setLoadoutContext(null);
      setIsComplete(false);
      setResult(null);
      setRewards(undefined);
      setFloor(targetFloor);

      try {
        const startResult = await queueBattleStart(userId, targetFloor);

        if (startResult.status === "queued") {
          setOfflineMessage("common.offline_queued");
          return;
        }
        if (startResult.status === "error") {
          throw startResult.error;
        }

        const session = startResult.data;
        setSessionId(session.id);
        setTurnNonce(session.turnNonce);
        const context = extractLoadoutContext(session.state);
        if (context) setLoadoutContext(context);
        applyStep(await api.battleStep(session.id, 20));
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
    if (!sessionId || !userId || busy || isComplete || animation.isPlaying) return;
    setBusy(true);
    try {
      const stepResult = await queueBattleStep(userId, sessionId);

      if (stepResult.status === "queued") {
        setOfflineMessage("common.offline_queued");
        return;
      }
      if (stepResult.status === "error") {
        throw stepResult.error;
      }

      applyStep(stepResult.data);
    } catch (err) {
      console.error("Failed to continue battle:", err);
    } finally {
      setBusy(false);
    }
  }, [sessionId, userId, busy, isComplete, animation.isPlaying, applyStep]);

  const manualSkill = useCallback(
    async (skillId: string, targetId: string) => {
      if (!sessionId || !userId || busy) return;
      setBusy(true);
      try {
        const intent: PlayerIntent = {
          type: "request_action",
          skillId,
          targetId,
          turnNonce: turnNonce ?? undefined,
        };
        const intentResult = await queueBattleIntent(
          userId,
          sessionId,
          intent,
          turnNonce,
          skillId,
          targetId
        );

        if (intentResult.status === "queued") {
          setOfflineMessage("common.offline_queued");
          return;
        }
        if (intentResult.status === "error") {
          throw intentResult.error;
        }

        applyStep(intentResult.data);
      } catch (err) {
        console.error("Failed to submit battle intent:", err);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, userId, busy, applyStep, turnNonce]
  );

  const manualAttack = useCallback(
    async (targetId: string) => manualSkill("basic_attack", targetId),
    [manualSkill]
  );

  const submitAutoFromPool = useCallback(async () => {
    if (!sessionId || busy || !loadoutContext || !battleSnapshot) return;

    const playerEntity = battleSnapshot.entities.find((e) => e.side === "player");
    if (!playerEntity) return;

    const skill = pickSkillForTurn(
      playerEntity,
      loadoutContext.playerLoadout,
      loadoutContext.playerSkillUpgrades,
      loadoutContext.playerUnlockedSkillIds
    );
    const enemyEntity = battleSnapshot.entities.find((e) => e.side === "enemy");
    const targetId =
      skill.targetType === "self" ? playerEntity.id : (enemyEntity?.id ?? "");
    if (!targetId) return;

    await manualSkill(skill.id, targetId);
  }, [sessionId, busy, loadoutContext, battleSnapshot, manualSkill]);

  const resetBattle = useCallback(() => {
    setSessionId(null);
    setStartError(null);
    setOfflineMessage(null);
    setTurnNonce(null);
    animation.reset();
    setBattleSnapshot(null);
    setLoadoutContext(null);
    setActionRequired(false);
    setIsComplete(false);
    setResult(null);
    setRewards(undefined);
  }, [animation]);

  useBattleAutoSubmit({
    enabled:
      Boolean(actionRequired) &&
      !loadoutContext?.autoBattle &&
      !busy &&
      !animation.isPlaying &&
      !isComplete,
    onSubmit: submitAutoFromPool,
  });

  useBattleAutoReset({
    enabled:
      isComplete &&
      !animation.isPlaying &&
      result === "win" &&
      Boolean(loadoutContext?.autoBattle),
    onReset: resetBattle,
  });

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
    offlineMessage,
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
