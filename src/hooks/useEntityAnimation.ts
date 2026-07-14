import { useEffect, useRef, useState } from "react";
import { mapEventToCharacterState } from "../engine/art/mapAnimationEvent";
import type { AnimationState } from "../engine/art/animationStates";
import type { AnimationEvent } from "../engine/types";

const STATE_DURATION_MS: Record<AnimationState, number> = {
  idle: 0,
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

  useEffect(() => {
    if (isBattleComplete && battleResult) {
      if (battleResult === "win" && entitySide === "enemy") {
        setState("defeat");
        return;
      }
      if (battleResult === "lose" && entitySide === "player") {
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

      if (timerRef.current) clearTimeout(timerRef.current);
      setState(next);

      if (next !== "defeat") {
        timerRef.current = setTimeout(() => setState("idle"), STATE_DURATION_MS[next]);
      }
    }
  }, [displayedEvents, entityId, entitySide]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isBattleComplete) return;
    lastIndexRef.current = 0;
    if (state !== "defeat") setState("idle");
  }, [isBattleComplete]);

  return state;
}
