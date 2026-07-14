import { useCallback, useState } from "react";
import type { NavTab } from "../components/layouts/BottomNav";

export type ActiveMenu = NavTab | null;

export const OVERLAY_MENUS: NavTab[] = ["character", "skills", "bag", "shop"];

export function isOverlayMenu(menu: ActiveMenu): menu is Exclude<NavTab, "tower"> {
  return menu !== null && menu !== "tower";
}

export function useMenuNavigation(initial: ActiveMenu = null) {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(initial);

  const selectTab = useCallback((tab: NavTab) => {
    setActiveMenu((prev) => (prev === tab ? null : tab));
  }, []);

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const overlayOpen = isOverlayMenu(activeMenu);

  return {
    activeMenu,
    overlayOpen,
    selectTab,
    closeMenu,
  };
}
