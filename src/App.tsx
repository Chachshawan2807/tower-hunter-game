import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TowerView } from "./components/battle/TowerView";
import { BottomNav } from "./components/layouts/BottomNav";
import { GameShell } from "./components/layouts/GameShell";
import { MainStage } from "./components/layouts/MainStage";
import { MenuOverlay } from "./components/layouts/MenuOverlay";
import { OverlayModal } from "./components/layouts/OverlayModal";
import { TopHud } from "./components/layouts/TopHud";
import { SettingsMenu } from "./components/menu/SettingsMenu";
import { GameIcon } from "./components/ui/icons";
import { useBattle } from "./hooks/useBattle";
import { useLocale } from "./hooks/useLocale";
import { isOverlayMenu, useMenuNavigation } from "./hooks/useMenuNavigation";
import { usePlayer } from "./hooks/usePlayer";
import { useBattleAudio, useTowerAmbient } from "./hooks/useGameAudio";
import { usePlayerEquipment } from "./hooks/usePlayerEquipment";
import { useAudioSettings } from "./hooks/useAudioSettings";
import { formatBattleEvent } from "./components/battle/battleLog";
import { t } from "./utils/i18n";

export function App() {
  const { locale, toggleLocale } = useLocale();
  useAudioSettings();
  const player = usePlayer();
  const { activeMenu, overlayOpen, selectTab, closeMenu } = useMenuNavigation();
  const [currentFloor, setCurrentFloor] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (player.currentFloor > 0) {
      setCurrentFloor(player.currentFloor);
    }
  }, [player.currentFloor]);

  const onBattleComplete = useCallback(async () => {
    if (player.userId) {
      await player.refreshStats(player.userId);
    }
  }, [player.userId, player.refreshStats]);

  const battle = useBattle(player.userId, onBattleComplete);
  const { visual: playerEquipment, statBonus, equipFromBag, equipBusy, equipMessage } =
    usePlayerEquipment(player.userId, player.skillPath);

  const isMainView = activeMenu === null;
  const isTowerView = activeMenu === "tower";

  const inTowerBattle =
    isTowerView &&
    (battle.displayedEvents.length > 0 ||
      battle.battleSnapshot !== null ||
      battle.busy);

  useTowerAmbient({ active: isTowerView && !inTowerBattle });
  useBattleAudio({
    displayedEvents: battle.displayedEvents,
    inBattle: inTowerBattle,
    isPlaying: battle.isPlaying,
  });

  const battleLogEntries = useMemo(() => {
    return battle.displayedEvents.map((ev) =>
      formatBattleEvent(ev, locale, battle.battleSnapshot?.entities)
    );
  }, [battle.displayedEvents, battle.battleSnapshot?.entities, locale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (settingsOpen || overlayOpen) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const tabs = navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (!tabs || tabs.length === 0) return;

      const tabsArr = Array.from(tabs);
      const currentIndex = tabsArr.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true"
      );
      const base = currentIndex >= 0 ? currentIndex : 0;
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = (base + delta + tabsArr.length) % tabsArr.length;
      event.preventDefault();
      tabsArr[next]?.click();
      tabsArr[next]?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, overlayOpen]);

  if (player.loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-screen__inner">
          <span className="loading-screen__icon-wrap" aria-hidden="true">
            <GameIcon name="sword-cross" size={48} />
          </span>
          <span className="loading-screen__title">{t("loading", locale)}</span>
          <div className="loading-screen__bar" aria-hidden="true">
            <div className="loading-screen__bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameShell locale={locale} battleLog={battleLogEntries} homeMode={isMainView} towerFloor={isTowerView ? currentFloor : undefined}>
      <div
        className={[
          "game-viewport",
          "view-readable",
          overlayOpen || settingsOpen ? "is-menu-open" : "",
          isTowerView ? "is-dark-stage" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <TopHud
          locale={locale}
          displayName={player.displayName}
          level={player.level}
          exp={player.exp}
          gold={player.gold}
          compact={isMainView}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {isMainView && (
          <MainStage
            locale={locale}
            displayName={player.displayName}
            skillPath={player.skillPath}
            equipment={playerEquipment}
          />
        )}

        {isTowerView && (
          <div className="stage">
            <TowerView
              locale={locale}
              currentFloor={currentFloor}
              climbFloor={player.currentFloor}
              skillPath={player.skillPath}
              playerLevel={player.level}
              playerEquipment={playerEquipment}
              battle={battle}
            />
          </div>
        )}

        {overlayOpen && isOverlayMenu(activeMenu) && (
          <MenuOverlay
            menu={activeMenu}
            locale={locale}
            userId={player.userId}
            playerLevel={player.level}
            skillPath={player.skillPath}
            gold={player.gold}
            stats={player.stats}
            displayName={player.displayName}
            equipment={playerEquipment}
            equipmentStatBonus={statBonus}
            equipFromBag={equipFromBag}
            equipBusy={equipBusy}
            equipMessage={equipMessage}
            onClose={closeMenu}
            onPathChange={player.changeSkillPath}
            onPurchase={() => {
              if (player.userId) player.refreshStats(player.userId);
            }}
          />
        )}

        {settingsOpen && (
          <OverlayModal
            title={t("settings.title", locale)}
            locale={locale}
            onClose={() => setSettingsOpen(false)}
          >
            <SettingsMenu locale={locale} onToggleLocale={toggleLocale} />
          </OverlayModal>
        )}

        <BottomNav
          ref={navRef}
          locale={locale}
          active={activeMenu}
          onSelect={selectTab}
        />
      </div>
    </GameShell>
  );
}
