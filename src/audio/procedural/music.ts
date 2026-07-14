type Ctx = AudioContext;

export interface MusicHandle {
  stop: () => void;
}

/** Minimal tension loop — drum pulse + low drone (Art Bible §10 placeholder) */
export function startBattleMusic(ctx: Ctx, master: GainNode, volume: number): MusicHandle {
  const nodes: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  const drone = ctx.createOscillator();
  const droneGain = ctx.createGain();
  drone.type = "sawtooth";
  drone.frequency.value = 55;
  droneGain.gain.value = volume * 0.15;
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 120;
  drone.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(master);
  drone.start();
  nodes.push(drone);
  gains.push(droneGain);

  let beatTimer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const beat = () => {
    if (stopped) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    g.gain.setValueAtTime(volume * 0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  };

  beatTimer = setInterval(beat, 900);

  return {
    stop: () => {
      stopped = true;
      if (beatTimer) clearInterval(beatTimer);
      nodes.forEach((n) => n.stop());
    },
  };
}

export function startTowerAmbientMusic(ctx: Ctx, master: GainNode, volume: number): MusicHandle {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = 110;
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = volume * 0.08;
  gain.gain.value = volume * 0.12;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.connect(gain);
  gain.connect(master);
  lfo.start();
  osc.start();

  return {
    stop: () => {
      osc.stop();
      lfo.stop();
    },
  };
}
