"""Re-export reset-undo.png from a user-provided reference path."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from export_ui_icon import REPO_ROOT, export_ui_icon

DEFAULT_OUT = REPO_ROOT / "public" / "icons" / "ui" / "reset-undo.png"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--src",
        type=Path,
        required=True,
        help="Path to reference image (any folder)",
    )
    args = parser.parse_args()
    src = args.src.expanduser().resolve()
    path = export_ui_icon(src, DEFAULT_OUT)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
