/**
 * Generates Art Bible §10 audio assets as WAV → OGG + MP3.
 * Run: node scripts/generateAudioAssets.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO_ROOT = join(ROOT, "public", "audio");
const SAMPLE_RATE = 44100;

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
  }
  writeFileSync(filePath, buffer);
}

function encodeWithFfmpeg(wavPath, outPath) {
  if (!ffmpegPath) throw new Error("ffmpeg-static binary not found");
  const ext = outPath.split(".").pop();
  const codec = ext === "mp3" ? "libmp3lame" : "libvorbis";
  execFileSync(ffmpegPath, ["-y", "-i", wavPath, "-c:a", codec, "-q:a", "4", outPath], {
    stdio: "pipe",
  });
}

function renderAsset(baseName, subdir, renderFn) {
  const dir = join(AUDIO_ROOT, subdir);
  ensureDir(dir);
  const wavPath = join(dir, `${baseName}.wav`);
  const oggPath = join(dir, `${baseName}.ogg`);
  const mp3Path = join(dir, `${baseName}.mp3`);
  const samples = renderFn();
  writeWav(wavPath, samples);
  encodeWithFfmpeg(wavPath, oggPath);
  encodeWithFfmpeg(wavPath, mp3Path);
  unlinkSync(wavPath);
  console.log(`  ✓ ${subdir}/${baseName}.ogg + .mp3`);
}

function seconds(len) {
  return Math.floor(SAMPLE_RATE * len);
}

function env(t, attack, release, duration) {
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

function noise() {
  return Math.random() * 2 - 1;
}

function synthMetalHit() {
  const dur = 0.14;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.002, 0.05, dur);
    const freq = 1800 * Math.exp(-t * 28);
    out[i] = (sine(freq, t) * 0.45 + noise() * 0.25) * e;
  }
  return out;
}

function synthCrit() {
  const dur = 0.22;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.001, 0.08, dur);
    out[i] = (sine(900 - t * 1200, t) * 0.35 + sine(220, t) * 0.25 + noise() * 0.2) * e;
  }
  return out;
}

function synthFlesh() {
  const dur = 0.12;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.003, 0.04, dur);
    out[i] = (sine(120 - t * 200, t) * 0.5 + noise() * 0.15) * e;
  }
  return out;
}

function synthFootstep() {
  const dur = 0.08;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.001, 0.03, dur);
    out[i] = (sine(80, t) * 0.4 + noise() * 0.2) * e;
  }
  return out;
}

function synthUiClick() {
  const dur = 0.06;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.001, 0.02, dur);
    out[i] = sine(1200 - t * 3000, t) * 0.35 * e;
  }
  return out;
}

function synthSkillCast() {
  const dur = 0.35;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const e = env(t, 0.01, 0.12, dur);
    out[i] = (sine(400 + t * 600, t) * 0.25 + noise() * 0.12) * e;
  }
  return out;
}

function synthWin() {
  const dur = 0.9;
  const n = seconds(dur);
  const out = new Float32Array(n);
  const notes = [220, 277, 330, 440];
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    notes.forEach((f, idx) => {
      const start = idx * 0.15;
      if (t >= start) s += sine(f, t - start) * env(t - start, 0.02, 0.2, 0.5);
    });
    out[i] = s * 0.18;
  }
  return out;
}

function synthLose() {
  const dur = 1.1;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const freq = 180 - t * 80;
    const e = env(t, 0.02, 0.4, dur);
    out[i] = sine(Math.max(60, freq), t) * 0.35 * e;
  }
  return out;
}

function synthWindLoop() {
  const dur = 6;
  const n = seconds(dur);
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    last = last * 0.995 + noise() * 0.005;
    const lfo = 0.7 + 0.3 * sine(0.15, t);
    out[i] = last * 3.5 * lfo * 0.35;
  }
  return out;
}

function synthDripLoop() {
  const dur = 8;
  const n = seconds(dur);
  const out = new Float32Array(n);
  const drips = [1.2, 2.8, 4.5, 6.1, 7.3];
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    let s = noise() * 0.02;
    for (const d of drips) {
      const dt = t - d;
      if (dt >= 0 && dt < 0.25) {
        const e = env(dt, 0.001, 0.15, 0.25);
        s += sine(800 - dt * 2000, dt) * 0.35 * e;
      }
    }
    out[i] = s;
  }
  return out;
}

function synthTowerHum() {
  const dur = 8;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const lfo = 0.85 + 0.15 * sine(0.08, t);
    out[i] = (sine(55, t) * 0.2 + sine(110, t) * 0.08) * lfo;
  }
  return out;
}

function synthBattleMusic() {
  const dur = 12;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const beat = t % 0.9;
    let s = sine(55, t) * 0.12;
    if (beat < 0.2) {
      const e = env(beat, 0.001, 0.12, 0.2);
      s += sine(80 - beat * 120, beat) * 0.35 * e;
    }
    s += sine(220, t) * 0.03 * (0.5 + 0.5 * sine(0.25, t));
    out[i] = s;
  }
  return out;
}

function synthTowerMusic() {
  const dur = 14;
  const n = seconds(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const lfo = 0.88 + 0.12 * sine(0.06, t);
    out[i] =
      (sine(110, t) * 0.1 + sine(165, t) * 0.05 + sine(220, t) * 0.03) * lfo;
  }
  return out;
}

console.log("Generating audio assets…\n");

if (!ffmpegPath || !existsSync(ffmpegPath)) {
  console.error("ffmpeg-static binary missing");
  process.exit(1);
}

const sfx = [
  ["metal_hit", synthMetalHit],
  ["crit", synthCrit],
  ["flesh_crit", synthFlesh],
  ["footstep", synthFootstep],
  ["ui_click", synthUiClick],
  ["skill_cast", synthSkillCast],
  ["battle_win", synthWin],
  ["battle_lose", synthLose],
];

for (const [name, fn] of sfx) {
  renderAsset(name, "sfx", fn);
}

const ambient = [
  ["wind", synthWindLoop],
  ["drip", synthDripLoop],
  ["tower_hum", synthTowerHum],
];

for (const [name, fn] of ambient) {
  renderAsset(name, "ambient", fn);
}

const music = [
  ["battle", synthBattleMusic],
  ["tower", synthTowerMusic],
];

for (const [name, fn] of music) {
  renderAsset(name, "music", fn);
}

console.log("\nDone — assets in public/audio/");
