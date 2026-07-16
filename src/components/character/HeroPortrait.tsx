import { memo } from "react";
import { PLAYER_HERO_PORTRAIT_URL } from "../../engine/art/sprites/characterSheetConfig";

interface HeroPortraitProps {
  size?: "stage" | "battle" | "menu" | "npc";
  className?: string;
}

const HEIGHT_BY_SIZE: Record<NonNullable<HeroPortraitProps["size"]>, number> = {
  stage: 320,
  menu: 200,
  battle: 160,
  npc: 120,
};

export const HeroPortrait = memo(function HeroPortrait({
  size = "battle",
  className = "",
}: HeroPortraitProps) {
  const height = HEIGHT_BY_SIZE[size];

  return (
    <img
      className={["hero-portrait", `hero-portrait--${size}`, className].filter(Boolean).join(" ")}
      src={PLAYER_HERO_PORTRAIT_URL}
      alt=""
      draggable={false}
      style={{ height, width: "auto" }}
      aria-hidden="true"
    />
  );
});
