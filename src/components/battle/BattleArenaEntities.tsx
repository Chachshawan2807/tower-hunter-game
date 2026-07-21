import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { BattleEntity, BattleSnapshot } from "../../engine/types";
import type { AnimationState } from "../../engine/art/animationStates";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "../character/CharacterFigure";
import { GameIcon } from "../ui/icons";
import type { EntityHpView } from "./battleArenaTypes";
import { HpBar } from "./HpBar";

interface BattleArenaEntitiesProps {
  locale: Locale;
  snapshot: BattleSnapshot | null;
  skillPath: "imperial" | "knight" | "vanguard";
  playerEquipment: CharacterEquipmentVisual;
  playerEntity?: BattleEntity;
  enemyEntity?: BattleEntity;
  playerHp: EntityHpView;
  enemyHp: EntityHpView;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
}

export function BattleArenaEntities({
  locale,
  snapshot,
  skillPath,
  playerEquipment,
  playerEntity,
  enemyEntity,
  playerHp,
  enemyHp,
  playerAnim,
  enemyAnim,
}: BattleArenaEntitiesProps) {
  return (
    <div className="battle-entities battle-entities--sprites">
      <div className="battle-entity-slot battle-entity-slot--player">
        <CharacterFigure
          equipment={playerEquipment}
          path={skillPath}
          side="player"
          animState={playerAnim}
          statusEffects={playerEntity?.statusEffects.map((s) => s.type)}
          label={t("battle.player", locale)}
          size="battle"
        />
        <HpBar
          label="HP"
          hp={playerHp.hp}
          maxHp={playerHp.maxHp}
          percent={playerHp.percent}
          variant="player"
        />
      </div>

      <span className="battle-vs" aria-hidden="true">
        <GameIcon name="sword-cross" size={22} />
      </span>

      <div className="battle-entity-slot battle-entity-slot--enemy">
        <CharacterFigure
          side="enemy"
          animState={enemyAnim}
          floor={snapshot?.floor}
          statusEffects={enemyEntity?.statusEffects.map((s) => s.type)}
          label={t("battle.enemy", locale)}
          size="battle"
        />
        <HpBar
          label="HP"
          hp={enemyHp.hp}
          maxHp={enemyHp.maxHp}
          percent={enemyHp.percent}
          variant="enemy"
        />
      </div>
    </div>
  );
}
