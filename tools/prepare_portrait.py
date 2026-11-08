"""Build antialiased display copies. Never overwrite the original photograph."""
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
WIDTHS = (320, 360, 400, 480, 640, 720, 800, 960, 1200)


def main():
    with Image.open(ASSETS / "portrait-original.png") as source:
        image = source.convert("RGB")
        for width in WIDTHS:
            height = round(image.height * width / image.width)
            # Suppress subpixel detail before reduction; no sharpening or dithering.
            scale = image.width / width
            filtered = image.filter(ImageFilter.GaussianBlur(radius=0.35 * scale))
            small = filtered.resize((width, height), Image.Resampling.BICUBIC)
            small.save(ASSETS / f"portrait-display-{width}.png", optimize=True)


if __name__ == "__main__":
    main()
