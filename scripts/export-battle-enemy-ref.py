"""Crop, normalize height, and harden ink alpha for battle enemy turnaround PNGs."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = REPO_ROOT / "public" / "assets" / "characters" / "battle-enemy"


def key_luma(r: int, g: int, b: int) -> int:
    return (r + g + b) // 3


def deepen_ink_shadow_tones(
    r: int,
    g: int,
    b: int,
    *,
    strength: float = 0.34,
    highlight_floor: int = 210,
) -> tuple[int, int, int]:
    """Darken mid-tones and shadows; leave bright hatching mostly unchanged."""
    lum = (r + g + b) / 3.0
    if lum >= highlight_floor:
        return r, g, b
    weight = (highlight_floor - lum) / highlight_floor
    factor = 1.0 - strength * weight
    return (
        max(0, min(255, int(round(r * factor)))),
        max(0, min(255, int(round(g * factor)))),
        max(0, min(255, int(round(b * factor)))),
    )


def harden_ink_turnaround_alpha(
    im: Image.Image,
    *,
    ink_lum_min: int = 28,
    alpha_discard_below: int = 20,
    shadow_strength: float = 0.34,
) -> Image.Image:
    """Straighten RGBA so ink reads opaque in WebGL (avoids washed halos on dark BG)."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a <= alpha_discard_below:
                px[x, y] = (0, 0, 0, 0)
                continue
            lum = key_luma(r, g, b)
            if lum <= ink_lum_min:
                px[x, y] = (0, 0, 0, 0)
                continue
            if a < 255:
                scale = 255.0 / max(a, 1)
                r = min(255, int(round(r * scale)))
                g = min(255, int(round(g * scale)))
                b = min(255, int(round(b * scale)))
            r, g, b = deepen_ink_shadow_tones(r, g, b, strength=shadow_strength)
            px[x, y] = (r, g, b, 255)
    return im


def export_battle_enemy_ref(
    src: Path,
    out: Path,
    *,
    max_height: int = 1024,
    shadow_strength: float = 0.34,
) -> Path:
    if not src.is_file():
        raise FileNotFoundError(f"Reference not found: {src}")

    im = Image.open(src).convert("RGBA")
    im = harden_ink_turnaround_alpha(im, shadow_strength=shadow_strength)
    alpha = im.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        im = im.crop(bbox)

    if im.height != max_height:
        ratio = max_height / im.height
        im = im.resize(
            (max(1, int(round(im.width * ratio))), max_height),
            Image.Resampling.LANCZOS,
        )

    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, optimize=True)
    return out


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export battle enemy turnaround PNG")
    parser.add_argument("--src", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--max-height", type=int, default=1024)
    parser.add_argument(
        "--shadow-strength",
        type=float,
        default=0.34,
        help="How much to deepen ink shadows (0–0.4 typical).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    src = args.src.expanduser().resolve()
    out = args.out if args.out.is_absolute() else REPO_ROOT / args.out
    path = export_battle_enemy_ref(
        src,
        out,
        max_height=args.max_height,
        shadow_strength=args.shadow_strength,
    )
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
