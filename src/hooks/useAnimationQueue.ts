import { useCallback, useRef, useState } from "react";
import type {
  AnimationEvent,
  AnimationQueuePayload,
  BattleSnapshot,
} from "../engine/types";

export type AnimationSpeed = 1 | 2 | 4;

const BASE_EVENT_MS = 500;

interface UseAnimationQueueOptions {
  onQueueComplete?: (finalState: BattleSnapshot) => void;
}

export function useAnimationQueue(options: UseAnimationQueueOptions = {}) {
  const [displayedEvents, setDisplayedEvents] = useState<AnimationEvent[]>([]);
  const [finalState, setFinalState] = useState<BattleSnapshot | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>(1);
  const [skipped, setSkipped] = useState(false);

  const queueRef = useRef<AnimationEvent[]>([]);
  const snapshotRef = useRef<BattleSnapshot | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(speed);
  const onCompleteRef = useRef(options.onQueueComplete);

  speedRef.current = speed;
  onCompleteRef.current = options.onQueueComplete;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const complete = useCallback((snapshot: BattleSnapshot) => {
    clearTimer();
    queueRef.current = [];
    setFinalState(snapshot);
    setIsPlaying(false);
    onCompleteRef.current?.(snapshot);
  }, []);

  const tick = useCallback(() => {
    const next = queueRef.current.shift();

    if (!next) {
      const snapshot = snapshotRef.current;
      if (snapshot) complete(snapshot);
      return;
    }

    setDisplayedEvents((prev) => [...prev, next]);
    timerRef.current = setTimeout(tick, BASE_EVENT_MS / speedRef.current);
  }, [complete]);

  const enqueue = useCallback(
    (payload: AnimationQueuePayload) => {
      clearTimer();
      setSkipped(false);
      snapshotRef.current = payload.finalState;
      setFinalState(payload.finalState);
      queueRef.current = [...payload.events];
      setDisplayedEvents([]);

      if (payload.events.length === 0) {
        complete(payload.finalState);
        return;
      }

      setIsPlaying(true);
      timerRef.current = setTimeout(tick, BASE_EVENT_MS / speedRef.current);
    },
    [complete, tick]
  );

  const skip = useCallback(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot || !isPlaying) return;

    setSkipped(true);
    setDisplayedEvents((prev) => [...prev, ...queueRef.current]);
    complete(snapshot);
  }, [complete, isPlaying]);

  const reset = useCallback(() => {
    clearTimer();
    queueRef.current = [];
    snapshotRef.current = null;
    setDisplayedEvents([]);
    setFinalState(null);
    setIsPlaying(false);
    setSkipped(false);
  }, []);

  const changeSpeed = useCallback((next: AnimationSpeed) => {
    setSpeed(next);
    speedRef.current = next;
  }, []);

  return {
    displayedEvents,
    finalState,
    isPlaying,
    speed,
    skipped,
    setSpeed: changeSpeed,
    enqueue,
    skip,
    reset,
  };
}
