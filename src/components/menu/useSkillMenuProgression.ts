import { useCallback, useEffect, useState } from "react";
import { defaultSkillLoadout } from "../../engine/skills";
import type { SkillLoadout } from "../../engine/skills/loadout";
import { getHotGameDataForUser } from "../../client/cache/gameDataMemory";
import { patchGameDataCache } from "../../client/cache/gameDataStore";
import { runWithOfflineQueue } from "../../client/offline/queueMutation";
import { api } from "../../utils/api";
import { createActionIdempotencyKey } from "../../utils/idempotencyKey";
import type { SkillMenuCategory } from "./SkillCategorySection";
import type { PendingSkillUnlock } from "./SkillStatGrid";
import { DEFAULT_EXPANDED } from "./skillMenuConstants";

interface UseSkillMenuProgressionOptions {
  userId: string | null;
  onSkillPointsChange?: (skillPoints: number) => void;
}

function initialFromHot(userId: string | null) {
  const hot = getHotGameDataForUser(userId);
  if (!hot) {
    return {
      unlockedSkillIds: [] as string[],
      loadout: defaultSkillLoadout([]),
      skillPoints: 0,
      hydrated: false,
    };
  }
  return {
    unlockedSkillIds: hot.skillProgression.unlockedSkillIds ?? [],
    loadout: hot.skillProgression.loadout ?? defaultSkillLoadout(hot.skillProgression.unlockedSkillIds),
    skillPoints: hot.skillProgression.skillPoints,
    hydrated: true,
  };
}

export function useSkillMenuProgression({
  userId,
  onSkillPointsChange,
}: UseSkillMenuProgressionOptions) {
  const initial = initialFromHot(userId);
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<string[]>(
    initial.unlockedSkillIds
  );
  const [loadout, setLoadout] = useState<SkillLoadout>(initial.loadout);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<PendingSkillUnlock | null>(
    null
  );
  const [pendingRespec, setPendingRespec] = useState(false);
  const [respecBusy, setRespecBusy] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<SkillMenuCategory>
  >(() => new Set(DEFAULT_EXPANDED));

  const applyProgression = useCallback(
    (data: Awaited<ReturnType<typeof api.getSkillProgression>>) => {
      setUnlockedSkillIds(data.unlockedSkillIds ?? []);
      setLoadout(data.loadout ?? defaultSkillLoadout(data.unlockedSkillIds));
      onSkillPointsChange?.(data.skillPoints);
      if (userId) {
        patchGameDataCache(userId, { skillProgression: data });
      }
    },
    [onSkillPointsChange, userId]
  );

  const fetchProgression = useCallback(async () => {
    if (!userId) {
      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      return;
    }

    const hot = getHotGameDataForUser(userId);
    if (hot) {
      applyProgression(hot.skillProgression);
    }

    try {
      const data = await api.getSkillProgression(userId);
      applyProgression(data);
    } catch {
      if (!hot) {
        setUnlockedSkillIds([]);
      }
    }
  }, [userId, applyProgression]);

  useEffect(() => {
    const next = initialFromHot(userId);
    setUnlockedSkillIds(next.unlockedSkillIds);
    setLoadout(next.loadout);
    onSkillPointsChange?.(next.skillPoints);

    if (!userId) return;

    void api
      .getSkillProgression(userId)
      .then(applyProgression)
      .catch(() => undefined);
  }, [userId, applyProgression, onSkillPointsChange]);

  const toggleCategory = (category: SkillMenuCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleUnlock = async (skillId: string) => {
    if (!userId || unlockingId) return;
    setUnlockingId(skillId);
    setOfflineMessage(null);
    try {
      const idempotencyKey = createActionIdempotencyKey(
        "skill_unlock",
        userId,
        skillId
      );
      const result = await runWithOfflineQueue(
        "skill_unlock",
        userId,
        idempotencyKey,
        { skillId },
        () => api.unlockSkill(userId, skillId)
      );

      if (result.status === "queued") {
        setOfflineMessage("common.offline_queued");
        setPendingUnlock(null);
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      setUnlockedSkillIds(result.data.unlockedSkillIds);
      onSkillPointsChange?.(result.data.skillPoints);
      setPendingUnlock(null);
      void fetchProgression();
    } finally {
      setUnlockingId(null);
    }
  };

  const handleRespec = async () => {
    if (!userId || respecBusy) return;
    setRespecBusy(true);
    setOfflineMessage(null);
    try {
      const idempotencyKey = createActionIdempotencyKey(
        "skill_respec",
        userId,
        "all"
      );
      const result = await runWithOfflineQueue(
        "skill_respec",
        userId,
        idempotencyKey,
        {},
        () => api.respecSkills(userId)
      );

      if (result.status === "queued") {
        setOfflineMessage("common.offline_queued");
        setPendingRespec(false);
        return;
      }
      if (result.status === "error") {
        throw result.error;
      }

      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      onSkillPointsChange?.(result.data.skillPoints);
      setPendingRespec(false);
      void fetchProgression();
    } finally {
      setRespecBusy(false);
    }
  };

  const canRespec =
    unlockedSkillIds.length > 0 &&
    Boolean(userId) &&
    !respecBusy &&
    !pendingRespec;

  const collapseCategories = useCallback(() => {
    setExpandedCategories(new Set(DEFAULT_EXPANDED));
  }, []);

  return {
    unlockedSkillIds,
    loadout,
    setLoadout,
    unlockingId,
    pendingUnlock,
    setPendingUnlock,
    pendingRespec,
    setPendingRespec,
    respecBusy,
    expandedCategories,
    toggleCategory,
    handleUnlock,
    handleRespec,
    canRespec,
    collapseCategories,
    offlineMessage,
  };
}
