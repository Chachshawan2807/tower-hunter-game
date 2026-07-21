import { useCallback, useEffect, useState } from "react";
import { defaultSkillLoadout } from "../../engine/skills";
import type { SkillLoadout } from "../../engine/skills/loadout";
import { api } from "../../utils/api";
import type { SkillMenuCategory } from "./SkillCategorySection";
import type { PendingSkillUnlock } from "./SkillStatGrid";
import { DEFAULT_EXPANDED } from "./skillMenuConstants";

interface UseSkillMenuProgressionOptions {
  userId: string | null;
  onSkillPointsChange?: (skillPoints: number) => void;
}

export function useSkillMenuProgression({
  userId,
  onSkillPointsChange,
}: UseSkillMenuProgressionOptions) {
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<string[]>([]);
  const [loadout, setLoadout] = useState<SkillLoadout>(
    defaultSkillLoadout([])
  );
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<PendingSkillUnlock | null>(
    null
  );
  const [pendingRespec, setPendingRespec] = useState(false);
  const [respecBusy, setRespecBusy] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<SkillMenuCategory>
  >(() => new Set(DEFAULT_EXPANDED));

  const fetchProgression = useCallback(async () => {
    if (!userId) {
      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      return;
    }
    try {
      const data = await api.getSkillProgression(userId);
      setUnlockedSkillIds(data.unlockedSkillIds ?? []);
      setLoadout(data.loadout ?? defaultSkillLoadout(data.unlockedSkillIds));
      onSkillPointsChange?.(data.skillPoints);
    } catch {
      setUnlockedSkillIds([]);
    }
  }, [userId, onSkillPointsChange]);

  useEffect(() => {
    void fetchProgression();
  }, [fetchProgression]);

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
    try {
      const result = await api.unlockSkill(userId, skillId);
      setUnlockedSkillIds(result.unlockedSkillIds);
      onSkillPointsChange?.(result.skillPoints);
      setPendingUnlock(null);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleRespec = async () => {
    if (!userId || respecBusy) return;
    setRespecBusy(true);
    try {
      const result = await api.respecSkills(userId);
      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      onSkillPointsChange?.(result.skillPoints);
      setPendingRespec(false);
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
  };
}
