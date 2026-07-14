import {
  AMBIENT_CATALOG,
  MUSIC_CATALOG,
  SFX_CATALOG,
  type AmbientId,
  type MusicId,
  type SfxId,
} from "./catalog";
import { startDripAmbient, startWindAmbient } from "./procedural/ambient";
import { startBattleMusic, startTowerAmbientMusic } from "./procedural/music";
import { playProceduralSfx } from "./procedural/sfx";

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private unlocked = false;
  private muted = false;
  private musicVolume = 0.7;
  private sfxVolume = 0.85;
  private ambientHandles: Partial<Record<AmbientId, { stop: () => void }>> = {};
  private musicHandle: { stop: () => void } | null = null;
  private bufferCache = new Map<string, AudioBuffer>();

  async unlock(): Promise<void> {
    if (this.unlocked) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.sfxBus = this.ctx.createGain();
    this.musicBus = this.ctx.createGain();
    this.ambientBus = this.ctx.createGain();

    this.master.gain.value = this.muted ? 0 : 1;
    this.sfxBus.gain.value = this.sfxVolume;
    this.musicBus.gain.value = this.musicVolume;
    this.ambientBus.gain.value = this.musicVolume * 0.85;
    this.sfxBus.connect(this.master);
    this.musicBus.connect(this.master);
    this.ambientBus.connect(this.master);
    this.master.connect(this.ctx.destination);

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.unlocked = true;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 1;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicBus) this.musicBus.gain.value = this.musicVolume;
    if (this.ambientBus) this.ambientBus.gain.value = this.musicVolume * 0.85;
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxBus) this.sfxBus.gain.value = this.sfxVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  private ensureReady(): boolean {
    return Boolean(this.ctx && this.sfxBus && this.musicBus && this.ambientBus);
  }

  async playSfx(id: SfxId): Promise<void> {
    if (!this.ensureReady() || this.muted) return;
    const entry = SFX_CATALOG[id];
    const ctx = this.ctx!;
    const bus = this.sfxBus!;

    if (entry.src) {
      const played = await this.playBuffer(entry.src, entry.volume, bus);
      if (played) return;
    }
    playProceduralSfx(ctx, bus, id, entry.volume);
  }

  private async loadBuffer(src: string): Promise<AudioBuffer | null> {
    const ctx = this.ctx!;
    try {
      let buffer = this.bufferCache.get(src);
      if (!buffer) {
        const res = await fetch(src);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(arr);
        this.bufferCache.set(src, buffer);
      }
      return buffer;
    } catch {
      return null;
    }
  }

  private async playBuffer(
    src: string,
    volume: number,
    destination: GainNode,
    loop = false
  ): Promise<{ stop: () => void } | null> {
    const ctx = this.ctx!;
    const buffer = await this.loadBuffer(src);
    if (!buffer) return null;

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.loop = loop;
    source.connect(gain);
    gain.connect(destination);
    source.start();

    return {
      stop: () => {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      },
    };
  }

  startAmbient(id: AmbientId): void {
    if (!this.ensureReady() || this.muted) return;
    if (this.ambientHandles[id]) return;

    const entry = AMBIENT_CATALOG[id];
    const ctx = this.ctx!;
    const bus = this.ambientBus!;

    if (entry.src) {
      void this.playBuffer(entry.src, entry.volume, bus, entry.loop ?? false).then((handle) => {
        if (handle) {
          this.ambientHandles[id] = handle;
          return;
        }
        this.startProceduralAmbient(id, ctx, bus, entry.volume);
      });
      return;
    }

    this.startProceduralAmbient(id, ctx, bus, entry.volume);
  }

  private startProceduralAmbient(
    id: AmbientId,
    ctx: AudioContext,
    bus: GainNode,
    volume: number
  ): void {
    if (id === "wind") {
      this.ambientHandles.wind = startWindAmbient(ctx, bus, volume);
    } else if (id === "drip") {
      this.ambientHandles.drip = startDripAmbient(ctx, bus, volume);
    } else {
      this.ambientHandles.tower_hum = startWindAmbient(ctx, bus, volume * 0.6);
    }
  }

  stopAmbient(id?: AmbientId): void {
    if (id) {
      this.ambientHandles[id]?.stop();
      delete this.ambientHandles[id];
      return;
    }
    Object.values(this.ambientHandles).forEach((h) => h?.stop());
    this.ambientHandles = {};
  }

  startMusic(id: MusicId): void {
    if (!this.ensureReady() || this.muted) return;
    this.stopMusic();

    const entry = MUSIC_CATALOG[id];
    const ctx = this.ctx!;
    const bus = this.musicBus!;

    if (entry.src) {
      void this.playBuffer(entry.src, entry.volume, bus, entry.loop ?? false).then((handle) => {
        if (handle) {
          this.musicHandle = handle;
          return;
        }
        this.musicHandle =
          id === "battle_tension"
            ? startBattleMusic(ctx, bus, entry.volume)
            : startTowerAmbientMusic(ctx, bus, entry.volume);
      });
      return;
    }

    this.musicHandle =
      id === "battle_tension"
        ? startBattleMusic(ctx, bus, entry.volume)
        : startTowerAmbientMusic(ctx, bus, entry.volume);
  }

  stopMusic(): void {
    this.musicHandle?.stop();
    this.musicHandle = null;
  }
}

export const audioManager = new AudioManager();
