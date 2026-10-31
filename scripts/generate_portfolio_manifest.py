import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PORTFOLIO_DIR = ROOT / "imagens" / "portifolio"
THUMBNAILS_DIR = PORTFOLIO_DIR / "_thumbs"
OUTPUT = ROOT / "portfolio-manifest.js"
CATEGORIES = ("sem-cor", "colorido", "retrato oc")
IMAGE_EXTENSIONS = {".avif", ".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}


def main():
    images = []

    for category in CATEGORIES:
        category_dir = PORTFOLIO_DIR / category
        if not category_dir.is_dir():
            raise FileNotFoundError(f"Portfolio category folder not found: {category_dir}")

        for image_path in sorted(category_dir.rglob("*"), key=lambda path: path.as_posix().casefold()):
            if not image_path.is_file() or image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue

            relative_path = image_path.relative_to(PORTFOLIO_DIR).as_posix()
            thumbnail_path = (THUMBNAILS_DIR / Path(relative_path)).with_suffix(".png")
            thumbnail = relative_path if thumbnail_path.is_file() else None
            images.append([relative_path, image_path.name, thumbnail])

    output = "window.PORTFOLIO_IMAGES = " + json.dumps(images, ensure_ascii=False, indent=2) + ";\n"
    OUTPUT.write_text(output, encoding="utf-8")
    print(f"Generated {OUTPUT.name} with {len(images)} portfolio images.")


if __name__ == "__main__":
    main()
