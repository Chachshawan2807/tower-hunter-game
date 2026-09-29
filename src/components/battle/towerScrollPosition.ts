import { TOWER_TOTAL_FLOORS } from "./towerFloorScale";

export const TOWER_GRID_COLUMNS = 4;
export const TOWER_GRID_GAP_PX = 6;
const FALLBACK_ROW_STRIDE_PX = 92 + TOWER_GRID_GAP_PX;

export function measureTowerRowStridePx(gridEl: HTMLElement): number {
  const cell = gridEl.querySelector<HTMLElement>(".tower-floor-grid__cell");
  if (!cell) return FALLBACK_ROW_STRIDE_PX;
  const h = cell.getBoundingClientRect().height;
  if (h > 0) return h + TOWER_GRID_GAP_PX;
  return FALLBACK_ROW_STRIDE_PX;
}

/**
 * Pin the row containing `floor` to the bottom of the scroll viewport.
 * Matches flex wrap-reverse grid (floor 1 at bottom).
 */
export function towerScrollTopForFloor(
  floor: number,
  scrollEl: HTMLElement,
  gridEl: HTMLElement
): number {
  const rowStride = measureTowerRowStridePx(gridEl);
  const rowFromBottom = Math.floor((floor - 1) / TOWER_GRID_COLUMNS);
  const rowCount = Math.ceil(TOWER_TOTAL_FLOORS / TOWER_GRID_COLUMNS);
  const rowFromTop = rowCount - 1 - rowFromBottom;
  const rowBottomInGrid = (rowFromTop + 1) * rowStride - TOWER_GRID_GAP_PX;
  const gridOffset = gridEl.offsetTop;
  const raw = gridOffset + rowBottomInGrid - scrollEl.clientHeight;
  const max = scrollEl.scrollHeight - scrollEl.clientHeight;
  return Math.max(0, Math.min(max, raw));
}
