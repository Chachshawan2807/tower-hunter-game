import { memo } from "react";
import { BATTLE_HERO_VIEW_URLS } from "../../engine/art/battleHeroViews";

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
      src={BATTLE_HERO_VIEW_URLS.front}
      alt=""
      draggable={false}
      aria-hidden="true"
    />
  );
});
