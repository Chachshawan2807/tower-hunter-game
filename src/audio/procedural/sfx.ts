import type { SfxId } from "../catalog";

type Ctx = AudioContext;

function noiseBuffer(ctx: Ctx, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

function playMetalHit(ctx: Ctx, master: GainNode, volume: number): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "square";
  osc.frequency.setValueAtTime(1800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

  filter.type = "bandpass";
  filter.frequency.value = 2400;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(volume * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.15);

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.06);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(volume * 0.35, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  noise.connect(nGain);
  nGain.connect(master);
  noise.start(now);
}

function playCrit(ctx: Ctx, master: GainNode, volume: number, harsh: boolean): void {
  playMetalHit(ctx, master, volume * 0.7);
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = harsh ? "sawtooth" : "triangle";
  osc.frequency.setValueAtTime(harsh ? 120 : 80, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
  gain.gain.setValueAtTime(volume * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playFootstep(ctx: Ctx, master: GainNode, volume: number): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.12);
}

function playUiClick(ctx: Ctx, master: GainNode, volume: number): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(600, now);
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.06);
}

function playFanfare(ctx: Ctx, master: GainNode, volume: number, win: boolean): void {
  const notes = win ? [220, 277, 330] : [196, 165, 131];
  const now = ctx.currentTime;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = win ? "triangle" : "sawtooth";
    osc.frequency.value = freq;
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume * 0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

export function playProceduralSfx(
  ctx: Ctx,
  master: GainNode,
  id: SfxId,
  volume: number
): void {
  switch (id) {
    case "metal_hit":
    case "skill_cast":
      playMetalHit(ctx, master, volume);
      break;
    case "metal_crit":
      playCrit(ctx, master, volume, false);
      break;
    case "flesh_crit":
      playCrit(ctx, master, volume, true);
      break;
    case "footstep":
      playFootstep(ctx, master, volume);
      break;
    case "ui_click":
      playUiClick(ctx, master, volume);
      break;
    case "battle_win":
      playFanfare(ctx, master, volume, true);
      break;
    case "battle_lose":
      playFanfare(ctx, master, volume, false);
      break;
    default:
      break;
  }
}
