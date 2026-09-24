import { useCallback, useEffect, useRef, useState } from "react";
import { TowerView } from "./components/battle/TowerView";
import { BottomNav } from "./components/layouts/BottomNav";
import { GameShell } from "./components/layouts/GameShell";
import { MainStage } from "./components/layouts/MainStage";
import { MenuOverlay } from "./components/layouts/MenuOverlay";
import { TopHud } from "./components/layouts/TopHud";
import { AppModals } from "./components/app/AppModals";
import { LoadingScreen } from "./components/app/LoadingScreen";
import { useBattle } from "./hooks/useBattle";
import { useLocale } from "./hooks/useLocale";
import { isOverlayMenu, useUIScreen } from "./hooks/useUIScreen";
import { usePlayer } from "./hooks/usePlayer";
import { useBattleAudio, useTowerAmbient } from "./hooks/useGameAudio";
import { usePlayerEquipment } from "./hooks/usePlayerEquipment";
import { useAudioSettings } from "./hooks/useAudioSettings";
import { useMailboxCount } from "./hooks/useMailboxCount";
import { useBottomNavKeyboard } from "./hooks/useBottomNavKeyboard";
import { Render3dDevPreview } from "./components/render3d";

export function App() {
  const { locale, toggleLocale } = useLocale();
  useAudioSettings();
  const player = usePlayer();
  const {
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
  } = useUIScreen();
  const [currentFloor, setCurrentFloor] = useState(1);
  const navRef = useRef<HTMLElement>(null);
  const { count: mailboxCount, refresh: refreshMailboxCount } = useMailboxCount(
    player.userId
  );

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

  const onBattleResumed = useCallback(
    (floor: number) => {
      setCurrentFloor(floor);
      selectTab("tower");
    },
    [selectTab]
  );

  const battle = useBattle(player.userId, onBattleComplete, onBattleResumed);
  const { visual: playerEquipment, statBonus, equipFromBag, unequipSlot, equipBusy, equipMessage, clearEquipMessage } =
    usePlayerEquipment(player.userId, player.skillPath, locale);

  const isMainView = activeMenu === null;
  const isTowerView = activeMenu === "tower";

  const activeBattleSession = battle.sessionId !== null;
  const inTowerBattle = isTowerView && activeBattleSession;

  useTowerAmbient({ active: isTowerView && !activeBattleSession });
  useBattleAudio({
    displayedEvents: battle.displayedEvents,
    inBattle: activeBattleSession,
    isPlaying: battle.isPlaying,
  });

  useBottomNavKeyboard(navRef, isAnyOverlayOpen);

  if (player.loading) {
    return <LoadingScreen locale={locale} />;
  }

  return (
    <GameShell locale={locale} homeMode={isMainView} towerFloor={isTowerView ? currentFloor : undefined}>
      <div
        className={[
          "game-viewport",
          "view-readable",
          isAnyOverlayOpen ? "is-menu-open" : "",
          isDialogOpen ? "is-dialog-open" : "",
          inTowerBattle ? "is-tower-battle" : "",
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
          mailboxCount={mailboxCount}
          compact
          nameEditable={isMainView}
          nameBusy={player.nameBusy}
          onRename={player.changeDisplayName}
          onOpenMailbox={openMailbox}
          onOpenSettings={openSettings}
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
              playerLevel={player.level}
              playerEquipment={playerEquipment}
              battle={battle}
              onOpenSettings={openSettings}
            />
          </div>
        )}

        {overlayOpen && isOverlayMenu(activeMenu) && (
          <MenuOverlay
            menu={activeMenu}
            locale={locale}
            userId={player.userId}
            playerLevel={player.level}
            playerExp={player.exp}
            skillPath={player.skillPath}
            gold={player.gold}
            stats={player.stats}
            displayName={player.displayName}
            equipment={playerEquipment}
            equipmentStatBonus={statBonus}
            equipFromBag={equipFromBag}
            unequipSlot={unequipSlot}
            equipBusy={equipBusy}
            equipMessage={equipMessage}
            clearEquipMessage={clearEquipMessage}
            onClose={closeMenu}
            onPathChange={player.changeSkillPath}
            onGoldChange={player.applyGoldBalance}
            onPurchase={() => {
              /* gold already applied optimistically */
            }}
            onPurchaseError={() => {
              if (player.userId) void player.refreshWallet(player.userId);
            }}
            onSellComplete={(balanceAfter) => {
              player.applyGoldBalance(balanceAfter);
            }}
            onStatsChange={player.applyPlayerStats}
          />
        )}

        <AppModals
          locale={locale}
          modal={modal}
          userId={player.userId}
          skillPath={player.skillPath}
          onCloseModal={closeModal}
          onToggleLocale={toggleLocale}
          onMailboxChange={() => void refreshMailboxCount()}
        />

        <BottomNav
          ref={navRef}
          locale={locale}
          active={activeMenu}
          blocked={isDialogOpen}
          onSelect={selectTab}
        />

        <Render3dDevPreview suppressed={activeBattleSession} />
      </div>
    </GameShell>
  );
}
