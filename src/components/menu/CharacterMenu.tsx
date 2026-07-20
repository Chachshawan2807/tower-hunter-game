import { useState } from "react";
import {
  formatFlatBonusSuffix,
  formatFlatPercentBonusSuffix,
  formatPercentBonusSuffix,
  formatPercentPoints,
  formatStatNumber,
  formatStoredPercent,
  type GearStatBonus,
} from "../../engine/art/equipment";
import { STATUS_POINT_COST, type StatusStatKey } from "../../engine/formulas/statusPoints";
import { t, type Locale } from "../../utils/i18n";
import { api, type PlayerStatsResponse } from "../../utils/api";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { SkillPath } from "../../engine/types";
import { CharacterEquipmentPanel } from "../character/CharacterEquipmentPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface CharacterMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  stats: PlayerStatsResponse["stats"] | null;
  displayName: string;
  equipment: CharacterEquipmentVisual;
  equipmentStatBonus?: GearStatBonus;
  equipBusy?: boolean;
  unequipBusy?: boolean;
  onEquipFromBag?: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onUnequip?: (slot: EquipmentSlot) => Promise<boolean>;
  onStatsChange?: (stats: PlayerStatsResponse["stats"]) => void;
}

interface StatRow {
  key: string;
  baseValue: string;
  gearBonus?: string;
  vital?: boolean;
  allocStat?: StatusStatKey;
}

function totalAllocatedFromStats(
  stats: PlayerStatsResponse["stats"]
): number {
  return (
    (stats.alloc_hp ?? 0) +
    (stats.alloc_mp ?? 0) +
    (stats.alloc_atk ?? 0) +
    (stats.alloc_def ?? 0) +
    (stats.alloc_spd ?? 0) +
    (stats.alloc_crit ?? 0) +
    (stats.alloc_crit_dmg ?? 0) +
    (stats.alloc_resist ?? 0) +
    (stats.alloc_eva ?? 0) +
    (stats.alloc_acc ?? 0)
  );
}

interface StatCardProps {
  stat: StatRow;
  canAllocate: boolean;
  allocBusy: StatusStatKey | null;
  userId: string | null;
  locale: Locale;
  onAllocate: (stat: StatusStatKey) => void;
}

function StatCard({
  stat,
  canAllocate,
  allocBusy,
  userId,
  locale,
  onAllocate,
}: StatCardProps) {
  const hasGearBonus = Boolean(stat.gearBonus);
  const allocatable = Boolean(stat.allocStat);

  return (
    <div
      className={[
        "stat-item",
        "stat-item--stacked",
        stat.vital ? "stat-item--vital" : "",
        allocatable ? "stat-item--allocatable" : "",
        allocatable && canAllocate ? "stat-item--alloc-ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="stat-item__head">
        <span className="stat-item__label">{stat.key}</span>
        {allocatable && (
          <button
            type="button"
            className="stat-item__alloc-btn"
            disabled={!canAllocate || !userId}
            aria-label={t("char.allocate.aria", locale, { stat: stat.key })}
            title={t("char.allocate.hint", locale, { cost: STATUS_POINT_COST })}
            onClick={() => onAllocate(stat.allocStat!)}
          >
            <span className="stat-item__alloc-btn-icon" aria-hidden="true">
              {allocBusy === stat.allocStat ? "…" : "+"}
            </span>
          </button>
        )}
      </div>

      <div className="stat-item__base tabular-nums">{stat.baseValue}</div>

      <div
        className={`stat-item__gear tabular-nums${hasGearBonus ? "" : " stat-item__gear--empty"}`}
        aria-label={t("char.stat_gear_bonus", locale)}
      >
        {stat.gearBonus ?? "—"}
      </div>
    </div>
  );
}

export function CharacterMenu({
  locale,
  userId,
  skillPath,
  stats,
  displayName,
  equipment,
  equipmentStatBonus = {},
  equipBusy = false,
  unequipBusy = false,
  onEquipFromBag,
  onUnequip,
  onStatsChange,
}: CharacterMenuProps) {
  const [allocBusy, setAllocBusy] = useState<StatusStatKey | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [allocMessage, setAllocMessage] = useState<string | null>(null);

  if (!stats) {
    return <p className="menu-empty">{t("char.stats", locale)}...</p>;
  }

  const bonus = equipmentStatBonus;
  const statusPoints = stats.status_points ?? 0;
  const allocatedTotal = totalAllocatedFromStats(stats);
  const interactionBusy = resetBusy || allocBusy !== null;
  const canAllocate =
    statusPoints >= STATUS_POINT_COST &&
    !interactionBusy &&
    !resetConfirmOpen;
  const canReset = allocatedTotal > 0 && !interactionBusy && Boolean(userId);

  const handleAllocate = async (stat: StatusStatKey) => {
    if (!userId || !canAllocate) return;
    setAllocBusy(stat);
    setAllocMessage(null);
    try {
      const result = await api.allocateStatusPoint(userId, stat);
      onStatsChange?.(result.stats);
    } catch (err) {
      setAllocMessage(
        err instanceof Error
          ? err.message
          : t("char.allocate.error", locale)
      );
    } finally {
      setAllocBusy(null);
    }
  };

  const handleResetStatus = async () => {
    if (!userId || resetBusy || allocatedTotal <= 0) return;
    setResetBusy(true);
    setAllocMessage(null);
    try {
      const result = await api.resetStatusAllocations(userId);
      onStatsChange?.(result.stats);
      setResetConfirmOpen(false);
    } catch (err) {
      setAllocMessage(
        err instanceof Error
          ? err.message
          : t("char.status_reset.error", locale)
      );
    } finally {
      setResetBusy(false);
    }
  };

  const statRows: StatRow[] = [
    {
      key: "HP",
      vital: true,
      allocStat: "hp",
      baseValue: formatStatNumber(stats.max_hp),
      gearBonus: formatFlatBonusSuffix(bonus.maxHp),
    },
    {
      key: "MP",
      vital: true,
      allocStat: "mp",
      baseValue: formatStatNumber(stats.max_mp),
      gearBonus: formatFlatBonusSuffix(bonus.maxMp),
    },
    {
      key: "ATK",
      allocStat: "atk",
      baseValue: formatStatNumber(stats.atk),
      gearBonus: formatFlatBonusSuffix(bonus.atk),
    },
    {
      key: "DEF",
      allocStat: "def",
      baseValue: formatStatNumber(stats.def),
      gearBonus: formatFlatBonusSuffix(bonus.def),
    },
    {
      key: "SPD",
      allocStat: "spd",
      baseValue: formatStatNumber(stats.speed),
      gearBonus: formatFlatBonusSuffix(bonus.speed),
    },
    {
      key: "CRIT",
      allocStat: "crit",
      baseValue: formatStoredPercent(stats.crit_chance),
      gearBonus: formatPercentBonusSuffix(bonus.critChance),
    },
    {
      key: "CRIDMG",
      allocStat: "crit_dmg",
      baseValue: formatStoredPercent(stats.crit_damage),
      gearBonus: formatPercentBonusSuffix(bonus.critDamage),
    },
    {
      key: "RESIST",
      allocStat: "resist",
      baseValue: formatStoredPercent(stats.status_resist),
      gearBonus: formatPercentBonusSuffix(bonus.statusResist),
    },
    {
      key: "EVA",
      allocStat: "eva",
      baseValue: formatPercentPoints(stats.evasion),
      gearBonus: formatFlatPercentBonusSuffix(bonus.evasion),
    },
    {
      key: "ACC",
      allocStat: "acc",
      baseValue: formatPercentPoints(stats.accuracy),
      gearBonus: formatFlatPercentBonusSuffix(bonus.accuracy),
    },
  ];

  return (
    <div className="char-menu">
      <CharacterEquipmentPanel
        locale={locale}
        userId={userId}
        skillPath={skillPath}
        equipment={equipment}
        displayName={displayName}
        equipBusy={equipBusy}
        unequipBusy={unequipBusy}
        onEquipFromBag={onEquipFromBag}
        onUnequip={onUnequip}
      />

      <div className="char-menu__section ui-section">
        <div className="stat-grid stat-grid--character">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`status-spacer-${index}`}
              className="stat-grid__spacer"
              aria-hidden="true"
            />
          ))}
          <div
            className="stat-item stat-item--status-point"
            aria-label={`${t("char.status_point", locale)} ${statusPoints}`}
          >
            <span className="stat-item__status-row">
              <span className="stat-item__status-label">
                {t("char.status_point", locale)}
              </span>
              <span className="stat-item__status-value tabular-nums">
                {statusPoints}
              </span>
              <button
                type="button"
                className="stat-item__reset-btn"
                disabled={!canReset || resetConfirmOpen}
                aria-label={t("char.status_reset.aria", locale)}
                title={t("char.status_reset.aria", locale)}
                onClick={() => setResetConfirmOpen(true)}
              >
                {t("char.status_reset", locale)}
              </button>
            </span>
          </div>

          {statRows.map((stat) => (
            <StatCard
              key={stat.key}
              stat={stat}
              canAllocate={canAllocate}
              allocBusy={allocBusy}
              userId={userId}
              locale={locale}
              onAllocate={(key) => void handleAllocate(key)}
            />
          ))}
        </div>

        {allocMessage && (
          <p className="char-menu__alloc-message" role="status">
            {allocMessage}
          </p>
        )}

        {resetConfirmOpen && (
          <ConfirmDialog
            locale={locale}
            title={t("char.status_reset.confirm_title", locale)}
            message={t("char.status_reset.confirm_message", locale)}
            confirmLabel={t("char.status_reset", locale)}
            confirmTone="crimson"
            busy={resetBusy}
            onConfirm={() => void handleResetStatus()}
            onCancel={() => {
              if (!resetBusy) setResetConfirmOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
