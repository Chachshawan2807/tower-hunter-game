import { useEffect, useRef, useCallback } from "react";
import type { AnimationEvent } from "../../engine/types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

const BURST_EVENTS = new Set(["attack", "critical", "damage"]);

function spawnBurst(width: number, height: number, critical: boolean): Particle[] {
  const cx = width * 0.72;
  const cy = height * 0.42;
  const count = critical ? 28 : 16;
  const particles: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = critical ? 2.5 + Math.random() * 4 : 1.5 + Math.random() * 3;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      maxLife: 0.5 + Math.random() * 0.4,
      size: critical ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      hue: critical ? 38 + Math.random() * 12 : 350 + Math.random() * 8,
    });
  }
  return particles;
}

interface CombatFxCanvasProps {
  displayedEvents: AnimationEvent[];
  width?: number;
  height?: number;
}

export function CombatFxCanvas({
  displayedEvents,
  width = 320,
  height = 200,
}: CombatFxCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastEventRef = useRef(0);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.life -= 0.028;
      if (p.life <= 0) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.vx *= 0.98;

      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, 55%, ${alpha * 0.85})`;
      ctx.fill();
      alive.push(p);
    }
    particlesRef.current = alive;

    if (alive.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [width, height]);

  useEffect(() => {
    if (displayedEvents.length <= lastEventRef.current) return;

    const fresh = displayedEvents.slice(lastEventRef.current);
    lastEventRef.current = displayedEvents.length;

    for (const ev of fresh) {
      if (!BURST_EVENTS.has(ev.type)) continue;
      const critical = ev.type === "critical";
      particlesRef.current.push(...spawnBurst(width, height, critical));
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [displayedEvents, width, height, tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="combat-fx-canvas"
      width={width}
      height={height}
      aria-hidden="true"
    />
  );
}
