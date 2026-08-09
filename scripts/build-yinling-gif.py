"""Build a compact looping exercise GIF and thumbnail from a 2x2 sprite sheet."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageOps


FRAME_SIZE = 200
PALETTE_COLORS = 48
BACKGROUND_TOLERANCE = 42


def crop_cells(sheet: Image.Image) -> list[Image.Image]:
    width, height = sheet.size
    mid_x, mid_y = width // 2, height // 2
    boxes = [
        (0, 0, mid_x, mid_y),
        (mid_x, 0, width, mid_y),
        (0, mid_y, mid_x, height),
        (mid_x, mid_y, width, height),
    ]
    frames: list[Image.Image] = []
    for box in boxes:
        cell = sheet.crop(box).convert("RGB")
        cell = ImageOps.fit(
            cell,
            (FRAME_SIZE, FRAME_SIZE),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        frames.append(cell)
    return frames


def remove_connected_background(frame: Image.Image) -> Image.Image:
    """Remove only the warm backdrop connected to the frame edges.

    Connectivity keeps the mascot's white clothing intact even though it is close
    in color to the generated paper background.
    """
    rgba = frame.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    samples = [
        pixels[2, 2][:3],
        pixels[width - 3, 2][:3],
        pixels[2, height - 3][:3],
        pixels[width - 3, height - 3][:3],
    ]
    backdrop = tuple(sum(sample[channel] for sample in samples) // len(samples) for channel in range(3))
    tolerance_sq = BACKGROUND_TOLERANCE ** 2
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y][:3]
        distance = (red - backdrop[0]) ** 2 + (green - backdrop[1]) ** 2 + (blue - backdrop[2]) ** 2
        return distance <= tolerance_sq and min(red, green, blue) >= 205

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index] or not is_background(x, y):
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if visited[row + x]:
                alpha_pixels[x, y] = 0
    rgba.putalpha(alpha)
    return rgba


def quantize_with_transparency(frame: Image.Image) -> Image.Image:
    alpha = frame.getchannel("A")
    paletted = frame.convert("RGB").quantize(
        colors=PALETTE_COLORS - 1,
        method=Image.Quantize.MEDIANCUT,
    )
    data = list(paletted.getdata())
    alpha_data = list(alpha.getdata())
    for index, opacity in enumerate(alpha_data):
        if opacity < 128:
            data[index] = 255
    paletted.putdata(data)
    paletted.info["transparency"] = 255
    return paletted


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", type=Path, required=True)
    parser.add_argument("--gif", type=Path, required=True)
    parser.add_argument("--thumbnail", type=Path, required=True)
    args = parser.parse_args()

    with Image.open(args.sheet.resolve()) as source:
        frames = crop_cells(source)

    args.gif.parent.mkdir(parents=True, exist_ok=True)
    args.thumbnail.parent.mkdir(parents=True, exist_ok=True)

    transparent_frames = [remove_connected_background(frame) for frame in frames]
    loop_frames = transparent_frames + [transparent_frames[2], transparent_frames[1]]
    palette_frames = [quantize_with_transparency(frame) for frame in loop_frames]
    palette_frames[0].save(
        args.gif.resolve(),
        save_all=True,
        append_images=palette_frames[1:],
        duration=[420, 360, 360, 520, 360, 360],
        loop=0,
        optimize=True,
        disposal=2,
        background=255,
        transparency=255,
    )
    frames[0].save(args.thumbnail.resolve(), quality=80, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
