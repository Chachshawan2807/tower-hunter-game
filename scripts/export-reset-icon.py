"""Build reset-undo.png from the PNGTree reference in Downloads (transparent + square)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path.home() / "Downloads" / "pngtree-black-and-white-circular-arrow-icon-free-image_2284873.jpg"
OUT = Path(__file__).resolve().parents[1] / "public" / "icons" / "ui" / "reset-undo.png"


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing reference: {SRC}")

    im = Image.open(SRC).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if r > 210 and g > 210 and b > 210:
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
    square = square.resize((128, 128), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    square.save(OUT, optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
