import { useState } from "react";
import type { GearStatBonus } from "../../engine/art/equipment";
import { STATUS_POINT_COST, type StatusStatKey } from "../../engine/formulas/statusPoints";
import { runWithOfflineQueue } from "../../client/offline/queueMutation";
import { t, type Locale } from "../../utils/i18n";
import { api, type PlayerStatsResponse } from "../../utils/api";
import { createActionIdempotencyKey } from "../../utils/idempotencyKey";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { SkillPath } from "../../engine/types";
import { CharacterEquipmentPanel } from "../character/CharacterEquipmentPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CharacterStatCard } from "./CharacterStatCard";
import { buildCharacterStatRows, totalAllocatedFromStats } from "./characterStatRows";

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
  const [allocBusy, setAllocBusy] = useState<StatusStatKey | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [allocMessage, setAllocMessage] = useState<string | null>(null);

  if (!stats) {
    return <p className="menu-empty">{t("char.stats", locale)}...</p>;
  }

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
      const idempotencyKey = createActionIdempotencyKey(
        "status_allocate",
        userId,
        stat
      );
      const result = await runWithOfflineQueue(
        "status_allocate",
        userId,
        idempotencyKey,
        { stat },
        () => api.allocateStatusPoint(userId, stat)
      );

      if (result.status === "queued") {
        setAllocMessage(t("common.offline_queued", locale));
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      onStatsChange?.(result.data.stats);
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
        setResetConfirmOpen(false);
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      onStatsChange?.(result.data.stats);
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

  const statRows = buildCharacterStatRows(stats, equipmentStatBonus);

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
