"""Convert a reference image (any path) into a square UI PNG with alpha."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = REPO_ROOT / "public" / "icons" / "ui"


def export_ui_icon(
    src: Path,
    out: Path,
    *,
    size: int = 128,
    white_threshold: int = 210,
) -> Path:
    if not src.is_file():
        raise FileNotFoundError(f"Reference not found: {src}")

    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if r > white_threshold and g > white_threshold and b > white_threshold:
                px[x, y] = (0, 0, 0, 0)
            else:
                px[x, y] = (0, 0, 0, 255)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    side = max(im.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - im.size[0]) // 2
    oy = (side - im.size[1]) // 2
    square.paste(im, (ox, oy))
    square = square.resize((size, size), Image.Resampling.LANCZOS)

    out.parent.mkdir(parents=True, exist_ok=True)
    square.save(out, optimize=True)
    return out


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export reference image to UI PNG")
    parser.add_argument(
        "--src",
        required=True,
        type=Path,
        help="Absolute or relative path to reference image (jpg/png/webp)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        help="Output PNG path (default: public/icons/ui/<src-stem>.png)",
    )
    parser.add_argument("--size", type=int, default=128, help="Output square size")
    parser.add_argument(
        "--white-threshold",
        type=int,
        default=210,
        help="RGB above this becomes transparent",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    src = args.src.expanduser().resolve()
    out = args.out
    if out is None:
        out = DEFAULT_OUT_DIR / f"{src.stem}.png"
    else:
        out = out if out.is_absolute() else REPO_ROOT / out

    path = export_ui_icon(
        src,
        out,
        size=args.size,
        white_threshold=args.white_threshold,
    )
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
