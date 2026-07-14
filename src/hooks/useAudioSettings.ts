import { useCallback, useEffect, useState } from "react";
import { audioManager } from "../audio";

const STORAGE_KEY = "tower-hunter-audio";

interface AudioSettings {
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
}

const DEFAULTS: AudioSettings = {
  muted: false,
  musicVolume: 0.7,
  sfxVolume: 0.85,
};

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      muted: parsed.muted ?? DEFAULTS.muted,
      musicVolume: parsed.musicVolume ?? DEFAULTS.musicVolume,
      sfxVolume: parsed.sfxVolume ?? DEFAULTS.sfxVolume,
    };
  } catch {
    return DEFAULTS;
  }
}

function persist(settings: AudioSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applyToManager(settings: AudioSettings): void {
  audioManager.setMuted(settings.muted);
  audioManager.setMusicVolume(settings.musicVolume);
  audioManager.setSfxVolume(settings.sfxVolume);
}

export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);

  useEffect(() => {
    applyToManager(settings);
  }, [settings]);

  const setMuted = useCallback((muted: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, muted };
      persist(next);
      return next;
    });
  }, []);

  const setMusicVolume = useCallback((musicVolume: number) => {
    setSettings((prev) => {
      const next = { ...prev, musicVolume };
      persist(next);
      return next;
    });
  }, []);

  const setSfxVolume = useCallback((sfxVolume: number) => {
    setSettings((prev) => {
      const next = { ...prev, sfxVolume };
      persist(next);
      return next;
    });
  }, []);

  return { settings, setMuted, setMusicVolume, setSfxVolume };
}
