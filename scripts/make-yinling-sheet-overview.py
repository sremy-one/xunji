"""Create a labeled contact sheet for visual QA of the 28 release actions."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "design" / "yinling-exercises" / "sheets"
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


def main() -> None:
    items = list(BODYWEIGHT.items()) + list(EQUIPMENT.items())
    cell_w, cell_h = 320, 350
    rows = (len(items) + 3) // 4
    canvas = Image.new("RGB", (cell_w * 4, cell_h * rows), "#eee8dd")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    for index, (exercise_id, sheet_name) in enumerate(items):
        with Image.open(SHEETS / sheet_name) as source:
            preview = ImageOps.fit(source.convert("RGB"), (300, 300), Image.Resampling.LANCZOS)
        x = (index % 4) * cell_w + 10
        y = (index // 4) * cell_h + 10
        canvas.paste(preview, (x, y))
        draw.text((x + 4, y + 312), exercise_id, fill="#102b4c", font=font)
    output = ROOT / "design" / "yinling-exercises" / "yinling-core-28-overview.jpg"
    canvas.save(output, quality=88, optimize=True)
    print(output)


if __name__ == "__main__":
    main()
