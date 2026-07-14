import { useCallback, useState } from "react";
import type { BattleSnapshot, PlayerIntent } from "../engine/types";
import { api, type BattleStepResponse } from "../utils/api";
import { useAnimationQueue } from "./useAnimationQueue";

export function useBattle(userId: string | null, onComplete?: () => void) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [floor, setFloor] = useState(1);
  const [battleSnapshot, setBattleSnapshot] = useState<BattleSnapshot | null>(null);
  const [actionRequired, setActionRequired] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [busy, setBusy] = useState(false);
  const [rewards, setRewards] = useState<BattleStepResponse["rewards"]>();

  const animation = useAnimationQueue({
    onQueueComplete: (snapshot) => {
      setBattleSnapshot(snapshot);
      setIsComplete(snapshot.isComplete);
      setResult(snapshot.result ?? null);
      if (snapshot.isComplete) {
        onComplete?.();
      }
    },
  });

  const applyStep = useCallback(
    (step: BattleStepResponse) => {
      setActionRequired(step.actionRequired);
      setRewards(step.rewards);
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
      if (!userId || busy) return;

      setBusy(true);
      animation.reset();
      setBattleSnapshot(null);
      setIsComplete(false);
      setResult(null);
      setRewards(undefined);
      setFloor(targetFloor);

      try {
        const session = await api.startBattle(userId, targetFloor, true);
        setSessionId(session.id);
        const step = await api.battleStep(session.id, 20);
        applyStep(step);
      } finally {
        setBusy(false);
      }
    },
    [userId, busy, applyStep, animation]
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

  const manualAttack = useCallback(
    async (targetId: string) => {
      if (!sessionId || busy) return;

      setBusy(true);
      try {
        const step = await api.battleIntent(sessionId, {
          type: "request_action",
          skillId: "basic_attack",
          targetId,
        } satisfies PlayerIntent);
        applyStep(step);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, busy, applyStep]
  );

  const resetBattle = useCallback(() => {
    setSessionId(null);
    animation.reset();
    setBattleSnapshot(null);
    setActionRequired(false);
    setIsComplete(false);
    setResult(null);
    setRewards(undefined);
  }, [animation]);

  return {
    floor,
    battleSnapshot,
    displayedEvents: animation.displayedEvents,
    actionRequired,
    isComplete,
    result,
    rewards,
    busy,
    isPlaying: animation.isPlaying,
    speed: animation.speed,
    setSpeed: animation.setSpeed,
    skip: animation.skip,
    startBattle,
    continueBattle,
    manualAttack,
    resetBattle,
  };
}
