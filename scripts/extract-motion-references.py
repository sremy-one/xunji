"""Create local-only motion contact sheets from reference GIFs.

These sheets are production aids. They must never be copied into src/ or a
release artifact.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def evenly_spaced_indices(frame_count: int, sample_count: int) -> list[int]:
    if frame_count <= 1:
        return [0] * sample_count
    return [
        round(index * (frame_count - 1) / (sample_count - 1))
        for index in range(sample_count)
    ]


def make_sheet(source: Path, output: Path) -> None:
    with Image.open(source) as image:
        frame_count = getattr(image, "n_frames", 1)
        frames: list[Image.Image] = []
        for frame_index in evenly_spaced_indices(frame_count, 4):
            image.seek(frame_index)
            frame = image.convert("RGB")
            frame = ImageOps.contain(frame, (480, 480), Image.Resampling.LANCZOS)
            cell = Image.new("RGB", (512, 512), "#f7f2e8")
            cell.paste(frame, ((512 - frame.width) // 2, (512 - frame.height) // 2))
            frames.append(cell)

    sheet = Image.new("RGB", (1024, 1024), "#f7f2e8")
    for index, frame in enumerate(frames):
        sheet.paste(frame, ((index % 2) * 512, (index // 2) * 512))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=92)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    make_sheet(args.source.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
