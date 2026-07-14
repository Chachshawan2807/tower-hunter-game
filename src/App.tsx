import { useCallback, useEffect, useMemo, useState } from "react";
import { TowerView } from "./components/battle/TowerView";
import { BottomNav } from "./components/layouts/BottomNav";
import { GameShell } from "./components/layouts/GameShell";
import { MainStage } from "./components/layouts/MainStage";
import { MenuOverlay } from "./components/layouts/MenuOverlay";
import { TopHud } from "./components/layouts/TopHud";
import { useBattle } from "./hooks/useBattle";
import { useLocale } from "./hooks/useLocale";
import { isOverlayMenu, useMenuNavigation } from "./hooks/useMenuNavigation";
import { usePlayer } from "./hooks/usePlayer";
import { formatBattleEvent } from "./components/battle/battleLog";
import { t } from "./utils/i18n";

export function App() {
  const { locale, toggleLocale } = useLocale();
  const player = usePlayer();
  const { activeMenu, overlayOpen, selectTab, closeMenu } = useMenuNavigation();
  const [currentFloor, setCurrentFloor] = useState(1);

  useEffect(() => {
    if (player.currentFloor > 0) {
      setCurrentFloor(player.currentFloor);
    }
  }, [player.currentFloor]);

  const onBattleComplete = useCallback(() => {
    if (player.userId) {
      player.refreshStats(player.userId);
    }
  }, [player.userId, player.refreshStats]);

  const battle = useBattle(player.userId, onBattleComplete);

  useEffect(() => {
    if (battle.isComplete && battle.result === "win" && player.currentFloor) {
      setCurrentFloor(player.currentFloor);
    }
  }, [battle.isComplete, battle.result, player.currentFloor]);

  const isMainView = activeMenu === null;
  const isTowerView = activeMenu === "tower";
  const readableHud = isMainView || overlayOpen;

  const battleLogEntries = useMemo(() => {
    return battle.displayedEvents.map((ev) => {
      switch (ev.type) {
        case "attack":
          return `⚔ ${formatBattleEvent(ev, locale, battle.battleSnapshot?.entities)}`;
        case "damage":
          return `💥 ${ev.value ?? 0}`;
        case "miss":
          return "💨 Miss";
        case "critical":
          return `⚡ Crit ${ev.value ?? ""}`;
        case "dot_damage":
          return `☠ DoT ${ev.value ?? 0}`;
        case "cc_skip":
          return "⏸ CC Skip";
        case "debuff_apply":
          return `☣ ${String(ev.metadata?.effectType ?? "debuff")}`;
        case "heal":
          return `💚 +${ev.value ?? 0}`;
        case "battle_win":
          return "🏆 Victory";
        case "battle_lose":
          return "💀 Defeat";
        default:
          return ev.type;
      }
    });
  }, [battle.displayedEvents, battle.battleSnapshot?.entities, locale]);

  if (player.loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-screen__inner">
          <span className="loading-screen__icon" aria-hidden="true">
            ⚔
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
    <GameShell locale={locale} battleLog={battleLogEntries} homeMode={isMainView}>
      <div className={`game-viewport${readableHud ? " view-readable" : ""}`}>
        <TopHud
          locale={locale}
          displayName={player.displayName}
          level={player.level}
          exp={player.exp}
          gold={player.gold}
          onToggleLocale={toggleLocale}
        />

        {isMainView && (
          <MainStage
            locale={locale}
            displayName={player.displayName}
            skillPath={player.skillPath}
            level={player.level}
          />
        )}

        {isTowerView && (
          <div className="stage">
            <TowerView
              locale={locale}
              currentFloor={currentFloor}
              skillPath={player.skillPath}
              playerLevel={player.level}
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
            onClose={closeMenu}
            onPathChange={player.changeSkillPath}
            onPurchase={() => {
              if (player.userId) player.refreshStats(player.userId);
            }}
          />
        )}

        <BottomNav locale={locale} active={activeMenu} onSelect={selectTab} />
      </div>
    </GameShell>
  );
}
