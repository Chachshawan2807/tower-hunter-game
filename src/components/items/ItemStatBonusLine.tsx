import { parseStatBonusLine } from "../../utils/parseStatBonusLine";

interface ItemStatBonusLineProps {
  line: string;
}

export function ItemStatBonusLine({ line }: ItemStatBonusLineProps) {
  const { label, value } = parseStatBonusLine(line);
  if (!value) {
    return <span className="item-stat-line__label">{label}</span>;
  }
  return (
    <>
      <span className="item-stat-line__label">{label}</span>{" "}
      <span className="item-stat-line__value tabular-nums">{value}</span>
    </>
  );
}

interface ItemStatBonusLinesProps {
  lines: string[];
  className: string;
  itemClassName?: string;
}

export function ItemStatBonusLines({
  lines,
  className,
  itemClassName,
}: ItemStatBonusLinesProps) {
  if (lines.length === 0) return null;
  return (
    <ul className={className}>
      {lines.map((line) => (
        <li key={line} className={itemClassName}>
          <ItemStatBonusLine line={line} />
        </li>
      ))}
    </ul>
  );
}
