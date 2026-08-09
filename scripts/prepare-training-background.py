"""Prepare the generated exercise-stage environment for the release bundle."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design" / "training" / "training-stage-environment-v1.png"
OUTPUT = ROOT / "src" / "static" / "training" / "training-stage-environment-v1.jpg"


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE) as source:
        prepared = ImageOps.fit(
            source.convert("RGB"),
            (1200, 800),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        prepared.save(OUTPUT, quality=82, optimize=True, progressive=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
