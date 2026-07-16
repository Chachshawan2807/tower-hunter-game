import { useCallback, useEffect, useState } from "react";
import { getDefaultLoadout } from "../../engine/skills/loadout";
import type { SkillPath } from "../../engine/types";
import { api, type SkillProgressionResponse } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon, pathIconName, skillIconName } from "../ui/icons";
import { SkillLoadoutPanel } from "./SkillLoadoutPanel";
import { SkillUpgradePanel } from "./SkillUpgradePanel";

interface SkillMenuProps {
  locale: Locale;
  userId: string | null;
  playerLevel: number;
  activePath: SkillPath;
  onPathChange: (path: SkillPath) => void;
}

const PATHS: Array<{ id: SkillPath; nameKey: string }> = [
  { id: "imperial", nameKey: "skills.imperial" },
  { id: "knight", nameKey: "skills.knight" },
  { id: "vanguard", nameKey: "skills.vanguard" },
];

export function SkillMenu({
  locale,
  userId,
  playerLevel,
  activePath,
  onPathChange,
}: SkillMenuProps) {
  const [savingPath, setSavingPath] = useState(false);
  const [progression, setProgression] = useState<SkillProgressionResponse | null>(
    null
  );
  const [loadoutByPath, setLoadoutByPath] = useState<
    Partial<Record<SkillPath, [string, string]>>
  >({});
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const fetchProgression = useCallback(async () => {
    if (!userId) {
      setProgression(null);
      return;
    }
    try {
      const data = await api.getSkillProgression(userId);
      setProgression(data);
      setLoadoutByPath((prev) => ({
        ...prev,
        [data.path]: data.loadout.activeSlots,
      }));
    } catch {
      setProgression(null);
    }
  }, [userId, activePath, playerLevel]);

  useEffect(() => {
    fetchProgression();
  }, [fetchProgression]);

  const skills = progression?.skills ?? [];
  const unlockedIds = skills.filter((s) => s.unlocked).map((s) => s.id);
  const savedSlots =
    loadoutByPath[activePath] ??
    getDefaultLoadout(activePath, playerLevel).activeSlots;

  useEffect(() => {
    if (skills.length === 0) return;
    setSelectedSkillId((prev) =>
      prev && skills.some((s) => s.id === prev) ? prev : skills[0].id
    );
  }, [skills, activePath]);

  const selectedSkill =
    skills.find((s) => s.id === selectedSkillId) ?? skills[0] ?? null;

  const selectPath = async (path: SkillPath) => {
    if (!userId || path === activePath || savingPath) return;
    setSavingPath(true);
    try {
      await onPathChange(path);
      const data = await api.getSkillProgression(userId);
      setProgression(data);
      setLoadoutByPath((prev) => ({
        ...prev,
        [path]: data.loadout.activeSlots,
      }));
    } finally {
      setSavingPath(false);
    }
  };

  const handleLoadoutSaved = (slots: [string, string]) => {
    setLoadoutByPath((prev) => ({ ...prev, [activePath]: slots }));
  };

  const handleUpgraded = (
    result: { ranks: SkillProgressionResponse["upgrades"][string]; skillPoints: number },
    skillId: string
  ) => {
    setProgression((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skillPoints: result.skillPoints,
        upgrades: { ...prev.upgrades, [skillId]: result.ranks },
        skills: prev.skills.map((s) =>
          s.id === skillId ? { ...s, upgrades: result.ranks } : s
        ),
      };
    });
    fetchProgression();
  };

  return (
    <div className="skill-menu">
      <p className="skill-sp-balance ui-balance">
        <GameIcon name="skill-spark" size={18} className="skill-sp-balance__icon" />
        {t("skills.skill_points", locale)}: {progression?.skillPoints ?? "—"}
      </p>

      <p className="menu-subtitle">
        {t("skills.paths", locale)} · {t("hud.level", locale)} {playerLevel}
      </p>

      <div className="skill-path-tabs">
        {PATHS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`skill-path-tab skill-path-tab--${p.id} ${activePath === p.id ? "skill-path-tab--active" : ""}`}
            onClick={() => selectPath(p.id)}
            disabled={savingPath}
          >
            <GameIcon name={pathIconName(p.id)} size={22} />
            <span>{t(p.nameKey, locale)}</span>
          </button>
        ))}
      </div>

      <div className="skill-panels">
        <section className="skill-panel skill-panel--loadout">
          <h3 className="skill-panel__title">{t("skills.loadout", locale)}</h3>
          <SkillLoadoutPanel
            locale={locale}
            userId={userId}
            path={activePath}
            savedSlots={savedSlots}
            unlockedIds={unlockedIds}
            skills={skills}
            onSaved={handleLoadoutSaved}
          />
          <ul className="skill-picker">
            {skills.map((skill) => (
              <li key={skill.id}>
                <button
                  type="button"
                  className={`skill-picker__item ${
                    selectedSkill?.id === skill.id
                      ? "skill-picker__item--active"
                      : ""
                  } ${!skill.unlocked ? "skill-picker__item--locked" : ""}`}
                  onClick={() => setSelectedSkillId(skill.id)}
                >
                  {skill.unlocked ? (
                    <GameIcon name={skillIconName(skill.id)} size={20} />
                  ) : (
                    <GameIcon name="lock" size={20} />
                  )}
                  <span>{t(skill.stringId, locale)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="skill-panel skill-panel--upgrade">
          <h3 className="skill-panel__title">{t("skills.detail", locale)}</h3>
          {selectedSkill ? (
            <SkillUpgradePanel
              locale={locale}
              userId={userId}
              skill={selectedSkill}
              skillPoints={progression?.skillPoints ?? 0}
              onUpgraded={handleUpgraded}
            />
          ) : (
            <p className="menu-empty">{t("skills.select_skill", locale)}</p>
          )}
        </section>
      </div>
    </div>
  );
}
