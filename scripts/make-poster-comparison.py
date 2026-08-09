from pathlib import Path

from PIL import Image, ImageDraw


root = Path(__file__).resolve().parents[1]
poster = Image.open(root / "design" / "poster" / "youjierxun-yinling-banner.png").convert("RGB")
implementation = Image.open(root / "design" / "implementation-home.jpg").convert("RGB")

viewport = (390, 844)
poster_width = 362
poster_height = 218
source_ratio = poster.width / poster.height
target_ratio = poster_width / poster_height
if source_ratio < target_ratio:
    crop_height = round(poster.width / target_ratio)
    top = (poster.height - crop_height) // 2
    poster = poster.crop((0, top, poster.width, top + crop_height))
else:
    crop_width = round(poster.height * target_ratio)
    left = (poster.width - crop_width) // 2
    poster = poster.crop((left, 0, left + crop_width, poster.height))
poster = poster.resize((poster_width, poster_height), Image.Resampling.LANCZOS)

reference = Image.new("RGB", viewport, "#f7f3ea")
mask = Image.new("L", poster.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, poster_width - 1, poster_height - 1), radius=16, fill=255)
reference.paste(poster, (14, 14), mask)

if implementation.size != viewport:
    implementation = implementation.resize(viewport, Image.Resampling.LANCZOS)

gap = 16
comparison = Image.new("RGB", (viewport[0] * 2 + gap, viewport[1]), "#dedbd3")
comparison.paste(reference, (0, 0))
comparison.paste(implementation, (viewport[0] + gap, 0))
ImageDraw.Draw(comparison).line(
    (viewport[0] + gap // 2, 0, viewport[0] + gap // 2, viewport[1]),
    fill="#918e86",
    width=1,
)
comparison.save(root / "design" / "poster-home-comparison.png", quality=95)

implementation_banner = implementation.crop((15, 12, 15 + poster_width, 12 + poster_height))
focus_gap = 12
focus = Image.new("RGB", (poster_width * 2 + focus_gap, poster_height), "#dedbd3")
focus.paste(poster, (0, 0))
focus.paste(implementation_banner, (poster_width + focus_gap, 0))
ImageDraw.Draw(focus).line(
    (poster_width + focus_gap // 2, 0, poster_width + focus_gap // 2, poster_height),
    fill="#918e86",
    width=1,
)
focus.save(root / "design" / "yinling-banner-focus-comparison.png", quality=95)
