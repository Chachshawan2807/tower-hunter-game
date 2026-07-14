import { t, type Locale } from "../../utils/i18n";

interface SkillMenuProps {
  locale: Locale;
}

const PATHS = [
  { icon: "🥋", name: "Murim", nameTh: "ยุทธภพ" },
  { icon: "🛡", name: "Knight", nameTh: "อัศวิน" },
  { icon: "🐉", name: "Fantasy", nameTh: "แฟนตาซี" },
];

export function SkillMenu({ locale }: SkillMenuProps) {
  return (
    <div>
      <p style={{ marginBottom: 12, color: "var(--text-dim)", fontSize: "0.85rem" }}>
        {t("skills.paths", locale)}
      </p>
      {PATHS.map((path) => (
        <div key={path.name} className="skill-path">
          <span className="skill-path__icon">{path.icon}</span>
          <span>{locale === "th" ? path.nameTh : path.name}</span>
        </div>
      ))}
    </div>
  );
}
