import { useEffect } from "react";

interface UseBattleAutoSubmitOptions {
  enabled: boolean;
  onSubmit: () => void | Promise<void>;
  delayMs?: number;
}

export function useBattleAutoSubmit({
  enabled,
  onSubmit,
  delayMs = 8000,
}: UseBattleAutoSubmitOptions) {
  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      void onSubmit();
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [enabled, onSubmit, delayMs]);
}

interface UseBattleAutoResetOptions {
  enabled: boolean;
  onReset: () => void;
  delayMs?: number;
}

interface UseBattleStallWatchdogOptions {
  active: boolean;
  pausedForInput: boolean;
  busy: boolean;
  isPlaying: boolean;
  isComplete: boolean;
  onResume: () => void | Promise<void>;
  intervalMs?: number;
}

/** Nudges battle steps if the client queue stalls with auto or neutral flow. */
export function useBattleStallWatchdog({
  active,
  pausedForInput,
  busy,
  isPlaying,
  isComplete,
  onResume,
  intervalMs = 3500,
}: UseBattleStallWatchdogOptions) {
  useEffect(() => {
    if (!active || isComplete || pausedForInput) return;

    const id = window.setInterval(() => {
      if (busy || isPlaying) return;
      void onResume();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [
    active,
    pausedForInput,
    busy,
    isPlaying,
    isComplete,
    onResume,
    intervalMs,
  ]);
}

export function useBattleAutoReset({
  enabled,
  onReset,
  delayMs = 2200,
}: UseBattleAutoResetOptions) {
  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(onReset, delayMs);
    return () => window.clearTimeout(timer);
  }, [enabled, onReset, delayMs]);
}
