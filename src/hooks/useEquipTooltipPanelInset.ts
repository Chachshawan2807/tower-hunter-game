import { useLayoutEffect, type RefObject } from "react";

/** Matches --char-equip-tooltip-panel-gap (--space-4) in character.css */
const PANEL_INSET_PX = 16;

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

      const rect = node.getBoundingClientRect();
      let shift = 0;
      if (rect.left < minLeft) {
        shift = minLeft - rect.left;
      } else if (rect.right > maxRight) {
        shift = maxRight - rect.right;
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
