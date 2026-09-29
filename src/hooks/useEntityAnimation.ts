import { useEffect, useRef, useState } from "react";
import { mapEventToCharacterState } from "../engine/art/mapAnimationEvent";
import type { AnimationState } from "../engine/art/animationStates";
import type { AnimationEvent } from "../engine/types";

const STATE_DURATION_MS: Record<AnimationState, number> = {
  idle: 0,
  ready: 320,
  attack: 420,
  hit_cc: 380,
  defeat: 1200,
};

interface UseEntityAnimationOptions {
  entityId: string;
  entitySide: "player" | "enemy";
  displayedEvents: AnimationEvent[];
  isBattleComplete?: boolean;
  battleResult?: "win" | "lose" | null;
}

export function useEntityAnimation({
  entityId,
  entitySide,
  displayedEvents,
  isBattleComplete,
  battleResult,
}: UseEntityAnimationOptions): AnimationState {
  const [state, setState] = useState<AnimationState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIndexRef = useRef(0);
  const queueRef = useRef<AnimationState[]>([]);
  const playingRef = useRef(false);

  const clearPlayTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const playNextQueued = () => {
    if (playingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;

    playingRef.current = true;
    setState(next);

    if (next === "defeat") {
      playingRef.current = false;
      playNextQueued();
      return;
    }

    timerRef.current = setTimeout(() => {
      setState("idle");
      playingRef.current = false;
      playNextQueued();
    }, STATE_DURATION_MS[next]);
  };

  const enqueueState = (next: AnimationState) => {
    queueRef.current.push(next);
    playNextQueued();
  };

  useEffect(() => {
    if (isBattleComplete && battleResult) {
      if (battleResult === "win" && entitySide === "enemy") {
        clearPlayTimer();
        queueRef.current = [];
        playingRef.current = false;
        setState("defeat");
        return;
      }
      if (battleResult === "lose" && entitySide === "player") {
        clearPlayTimer();
        queueRef.current = [];
        playingRef.current = false;
        setState("defeat");
        return;
      }
    }
  }, [isBattleComplete, battleResult, entitySide]);

  useEffect(() => {
    if (displayedEvents.length <= lastIndexRef.current) {
      lastIndexRef.current = displayedEvents.length;
      return;
    }

    const fresh = displayedEvents.slice(lastIndexRef.current);
    lastIndexRef.current = displayedEvents.length;

    for (const event of fresh) {
      const next = mapEventToCharacterState(event, entityId, entitySide);
      if (!next) continue;
      enqueueState(next);
    }
  }, [displayedEvents, entityId, entitySide]);

  useEffect(() => {
    return () => clearPlayTimer();
  }, []);

  useEffect(() => {
    if (!isBattleComplete) return;
    lastIndexRef.current = 0;
    queueRef.current = [];
    playingRef.current = false;
    clearPlayTimer();
    if (state !== "defeat") setState("idle");
  }, [isBattleComplete]);

  return state;
}
