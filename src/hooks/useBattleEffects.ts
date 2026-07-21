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
