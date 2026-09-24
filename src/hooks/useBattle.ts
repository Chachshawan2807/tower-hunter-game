import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationSpeed } from "./useAnimationQueue";
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
import { inferBattleResultFromEntities } from "../engine/states/battleOutcome";
import { stepPausesForPlayer } from "./battlePause";
import { useBattleAutoSubmit, useBattleStallWatchdog } from "./useBattleEffects";
import {
  clearActiveBattlePointer,
  loadActiveBattlePointer,
  saveActiveBattlePointer,
} from "../client/battleSessionPersistence";

export type { BattleLoadoutContext } from "./battleLoadoutContext";

export function useBattle(
  userId: string | null,
  onComplete?: () => void | Promise<void>,
  onResumed?: (floor: number) => void
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
  const sessionAutoBattleRef = useRef(true);
  const actionRequiredRef = useRef(false);
  const isCompleteRef = useRef(false);
  const continueBattleRef = useRef<() => Promise<void>>(async () => {});
  const onResumedRef = useRef(onResumed);
  onResumedRef.current = onResumed;
  const resumeGenerationRef = useRef(0);
  const resumeAttemptedUserRef = useRef<string | null>(null);
  const applyStepRef = useRef<(step: BattleStepResponse) => void>(() => {});

  const persistActiveSession = useCallback(
    (activeSessionId: string, battleFloor: number) => {
      if (!userId) return;
      saveActiveBattlePointer({
        userId,
        sessionId: activeSessionId,
        floor: battleFloor,
      });
    },
    [userId]
  );

  const animation = useCombatQueue({
    onQueueComplete: (snapshot) => {
      setBattleSnapshot(snapshot);
      setIsComplete(snapshot.isComplete);
      isCompleteRef.current = snapshot.isComplete;
      setResult(snapshot.result ?? null);
      if (snapshot.isComplete) {
        void Promise.resolve(onComplete?.());
        return;
      }
      if (!actionRequiredRef.current && !isCompleteRef.current) {
        void continueBattleRef.current();
      }
    },
  });

  const applyStep = useCallback(
    (step: BattleStepResponse) => {
      setTurnNonce(step.turnNonce);
      const pausesForPlayer = stepPausesForPlayer(step);
      setActionRequired(pausesForPlayer);
      actionRequiredRef.current = pausesForPlayer;
      setRewards(step.rewards);
      setOfflineMessage(null);
      const context = extractLoadoutContext(step.state);
      if (context) setLoadoutContext(context);

      const { finalState } = step.animationQueue;
      const resolvedResult =
        step.state.result ??
        (step.state.isComplete
          ? inferBattleResultFromEntities(finalState)
          : null) ??
        inferBattleResultFromEntities(finalState);

      setBattleSnapshot(finalState);
      setIsComplete(step.state.isComplete || resolvedResult !== null);
      isCompleteRef.current =
        step.state.isComplete || resolvedResult !== null;
      setResult(resolvedResult);

      if (step.state.isComplete || resolvedResult !== null) {
        animation.enqueue({ events: [], finalState });
      } else {
        animation.enqueue(step.animationQueue);
      }

      if (
        step.animationQueue.events.length === 0 &&
        !pausesForPlayer &&
        !step.state.isComplete &&
        resolvedResult === null
      ) {
        void continueBattleRef.current();
      }

      persistActiveSession(
        step.sessionId,
        step.state.floor ?? finalState.floor
      );
    },
    [animation, persistActiveSession]
  );
  applyStepRef.current = applyStep;

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

  useEffect(() => {
    if (!userId) {
      resumeAttemptedUserRef.current = null;
      return;
    }
    if (resumeAttemptedUserRef.current === userId) return;
    resumeAttemptedUserRef.current = userId;

    const pointer = loadActiveBattlePointer(userId);
    if (!pointer) return;

    const generation = ++resumeGenerationRef.current;
    setBusy(true);

    void (async () => {
      try {
        const session = await api.getBattleSession(pointer.sessionId);
        if (generation !== resumeGenerationRef.current) return;

        if (session.userId !== userId) {
          clearActiveBattlePointer();
          return;
        }

        sessionAutoBattleRef.current = session.state.autoBattle ?? true;
        animation.reset();
        setSessionId(session.id);
        setFloor(session.floor);
        setTurnNonce(session.turnNonce);
        setRewards(session.rewards);
        persistActiveSession(session.id, session.floor);

        const finalState = {
          entities: session.state.entities,
          floor: session.state.floor,
          turnNumber: session.state.turnNumber,
          isComplete: session.state.isComplete,
          result: session.state.result,
        };

        applyStepRef.current({
          sessionId: session.id,
          state: session.state,
          events: [],
          animationQueue: { events: [], finalState },
          actionRequired:
            Boolean(session.waitingActorId) && !session.state.autoBattle,
          waitingActorId: session.waitingActorId,
          turnNonce: session.turnNonce,
          rewards: session.rewards,
        });

        onResumedRef.current?.(session.floor);
      } catch (err) {
        if (generation !== resumeGenerationRef.current) return;
        console.warn("[battle] Could not resume session:", err);
        clearActiveBattlePointer();
      } finally {
        if (generation === resumeGenerationRef.current) {
          setBusy(false);
        }
      }
    })();
  }, [userId, animation, persistActiveSession]);

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
        const startResult = await queueBattleStart(
          userId,
          targetFloor,
          sessionAutoBattleRef.current
        );

        if (startResult.status === "queued") {
          setOfflineMessage("common.offline_queued");
          return;
        }
        if (startResult.status === "error") {
          throw startResult.error;
        }

        const session = startResult.data;
        const firstStep = await api.battleStep(session.id, 20);
        setSessionId(session.id);
        persistActiveSession(session.id, targetFloor);
        setTurnNonce(session.turnNonce);
        const context = extractLoadoutContext(session.state);
        if (context) setLoadoutContext(context);
        applyStep(firstStep);
      } catch (err) {
        console.error("Failed to start battle:", err);
        setSessionId(null);
        setStartError(err instanceof Error ? err.message : "Battle failed");
      } finally {
        startingRef.current = false;
        setBusy(false);
      }
    },
    [userId, applyStep, animation, persistActiveSession]
  );

  const continueBattle = useCallback(async () => {
    if (
      !sessionId ||
      !userId ||
      busy ||
      isComplete ||
      isCompleteRef.current ||
      animation.isPlaying
    ) {
      return;
    }
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

  continueBattleRef.current = continueBattle;

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

  const setAutoBattle = useCallback(
    async (enabled: boolean) => {
      sessionAutoBattleRef.current = enabled;
      setLoadoutContext((prev) =>
        prev ? { ...prev, autoBattle: enabled } : prev
      );

      if (!sessionId || !userId) return;

      setBusy(true);
      try {
        const intent: PlayerIntent = {
          type: "toggle_auto_battle",
          enabled,
        };
        const intentResult = await queueBattleIntent(
          userId,
          sessionId,
          intent,
          turnNonce,
          "_toggle_auto",
          enabled ? "on" : "off"
        );

        if (intentResult.status === "queued") {
          setOfflineMessage("common.offline_queued");
          return;
        }
        if (intentResult.status === "error") {
          throw intentResult.error;
        }

        applyStep(intentResult.data);

        if (enabled && !intentResult.data.actionRequired) {
          const stepResult = await queueBattleStep(userId, sessionId);
          if (stepResult.status === "success") {
            applyStep(stepResult.data);
          }
        }
      } catch (err) {
        console.error("Failed to toggle auto battle:", err);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, userId, applyStep, turnNonce]
  );

  const setBattleSpeed = useCallback(
    (next: AnimationSpeed) => {
      animation.setSpeed(next === 2 ? 2 : 1);
    },
    [animation]
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
    clearActiveBattlePointer();
    setSessionId(null);
    setStartError(null);
    setOfflineMessage(null);
    setTurnNonce(null);
    animation.reset();
    setBattleSnapshot(null);
    setLoadoutContext(null);
    setActionRequired(false);
    actionRequiredRef.current = false;
    setIsComplete(false);
    isCompleteRef.current = false;
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

  useBattleStallWatchdog({
    active: Boolean(sessionId),
    pausedForInput: actionRequired,
    busy,
    isPlaying: animation.isPlaying,
    isComplete,
    onResume: continueBattle,
  });

  return {
    sessionId,
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
    speed: animation.speed === 4 ? 2 : animation.speed,
    setSpeed: setBattleSpeed,
    skip: animation.skip,
    startBattle,
    continueBattle,
    setAutoBattle,
    manualSkill,
    submitAutoFromPool,
    resetBattle,
  };
}
