import { GameIcon } from "../ui/icons";
import { t, type Locale } from "../../utils/i18n";

interface LoadingScreenProps {
  locale: Locale;
}

export function LoadingScreen({ locale }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__inner">
        <span className="loading-screen__icon-wrap" aria-hidden="true">
          <GameIcon name="sword-cross" size={48} />
        </span>
        <span className="loading-screen__title">{t("loading", locale)}</span>
        <div className="loading-screen__bar" aria-hidden="true">
          <div className="loading-screen__bar-fill" />
        </div>
      </div>
    </div>
  );
}
