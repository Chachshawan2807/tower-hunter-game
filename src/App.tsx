import { useCallback, useEffect, useState } from "react";
import { TowerView } from "./components/battle/TowerView";
import { BottomNav, type NavTab } from "./components/layouts/BottomNav";
import { GameShell } from "./components/layouts/GameShell";
import { MainStage } from "./components/layouts/MainStage";
import { OverlayModal } from "./components/layouts/OverlayModal";
import { TopHud } from "./components/layouts/TopHud";
import { BagMenu } from "./components/menu/BagMenu";
import { CharacterMenu } from "./components/menu/CharacterMenu";
import { ShopMenu } from "./components/menu/ShopMenu";
import { SkillMenu } from "./components/menu/SkillMenu";
import { useBattle } from "./hooks/useBattle";
import { useLocale } from "./hooks/useLocale";
import { usePlayer } from "./hooks/usePlayer";
import { t } from "./utils/i18n";

const OVERLAY_TABS: NavTab[] = ["character", "skills", "bag", "shop"];

const OVERLAY_TITLES: Record<string, string> = {
  character: "nav.character",
  skills: "nav.skills",
  bag: "nav.bag",
  shop: "nav.shop",
};

export function App() {
  const { locale, toggleLocale } = useLocale();
  const player = usePlayer();
  const [activeTab, setActiveTab] = useState<NavTab>("tower");
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

  const overlayOpen = OVERLAY_TABS.includes(activeTab);

  if (player.loading) {
    return <div className="loading-screen">⚔</div>;
  }

  return (
    <GameShell locale={locale}>
      <TopHud
        locale={locale}
        displayName={player.displayName}
        level={player.level}
        exp={player.exp}
        gold={player.gold}
        onToggleLocale={toggleLocale}
      />

      {activeTab === "tower" ? (
        <div className="stage">
          <TowerView
            locale={locale}
            currentFloor={currentFloor}
            battle={battle}
          />
        </div>
      ) : (
        !overlayOpen && <MainStage />
      )}

      {overlayOpen && (
        <OverlayModal
          title={t(OVERLAY_TITLES[activeTab], locale)}
          locale={locale}
          onClose={() => setActiveTab("tower")}
        >
          {activeTab === "character" && (
            <CharacterMenu locale={locale} stats={player.stats} />
          )}
          {activeTab === "skills" && <SkillMenu locale={locale} />}
          {activeTab === "bag" && (
            <BagMenu locale={locale} userId={player.userId} />
          )}
          {activeTab === "shop" && <ShopMenu locale={locale} />}
        </OverlayModal>
      )}

      <BottomNav locale={locale} active={activeTab} onSelect={setActiveTab} />
    </GameShell>
  );
}
