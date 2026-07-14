/**
 * Installs CC0 studio audio from Kenney (kenney.nl) into public/audio/.
 * Uses ETdoFresh/kenney.nl mirror + OpenGameArt RPG pack.
 * Run: node scripts/fetchStudioAudio.mjs
 */
import { execFileSync } from "node:child_process";
import {
  createWriteStream,
  mkdirSync,
  copyFileSync,
  existsSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import AdmZip from "adm-zip";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO = join(ROOT, "public", "audio");
const CACHE = join(ROOT, ".cache", "kenney-audio");
const MIRROR_ZIP = join(CACHE, "kenney-mirror.zip");
const MIRROR_ROOT = join(CACHE, "kenney.nl-master");

const MIRROR_URL = "https://github.com/ETdoFresh/kenney.nl/archive/refs/heads/master.zip";

/** Relative to kenney.nl-master/ */
const FILE_MAP = [
  { src: "kenney_rpgaudio/Audio/footstep00.ogg", dest: "sfx/footstep" },
  { src: "kenney_impactsounds/Audio/impactMetal_heavy_002.ogg", dest: "sfx/metal_hit" },
  { src: "kenney_impactsounds/Audio/impactMetal_heavy_004.ogg", dest: "sfx/crit" },
  { src: "kenney_rpgaudio/Audio/knifeSlice.ogg", dest: "sfx/flesh_crit" },
  { src: "kenney_interfacesounds/Audio/click_001.ogg", dest: "sfx/ui_click" },
  { src: "kenney_rpgaudio/Audio/bookFlip1.ogg", dest: "sfx/skill_cast" },
  { src: "kenney_musicjingles/Audio/Hit jingles/jingles_HIT01.ogg", dest: "sfx/battle_win" },
  { src: "kenney_musicjingles/Audio/8-Bit jingles/jingles_NES16.ogg", dest: "sfx/battle_lose" },
  { src: "kenney_rpgaudio/Audio/cloth1.ogg", dest: "ambient/wind", loopSec: 6, filter: "lowpass=f=800" },
  { src: "kenney_rpgaudio/Audio/creak1.ogg", dest: "ambient/drip", loopSec: 8 },
  { src: "kenney_digitalaudio/Audio/lowThreeTone.ogg", dest: "ambient/tower_hum", loopSec: 10 },
  { src: "kenney_digitalaudio/Audio/phaserDown2.ogg", dest: "music/battle", loopSec: 12 },
  { src: "kenney_digitalaudio/Audio/spaceTrash3.ogg", dest: "music/tower", loopSec: 14 },
];

const TEST_MIRROR_ZIP = join(ROOT, ".cache", "audio-test", "mirror.zip");

async function ensureMirror() {
  mkdirSync(CACHE, { recursive: true });
  if (!existsSync(MIRROR_ZIP) && existsSync(TEST_MIRROR_ZIP)) {
    copyFileSync(TEST_MIRROR_ZIP, MIRROR_ZIP);
    console.log("  ↳ Reusing cached Kenney mirror");
  }
  if (!existsSync(MIRROR_ZIP)) {
    process.stdout.write("  ↓ Kenney mirror (one-time, ~200MB)… ");
    await download(MIRROR_URL, MIRROR_ZIP);
    console.log("done");
  }
}

function extractMirror() {
  if (existsSync(MIRROR_ROOT)) return;
  new AdmZip(MIRROR_ZIP).extractAllTo(CACHE, true);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function encode(inPath, outPath, opts = {}) {
  const ext = extname(outPath).slice(1);
  const codec = ext === "mp3" ? "libmp3lame" : "libvorbis";
  const args = ["-y", "-i", inPath];
  if (opts.loopSec) {
    args.unshift("-stream_loop", "-1");
    args.push("-t", String(opts.loopSec));
  }
  if (opts.filter) args.push("-af", opts.filter);
  args.push("-c:a", codec, "-q:a", "4", outPath);
  execFileSync(ffmpegPath, args, { stdio: "pipe" });
}

function install(srcAbs, destPath, opts = {}) {
  const [subdir, base] = destPath.split("/");
  const dir = join(AUDIO, subdir);
  mkdirSync(dir, { recursive: true });
  const oggOut = join(dir, `${base}.ogg`);
  const mp3Out = join(dir, `${base}.mp3`);

  if (opts.loopSec || opts.filter) {
    encode(srcAbs, oggOut, opts);
    encode(srcAbs, mp3Out, opts);
  } else if (extname(srcAbs).toLowerCase() === ".ogg") {
    copyFileSync(srcAbs, oggOut);
    encode(srcAbs, mp3Out);
  } else {
    encode(srcAbs, oggOut);
    encode(srcAbs, mp3Out);
  }

  console.log(`  ✓ ${destPath} ← ${srcAbs.split(/[/\\]/).pop()}`);
}

console.log("Installing Kenney CC0 studio audio…\n");

await ensureMirror();
extractMirror();

for (const entry of FILE_MAP) {
  const srcAbs = join(MIRROR_ROOT, entry.src);
  if (!existsSync(srcAbs)) {
    console.warn(`  ⚠ missing ${entry.src}`);
    continue;
  }
  const { loopSec, filter } = entry;
  install(srcAbs, entry.dest, { loopSec, filter });
}

writeCredits();

console.log("\nDone — studio audio at public/audio/ (Credit: Kenney CC0)");

function writeCredits() {
  writeFileSync(
    join(AUDIO, "CREDITS.md"),
    `# Audio Credits

Studio-quality CC0 assets from [Kenney](https://kenney.nl) (Creative Commons Zero).

Installed by \`npm run fetch:audio\` from the ETdoFresh/kenney.nl mirror.

Attribution appreciated but not required.
`,
    "utf8"
  );
}
