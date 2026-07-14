import { useEffect, useRef } from "react";
import type { AnimationEvent } from "../engine/types";
import { audioManager } from "../audio";

function sfxForEvent(
  event: AnimationEvent
): "metal_hit" | "metal_crit" | "flesh_crit" | "footstep" | "battle_win" | "battle_lose" | "skill_cast" | null {
  switch (event.type) {
    case "attack":
      return event.metadata?.skillId && event.metadata.skillId !== "basic_attack"
        ? "skill_cast"
        : "metal_hit";
    case "critical":
      return "metal_crit";
    case "damage":
      return "flesh_crit";
    case "turn_start":
      return "footstep";
    case "battle_win":
      return "battle_win";
    case "battle_lose":
      return "battle_lose";
    default:
      return null;
  }
}

interface UseBattleAudioOptions {
  displayedEvents: AnimationEvent[];
  inBattle: boolean;
  isPlaying: boolean;
}

export function useBattleAudio({
  displayedEvents,
  inBattle,
  isPlaying,
}: UseBattleAudioOptions): void {
  const lastIndexRef = useRef(0);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      void audioManager.unlock();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (inBattle && isPlaying) {
      audioManager.startMusic("battle_tension");
      audioManager.startAmbient("wind");
      audioManager.startAmbient("drip");
    } else {
      audioManager.stopMusic();
      if (!inBattle) {
        audioManager.stopAmbient();
      }
    }
    return () => {
      audioManager.stopMusic();
    };
  }, [inBattle, isPlaying]);

  useEffect(() => {
    if (displayedEvents.length <= lastIndexRef.current) return;
    const fresh = displayedEvents.slice(lastIndexRef.current);
    lastIndexRef.current = displayedEvents.length;

    for (const ev of fresh) {
      const sfx = sfxForEvent(ev);
      if (sfx) void audioManager.playSfx(sfx);
    }
  }, [displayedEvents]);
}

interface UseTowerAmbientOptions {
  active: boolean;
}

export function useTowerAmbient({ active }: UseTowerAmbientOptions): void {
  useEffect(() => {
    if (!active) {
      audioManager.stopAmbient("tower_hum");
      audioManager.stopMusic();
      return;
    }
    void audioManager.unlock().then(() => {
      audioManager.startAmbient("tower_hum");
      audioManager.startMusic("tower_ambient");
    });
    return () => {
      audioManager.stopAmbient("tower_hum");
      audioManager.stopMusic();
    };
  }, [active]);
}

export function playUiClick(): void {
  void audioManager.unlock().then(() => audioManager.playSfx("ui_click"));
}
