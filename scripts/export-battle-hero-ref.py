"""Raster battle hero refs: dark background -> transparent PNG, crop to content."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = REPO_ROOT / "public" / "assets" / "characters" / "battle-hero"


def key_luma(r: int, g: int, b: int) -> int:
    return (r + g + b) // 3


def export_battle_hero_ref(
    src: Path,
    out: Path,
    *,
    bg_threshold: int = 28,
    max_height: int = 2048,
) -> Path:
    if not src.is_file():
        raise FileNotFoundError(f"Reference not found: {src}")

    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            lum = key_luma(r, g, b)
            if lum <= bg_threshold:
                px[x, y] = (0, 0, 0, 0)
            else:
                alpha = min(255, max(0, (lum - bg_threshold) * 3))
                px[x, y] = (r, g, b, alpha if alpha > 12 else 0)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    target_h = min(max_height, 1024)
    if im.height != target_h:
        ratio = target_h / im.height
        im = im.resize(
            (max(1, int(round(im.width * ratio))), target_h),
            Image.Resampling.LANCZOS,
        )

    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, optimize=True)
    return out


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export battle hero reference PNG")
    parser.add_argument("--src", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--bg-threshold", type=int, default=28)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    src = args.src.expanduser().resolve()
    out = args.out if args.out.is_absolute() else REPO_ROOT / args.out
    path = export_battle_hero_ref(src, out, bg_threshold=args.bg_threshold)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
