from pathlib import Path

from PIL import Image, ImageDraw


root = Path(__file__).resolve().parents[1]
reference = Image.open(root / "design" / "reference-home-option-3.png").convert("RGB")
implementation = Image.open(root / "design" / "implementation-home.jpg").convert("RGB")

viewport = (390, 844)
reference_height = round(reference.height * viewport[0] / reference.width)
reference = reference.resize((viewport[0], reference_height), Image.Resampling.LANCZOS)
reference = reference.crop((0, 0, viewport[0], viewport[1]))
implementation = implementation.resize(viewport, Image.Resampling.LANCZOS)

gap = 16
comparison = Image.new("RGB", (viewport[0] * 2 + gap, viewport[1]), "#dedbd3")
comparison.paste(reference, (0, 0))
comparison.paste(implementation, (viewport[0] + gap, 0))
ImageDraw.Draw(comparison).line((viewport[0] + gap // 2, 0, viewport[0] + gap // 2, viewport[1]), fill="#918e86", width=1)
comparison.save(root / "design" / "home-comparison.png", quality=95)
