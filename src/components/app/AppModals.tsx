import { OverlayModal } from "../layouts/OverlayModal";
import { SettingsMenu } from "../menu/SettingsMenu";
import { MailboxMenu } from "../menu/MailboxMenu";
import { t, type Locale } from "../../utils/i18n";
import type { SkillPath } from "../../engine/types";

interface AppModalsProps {
  locale: Locale;
  modal: "settings" | "mailbox" | null;
  userId: string | null;
  skillPath: SkillPath;
  onCloseModal: () => void;
  onToggleLocale: () => void;
  onMailboxChange: () => void;
}

export function AppModals({
  locale,
  modal,
  userId,
  skillPath,
  onCloseModal,
  onToggleLocale,
  onMailboxChange,
}: AppModalsProps) {
  return (
    <>
      {modal === "settings" && (
        <OverlayModal
          variant="dialog"
          title={t("settings.title", locale)}
          locale={locale}
          onClose={onCloseModal}
        >
          <SettingsMenu locale={locale} onToggleLocale={onToggleLocale} />
        </OverlayModal>
      )}

      {modal === "mailbox" && (
        <OverlayModal
          variant="dialog"
          title={t("bag.mailbox", locale)}
          locale={locale}
          onClose={() => {
            onCloseModal();
            onMailboxChange();
          }}
        >
          <MailboxMenu
            locale={locale}
            userId={userId}
            skillPath={skillPath}
            onMailboxChange={onMailboxChange}
          />
        </OverlayModal>
      )}
    </>
  );
}
