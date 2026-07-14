import { ACTION_GAUGE_MAX, type StatValue } from "../types";

/** Speed 100 fills gauge from 0→100 in this many ticks (baseline). */
export const TICKS_TO_FULL_GAUGE = 10;

/**
 * Accumulates action gauge each tick proportional to Speed.
 * Higher speed reaches 100% faster and acts first.
 */
export function tickActionGauge(
  currentGauge: StatValue,
  speed: StatValue
): StatValue {
  if (speed <= 0) return currentGauge;
  const fillPerTick = (speed / 100) * (ACTION_GAUGE_MAX / TICKS_TO_FULL_GAUGE);
  return Math.min(ACTION_GAUGE_MAX, currentGauge + fillPerTick);
}

export function isGaugeReady(gauge: StatValue): boolean {
  return gauge >= ACTION_GAUGE_MAX;
}

export function resetActionGauge(): StatValue {
  return 0;
}

export interface GaugeTickResult {
  id: string;
  gauge: StatValue;
  ready: boolean;
}

/**
 * Advances all entity gauges by one tick and returns updated values.
 */
export function tickAllGauges(
  entities: Array<{ id: string; gauge: StatValue; speed: StatValue }>
): GaugeTickResult[] {
  return entities.map(({ id, gauge, speed }) => {
    const updated = tickActionGauge(gauge, speed);
    return { id, gauge: updated, ready: isGaugeReady(updated) };
  });
}

/**
 * Returns the entity id with the highest gauge (breaks ties by higher speed).
 */
export function selectNextActor(
  entities: Array<{ id: string; gauge: StatValue; speed: StatValue }>
): string | null {
  const ready = entities.filter((e) => isGaugeReady(e.gauge));
  if (ready.length === 0) return null;

  ready.sort((a, b) => b.gauge - a.gauge || b.speed - a.speed);
  return ready[0].id;
}
