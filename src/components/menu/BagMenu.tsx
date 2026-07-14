import { useEffect, useState } from "react";
import { t, type Locale } from "../../utils/i18n";
import { api } from "../../utils/api";

interface BagMenuProps {
  locale: Locale;
  userId: string | null;
}

export function BagMenu({ locale, userId }: BagMenuProps) {
  const [items, setItems] = useState<unknown[]>([]);

  useEffect(() => {
    if (!userId) return;
    api.getInventory(userId).then((res) => setItems(res.items));
  }, [userId]);

  if (items.length === 0) {
    return <p style={{ color: "var(--text-dim)" }}>{t("bag.empty", locale)}</p>;
  }

  return (
    <ul style={{ listStyle: "none", fontSize: "0.85rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
          {JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
}
