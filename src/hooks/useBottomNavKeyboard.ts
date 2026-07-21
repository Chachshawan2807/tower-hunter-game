import { useEffect, type RefObject } from "react";

export function useBottomNavKeyboard(
  navRef: RefObject<HTMLElement | null>,
  isAnyOverlayOpen: boolean
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyOverlayOpen) return;
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      const tabs = navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (!tabs || tabs.length === 0) return;

      const tabsArr = Array.from(tabs);
      const currentIndex = tabsArr.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true"
      );
      const base = currentIndex >= 0 ? currentIndex : 0;
      let next: number;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabsArr.length - 1;
      else {
        const delta = event.key === "ArrowRight" ? 1 : -1;
        next = (base + delta + tabsArr.length) % tabsArr.length;
      }
      event.preventDefault();
      tabsArr[next]?.click();
      tabsArr[next]?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAnyOverlayOpen, navRef]);
}
