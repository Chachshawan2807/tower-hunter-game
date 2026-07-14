type Ctx = AudioContext;

export interface AmbientHandle {
  stop: () => void;
}

export function startWindAmbient(ctx: Ctx, master: GainNode, volume: number): AmbientHandle {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.98 + white * 0.02;
    data[i] = last * 3;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();

  return { stop: () => source.stop() };
}

export function startDripAmbient(ctx: Ctx, master: GainNode, volume: number): AmbientHandle {
  let stopped = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const drip = () => {
    if (stopped) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  };

  timer = setInterval(drip, 2200 + Math.random() * 1800);
  drip();

  return {
    stop: () => {
      stopped = true;
      if (timer) clearInterval(timer);
    },
  };
}
