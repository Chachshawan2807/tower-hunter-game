import { useEffect, type RefObject } from "react";

function isTextEntryFocused(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  if (active.isContentEditable) return true;
  if (active instanceof HTMLTextAreaElement) return true;
  if (active instanceof HTMLInputElement) {
    const type = active.type.toLowerCase();
    return type === "text" || type === "search" || type === "email" || type === "password" || type === "url" || type === "tel";
  }
  return false;
}

export function useBottomNavKeyboard(
  navRef: RefObject<HTMLElement | null>,
  isAnyOverlayOpen: boolean
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyOverlayOpen) return;
      if (isTextEntryFocused()) return;
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
