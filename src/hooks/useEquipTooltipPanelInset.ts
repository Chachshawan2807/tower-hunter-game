import { useLayoutEffect, type RefObject } from "react";

/** Matches --char-equip-tooltip-panel-gap (--space-4) in character.css */
const PANEL_INSET_PX = 16;
const DEFAULT_SLOT_GAP_PX = 8;

function readSlotGapPx(node: HTMLElement): number {
  const wrap = node.closest(".char-equip-slot-wrap");
  const source = wrap ?? node;
  const raw = getComputedStyle(source)
    .getPropertyValue("--char-equip-tooltip-slot-gap")
    .trim();
  const px = parseFloat(raw);
  return Number.isFinite(px) ? px : DEFAULT_SLOT_GAP_PX;
}

/** Keep panel inset shift from collapsing the CSS gap between slot button and tooltip. */
function clampShiftForSlotGap(
  shift: number,
  tooltipRect: DOMRect,
  slotRect: DOMRect,
  gap: number
): number {
  const opensRight = tooltipRect.left >= slotRect.right - 2;
  const opensLeft = tooltipRect.right <= slotRect.left + 2;

  if (opensRight) {
    const minShift = slotRect.right + gap - tooltipRect.left;
    if (shift < minShift) return minShift;
  } else if (opensLeft) {
    const maxShift = slotRect.left - gap - tooltipRect.right;
    if (shift > maxShift) return maxShift;
  }
  return shift;
}

export function useEquipTooltipPanelInset(
  visible: boolean,
  tooltipRef: RefObject<HTMLElement | null>
): void {
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!visible || !el) {
      tooltipRef.current?.style.removeProperty("--tooltip-shift-x");
      return;
    }

    const apply = () => {
      if (!tooltipRef.current) return;
      const node = tooltipRef.current;
      node.style.setProperty("--tooltip-shift-x", "0px");

      const panel = node.closest(".overlay__panel");
      const panelRect = panel?.getBoundingClientRect();
      const minLeft = panelRect
        ? panelRect.left + PANEL_INSET_PX
        : PANEL_INSET_PX;
      const maxRight = panelRect
        ? panelRect.right - PANEL_INSET_PX
        : window.innerWidth - PANEL_INSET_PX;

      const slotEl = node
        .closest(".char-equip-slot-wrap")
        ?.querySelector(".char-equip-slot");
      const slotRect = slotEl?.getBoundingClientRect();
      const gap = readSlotGapPx(node);

      const rect = node.getBoundingClientRect();
      let shift = 0;
      if (rect.left < minLeft) {
        shift = minLeft - rect.left;
      } else if (rect.right > maxRight) {
        shift = maxRight - rect.right;
      }

      if (slotRect) {
        shift = clampShiftForSlotGap(shift, rect, slotRect, gap);
      }

      node.style.setProperty("--tooltip-shift-x", `${shift}px`);
    };

    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);

    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      el.style.removeProperty("--tooltip-shift-x");
    };
  }, [visible, tooltipRef]);
}
