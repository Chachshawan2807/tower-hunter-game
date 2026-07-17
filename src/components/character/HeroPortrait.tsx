import { memo } from "react";
import { PLAYER_HERO_PORTRAIT_URL } from "../../engine/art/sprites/characterSheetConfig";

interface HeroPortraitProps {
  size?: "stage" | "battle" | "menu" | "npc";
  className?: string;
}

export const HeroPortrait = memo(function HeroPortrait({
  size = "battle",
  className = "",
}: HeroPortraitProps) {
  return (
    <img
      className={["hero-portrait", `hero-portrait--${size}`, className].filter(Boolean).join(" ")}
      src={PLAYER_HERO_PORTRAIT_URL}
      alt=""
      draggable={false}
      aria-hidden="true"
    />
  );
});
