import { useCallback, useState } from "react";
import type { NavTab } from "../components/layouts/BottomNav";
import {
  isOverlayMenu,
  useMenuNavigation,
  type ActiveMenu,
} from "./useMenuNavigation";

export type ModalScreen = "settings" | "mailbox";

export { isOverlayMenu };

export function useUIScreen(initial: ActiveMenu = null) {
  const { activeMenu, overlayOpen, selectTab: navSelectTab, closeMenu: navCloseMenu } =
    useMenuNavigation(initial);
  const [modal, setModal] = useState<ModalScreen | null>(null);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const openSettings = useCallback(() => {
    navCloseMenu();
    setModal("settings");
  }, [navCloseMenu]);

  const openMailbox = useCallback(() => {
    navCloseMenu();
    setModal("mailbox");
  }, [navCloseMenu]);

  const selectTab = useCallback(
    (tab: NavTab) => {
      setModal(null);
      navSelectTab(tab);
    },
    [navSelectTab]
  );

  const closeMenu = useCallback(() => {
    navCloseMenu();
  }, [navCloseMenu]);

  const isDialogOpen = modal !== null;
  const isAnyOverlayOpen = overlayOpen || isDialogOpen;

  return {
    activeMenu,
    overlayOpen,
    modal,
    isDialogOpen,
    isAnyOverlayOpen,
    selectTab,
    closeMenu,
    openSettings,
    openMailbox,
    closeModal,
  };
}
