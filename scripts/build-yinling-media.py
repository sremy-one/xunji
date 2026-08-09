"""Build every release GIF and thumbnail from the approved Silverling sheets."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "design" / "yinling-exercises" / "sheets"
THUMBS = ROOT / "src" / "packages" / "library" / "static" / "images"

BODYWEIGHT = {
    "yl-standing-march": "yl-standing-march-v1.png",
    "yl-bodyweight-squat": "yl-bodyweight-squat-v2.png",
    "yl-push-up": "yl-push-up-v1.png",
    "yl-forearm-plank": "yl-forearm-plank-v1.png",
    "yl-glute-bridge": "yl-glute-bridge-v1.png",
    "yl-bird-dog": "yl-bird-dog-v1.png",
    "yl-reverse-lunge": "yl-reverse-lunge-v1.png",
    "yl-standing-calf-raise": "yl-standing-calf-raise-v1.png",
    "yl-dead-bug": "yl-dead-bug-v1.png",
    "yl-kneeling-push-up": "yl-kneeling-push-up-v1.png",
    "yl-arm-circles": "yl-arm-circles-v1.png",
    "yl-wall-slide": "yl-wall-slide-v1.png",
    "yl-kneeling-close-grip-push-up": "yl-kneeling-close-grip-push-up-v1.png",
    "yl-wall-triceps-extension": "yl-wall-triceps-extension-v1.png",
}

EQUIPMENT = {
    "yl-dumbbell-curl": "yl-dumbbell-curl-v2.png",
    "yl-dumbbell-lateral-raise": "yl-dumbbell-lateral-raise-v1.png",
    "yl-one-arm-dumbbell-row": "yl-one-arm-dumbbell-row-v1.png",
    "yl-dumbbell-floor-press": "yl-dumbbell-floor-press-v1.png",
    "yl-dumbbell-goblet-squat": "yl-dumbbell-goblet-squat-v1.png",
    "yl-dumbbell-rdl": "yl-dumbbell-rdl-v1.png",
    "yl-dumbbell-shoulder-press": "yl-dumbbell-shoulder-press-v1.png",
    "yl-dumbbell-triceps-extension": "yl-dumbbell-triceps-extension-v1.png",
    "yl-band-seated-row": "yl-band-seated-row-v1.png",
    "yl-band-pull-apart": "yl-band-pull-apart-v1.png",
    "yl-band-squat": "yl-band-squat-v1.png",
    "yl-band-chest-press": "yl-band-chest-press-v1.png",
    "yl-band-biceps-curl": "yl-band-biceps-curl-v1.png",
    "yl-band-lateral-walk": "yl-band-lateral-walk-v1.png",
}


def build(items: dict[str, str], package: str) -> None:
    gif_dir = ROOT / "src" / "packages" / package / "static" / "gifs"
    for exercise_id, sheet_name in items.items():
        sheet = SHEETS / sheet_name
        if not sheet.exists():
            raise FileNotFoundError(f"Missing approved sheet: {sheet}")
        subprocess.run(
            [
                sys.executable,
                str(ROOT / "scripts" / "build-yinling-gif.py"),
                "--sheet", str(sheet),
                "--gif", str(gif_dir / f"{exercise_id}.gif"),
                "--thumbnail", str(THUMBS / f"{exercise_id}.jpg"),
            ],
            check=True,
        )


def main() -> None:
    build(BODYWEIGHT, "workout-bodyweight")
    build(EQUIPMENT, "workout-equipment")
    print(f"Built {len(BODYWEIGHT) + len(EQUIPMENT)} original GIFs and thumbnails.")


if __name__ == "__main__":
    main()
