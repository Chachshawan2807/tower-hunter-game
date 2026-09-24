import { useState } from "react";
import type { GearStatBonus } from "../../engine/art/equipment";
import { STATUS_POINT_COST, type StatusStatKey } from "../../engine/formulas/statusPoints";
import { runWithOfflineQueue } from "../../client/offline/queueMutation";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { t, type Locale } from "../../utils/i18n";
import { api, type PlayerStatsResponse } from "../../utils/api";
import { createActionIdempotencyKey } from "../../utils/idempotencyKey";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { SkillPath } from "../../engine/types";
import { CharacterEquipmentPanel } from "../character/CharacterEquipmentPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CharacterStatCard } from "./CharacterStatCard";
import type { StatusAllocAmount } from "./CharacterStatAllocPicker";
import { buildCharacterStatRows, totalAllocatedFromStats } from "./characterStatRows";
import {
  optimisticStatusAllocate,
  optimisticStatusReset,
} from "./statusAllocFromStats";
import { useCharacterMenuStats } from "./useCharacterMenuStats";

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
  const [allocBusy, setAllocBusy] = useState<ReadonlySet<StatusStatKey>>(
    () => new Set()
  );
  const [resetBusy, setResetBusy] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [allocMessage, setAllocMessage] = useState<string | null>(null);
  const [activeAllocStat, setActiveAllocStat] = useState<StatusStatKey | null>(
    null
  );
  const { displayStats, pushStats } = useCharacterMenuStats(stats, onStatsChange);

  useDismissOnOutside(
    activeAllocStat !== null && !resetConfirmOpen,
    () => setActiveAllocStat(null),
    [".stat-item__alloc-anchor", ".stat-alloc-picker-panel"]
  );

  if (!displayStats) {
    return <p className="menu-empty">{t("char.stats", locale)}...</p>;
  }

  const statusPoints = displayStats.status_points ?? 0;
  const allocatedTotal = totalAllocatedFromStats(displayStats);
  const resetInteractionBusy = resetBusy || allocBusy.size > 0;
  const canAllocate =
    statusPoints >= STATUS_POINT_COST && !resetBusy && !resetConfirmOpen;
  const canReset = allocatedTotal > 0 && !resetInteractionBusy && Boolean(userId);

  const handleToggleAllocPicker = (stat: StatusStatKey) => {
    if (!canAllocate || !userId) return;
    setActiveAllocStat(stat);
  };

  const handleAllocate = async (stat: StatusStatKey, amount: StatusAllocAmount) => {
    if (!userId || !canAllocate) return;
    if (statusPoints < amount * STATUS_POINT_COST) return;
    const snapshot = displayStats;
    pushStats(optimisticStatusAllocate(displayStats, stat, amount));
    setAllocBusy((prev) => new Set(prev).add(stat));
    setAllocMessage(null);
    try {
      const idempotencyKey = createActionIdempotencyKey(
        "status_allocate",
        userId,
        `${stat}:${amount}`
      );
      const result = await runWithOfflineQueue(
        "status_allocate",
        userId,
        idempotencyKey,
        { stat, count: String(amount) },
        () => api.allocateStatusPoint(userId, stat, amount)
      );

      if (result.status === "queued") {
        setAllocMessage(t("common.offline_queued", locale));
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      pushStats(result.data.stats);
    } catch (err) {
      pushStats(snapshot);
      setAllocMessage(
        err instanceof Error
          ? err.message
          : t("char.allocate.error", locale)
      );
    } finally {
      setAllocBusy((prev) => {
        const next = new Set(prev);
        next.delete(stat);
        return next;
      });
    }
  };

  const handleResetStatus = async () => {
    if (!userId || resetBusy || allocatedTotal <= 0) return;
    const snapshot = displayStats;
    pushStats(optimisticStatusReset(displayStats));
    setResetConfirmOpen(false);
    setResetBusy(true);
    setAllocMessage(null);
    try {
      const idempotencyKey = createActionIdempotencyKey(
        "status_reset",
        userId,
        "all"
      );
      const result = await runWithOfflineQueue(
        "status_reset",
        userId,
        idempotencyKey,
        {},
        () => api.resetStatusAllocations(userId)
      );

      if (result.status === "queued") {
        setAllocMessage(t("common.offline_queued", locale));
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      pushStats(result.data.stats);
    } catch (err) {
      pushStats(snapshot);
      setResetConfirmOpen(true);
      setAllocMessage(
        err instanceof Error
          ? err.message
          : t("char.status_reset.error", locale)
      );
    } finally {
      setResetBusy(false);
    }
  };

  const statRows = buildCharacterStatRows(displayStats, equipmentStatBonus);

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
            <CharacterStatCard
              key={stat.key}
              stat={stat}
              canAllocate={canAllocate}
              allocBusy={allocBusy}
              userId={userId}
              locale={locale}
              statusPoints={statusPoints}
              isPickerOpen={
                stat.allocStat !== undefined &&
                activeAllocStat === stat.allocStat
              }
              onTogglePicker={handleToggleAllocPicker}
              onAllocate={(key, amount) => void handleAllocate(key, amount)}
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
