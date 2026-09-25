import type { BattleStepResponse } from "../../utils/api";
import { formatGoldAmount } from "../../utils/formatGold";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";

type BattleRewards = NonNullable<BattleStepResponse["rewards"]>;

interface BattleResultRewardsProps {
  locale: Locale;
  rewards: BattleRewards;
}

export function BattleResultRewards({
  locale,
  rewards,
}: BattleResultRewardsProps) {
  return (
    <ul
      className="battle-result-rewards"
      aria-label={t("battle.rewards", locale)}
    >
      <li className="battle-result-rewards__row battle-result-rewards__row--exp">
        <span className="battle-result-rewards__label tabular-nums">
          {t("hud.exp", locale)}:
        </span>
        <span className="battle-result-rewards__value battle-result-rewards__value--exp tabular-nums">
          {rewards.exp.toLocaleString()}
        </span>
      </li>
      <li className="battle-result-rewards__row">
        <span className="battle-result-rewards__label tabular-nums">
          {t("battle.reward.gold", locale)}:
        </span>
        <span className="battle-result-rewards__value battle-result-rewards__value--gold tabular-nums">
          <GameIcon name="gold" size={20} />
          {formatGoldAmount(rewards.gold)}
        </span>
      </li>
    </ul>
  );
}
