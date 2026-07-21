import { useEffect, useState } from "react";
import type { SkillPath } from "../../engine/types";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { t, type Locale } from "../../utils/i18n";
import { api, type MailboxItem } from "../../utils/api";
import { BagItemDetail } from "./BagItemDetail";
import { BagItemSlot } from "./BagItemSlot";

interface MailboxMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  onMailboxChange?: () => void;
}

export function MailboxMenu({
  locale,
  userId,
  skillPath,
  onMailboxChange,
}: MailboxMenuProps) {
  const [mailbox, setMailbox] = useState<MailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claimBusy, setClaimBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useDismissOnOutside(
    selectedId !== null,
    () => setSelectedId(null),
    [".bag-item-slot", ".bag-slot-detail"]
  );

  const reload = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const mail = await api.getMailbox(userId);
      setMailbox(mail.items);
      onMailboxChange?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [userId]);

  const handleClaim = async (mailboxId: string): Promise<boolean> => {
    if (!userId || claimBusy) return false;

    setClaimBusy(true);
    setActionMessage(null);
    try {
      await api.claimMailboxItem(userId, mailboxId);
      setActionMessage(t("bag.claimed", locale));
      setSelectedId(null);
      await reload();
      return true;
    } catch {
      return false;
    } finally {
      setClaimBusy(false);
    }
  };

  if (!userId) {
    return <p className="menu-empty">{t("bag.mailbox_empty", locale)}</p>;
  }

  if (loading) {
    return <p className="menu-empty">...</p>;
  }

  const selectedItem = mailbox.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="mailbox-menu">
      {actionMessage && (
        <p className="bag-equip-message" role="status">
          {actionMessage}
        </p>
      )}

      {mailbox.length === 0 ? (
        <p className="menu-empty">{t("bag.mailbox_empty", locale)}</p>
      ) : (
        <>
          <ul className="bag-slot-grid" role="list">
            {mailbox.map((item) => (
              <li key={item.id} className="bag-slot-grid__cell">
                <BagItemSlot
                  id={item.id}
                  itemId={item.item_id}
                  quantity={item.quantity}
                  expiresAt={item.expires_at}
                  locale={locale}
                  skillPath={skillPath}
                  selected={selectedId === item.id}
                  onSelect={setSelectedId}
                />
              </li>
            ))}
          </ul>

          {selectedItem && (
            <div className="bag-slot-detail-wrap" key={selectedItem.id}>
              <BagItemDetail
              id={selectedItem.id}
              itemId={selectedItem.item_id}
              quantity={selectedItem.quantity}
              expiresAt={selectedItem.expires_at}
              locale={locale}
              skillPath={skillPath}
              mode="mailbox"
              onEquip={async () => false}
              onClaim={handleClaim}
              actionBusy={claimBusy}
            />
            </div>
          )}
        </>
      )}
    </div>
  );
}
