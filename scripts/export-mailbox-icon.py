"""Re-export mailbox HUD icon from reference art (treasure chest)."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from export_ui_icon import REPO_ROOT, export_ui_icon

DEFAULT_SRC = (
    REPO_ROOT / "docs" / "art" / "ui-icons" / "reference" / "mailbox-reference.png"
)
DEFAULT_OUT = REPO_ROOT / "public" / "icons" / "ui" / "mailbox.png"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export mailbox/treasure-chest HUD icon for CSS mask + currentColor"
    )
    parser.add_argument(
        "--src",
        type=Path,
        default=DEFAULT_SRC,
        help=f"Reference image (default: {DEFAULT_SRC.relative_to(REPO_ROOT)})",
    )
    parser.add_argument(
        "--size",
        type=int,
        default=128,
        help="Output square size in pixels",
    )
    args = parser.parse_args()
    src = args.src.expanduser().resolve()
    path = export_ui_icon(src, DEFAULT_OUT, size=args.size)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
