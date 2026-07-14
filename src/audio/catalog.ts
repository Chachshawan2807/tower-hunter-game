export type SfxId =
  | "metal_hit"
  | "metal_crit"
  | "flesh_crit"
  | "footstep"
  | "ui_click"
  | "battle_win"
  | "battle_lose"
  | "skill_cast";

export type AmbientId = "wind" | "drip" | "tower_hum";

export type MusicId = "battle_tension" | "tower_ambient";

export interface AudioCatalogEntry {
  volume: number;
  /** Path under /audio/ — OGG primary, procedural fallback if missing */
  src?: string;
  loop?: boolean;
}

export const SFX_CATALOG: Record<SfxId, AudioCatalogEntry> = {
  metal_hit: { volume: 0.35, src: "/audio/sfx/metal_hit.ogg" },
  metal_crit: { volume: 0.5, src: "/audio/sfx/crit.ogg" },
  flesh_crit: { volume: 0.45, src: "/audio/sfx/flesh_crit.ogg" },
  footstep: { volume: 0.2, src: "/audio/sfx/footstep.ogg" },
  ui_click: { volume: 0.25, src: "/audio/sfx/ui_click.ogg" },
  battle_win: { volume: 0.4, src: "/audio/sfx/battle_win.ogg" },
  battle_lose: { volume: 0.4, src: "/audio/sfx/battle_lose.ogg" },
  skill_cast: { volume: 0.3, src: "/audio/sfx/skill_cast.ogg" },
};

export const AMBIENT_CATALOG: Record<AmbientId, AudioCatalogEntry> = {
  wind: { volume: 0.12, src: "/audio/ambient/wind.ogg", loop: true },
  drip: { volume: 0.1, src: "/audio/ambient/drip.ogg", loop: true },
  tower_hum: { volume: 0.08, src: "/audio/ambient/tower_hum.ogg", loop: true },
};

export const MUSIC_CATALOG: Record<MusicId, AudioCatalogEntry> = {
  battle_tension: { volume: 0.18, src: "/audio/music/battle.ogg", loop: true },
  tower_ambient: { volume: 0.14, src: "/audio/music/tower.ogg", loop: true },
};
