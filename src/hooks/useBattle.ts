import { useCallback, useState } from "react";
import type { AnimationEvent } from "../engine/types";
import { api, type BattleStepResponse } from "../utils/api";

export function useBattle(userId: string | null, onComplete?: () => void) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [floor, setFloor] = useState(1);
  const [events, setEvents] = useState<AnimationEvent[]>([]);
  const [actionRequired, setActionRequired] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [busy, setBusy] = useState(false);

  const applyStep = useCallback(
    (step: BattleStepResponse) => {
      setEvents((prev) => [...prev, ...step.events]);
      setActionRequired(step.actionRequired);
      setIsComplete(step.state.isComplete);
      setResult(step.state.result ?? null);

      if (step.state.isComplete) {
        onComplete?.();
      }
    },
    [onComplete]
  );

  const startBattle = useCallback(
    async (targetFloor: number) => {
      if (!userId || busy) return;

      setBusy(true);
      setEvents([]);
      setIsComplete(false);
      setResult(null);
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
    [userId, busy, applyStep]
  );

  const continueBattle = useCallback(async () => {
    if (!sessionId || busy || isComplete) return;

    setBusy(true);
    try {
      const step = await api.battleStep(sessionId, 20);
      applyStep(step);
    } finally {
      setBusy(false);
    }
  }, [sessionId, busy, isComplete, applyStep]);

  const manualAttack = useCallback(
    async (targetId: string) => {
      if (!sessionId || busy) return;

      setBusy(true);
      try {
        const step = await api.battleIntent(sessionId, {
          type: "request_action",
          skillId: "basic_attack",
          targetId,
        });
        applyStep(step);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, busy, applyStep]
  );

  const resetBattle = useCallback(() => {
    setSessionId(null);
    setEvents([]);
    setActionRequired(false);
    setIsComplete(false);
    setResult(null);
  }, []);

  return {
    floor,
    events,
    actionRequired,
    isComplete,
    result,
    busy,
    startBattle,
    continueBattle,
    manualAttack,
    resetBattle,
  };
}
