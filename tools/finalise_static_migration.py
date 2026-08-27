from __future__ import annotations

import re
import shutil
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".html", ".js", ".css", ".json", ".svg", ".vtt"}


def replace_image_optimizer_urls(text: str) -> str:
    """Replace the previous Vinext host's dynamic image URLs with direct static assets."""
    pattern = re.compile(
        r"/_vinext/image\?url=([^&\"\\]+)(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+"
    )
    return pattern.sub(lambda match: unquote(match.group(1)), text)


def remove_cloudflare_challenge(text: str) -> str:
    """Remove the previous host's injected Cloudflare browser-challenge block."""
    return re.sub(
        r"<script>\(function\(\)\{function c\(\).*?</script>",
        "",
        text,
        flags=re.DOTALL,
    )


def patch_html() -> None:
    for path in ROOT.rglob("*.html"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        text = replace_image_optimizer_urls(text)
        text = remove_cloudflare_challenge(text)
        path.write_text(text, encoding="utf-8")


def patch_image_component() -> None:
    path = ROOT / "assets" / "image-CHhOb_lp.js"
    text = path.read_text(encoding="utf-8", errors="ignore")
    old = "function $(e,t,n=75){return`/_vinext/image?url=${encodeURIComponent(e)}&w=${t}&q=${n}`}"
    new = "function $(e,t,n=75){return e}"
    if old in text:
        text = text.replace(old, new)
    elif "/_vinext/image" in text:
        raise RuntimeError("The image-loader format changed; refusing an unsafe partial patch")
    path.write_text(text, encoding="utf-8")


def patch_legacy_text() -> None:
    replacements = [
        ("dlsplumbinginfo@gmail.com", "info@dlsbathrooms.co.uk"),
        ("dlstilingandplumbing30@gmail.com", "info@dlsbathrooms.co.uk"),
        ("07304 056595", "07539 037841"),
        ("+44 7304 056595", "+44 7539 037841"),
        ("+447304056595", "+447539037841"),
        ("447304056595", "447539037841"),
    ]

    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for old, new in replacements:
            text = text.replace(old, new)
        text = re.sub(r"klarna", "credit card payments", text, flags=re.IGNORECASE)
        path.write_text(text, encoding="utf-8")


def create_logo_alias() -> None:
    source = ROOT / "dls-badge-cropped.png"
    target = ROOT / "dls-badge.png"
    if source.exists():
        shutil.copyfile(source, target)


def validate() -> None:
    text_paths = [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES
    ]
    all_text = "\n".join(
        path.read_text(encoding="utf-8", errors="ignore") for path in text_paths
    )

    forbidden = [
        "/_vinext/image",
        "/cdn-cgi/challenge-platform",
        "07304 056595",
        "447304056595",
        "dlsplumbinginfo@gmail.com",
        "dlstilingandplumbing30@gmail.com",
        "klarna",
    ]
    for value in forbidden:
        if value.lower() in all_text.lower():
            locations = [
                str(path.relative_to(ROOT))
                for path in text_paths
                if value.lower()
                in path.read_text(encoding="utf-8", errors="ignore").lower()
            ]
            raise RuntimeError(f"Forbidden legacy/static-host value remains: {value} in {locations[:10]}")

    required = [
        ROOT / "index.html",
        ROOT / "quote.html",
        ROOT / "video-estimate.html",
        ROOT / "terms.html",
        ROOT / "privacy.html",
        ROOT / "areas" / "stockport.html",
        ROOT / "areas" / "manchester.html",
        ROOT / "areas" / "cheadle.html",
        ROOT / "dls-badge.png",
    ]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]
    if missing:
        raise RuntimeError(f"Missing required files: {missing}")

    project_images = list((ROOT / "projects").glob("*.webp"))
    if len(project_images) < 77:
        raise RuntimeError(f"Expected 77 project/design WebP files, found {len(project_images)}")


if __name__ == "__main__":
    patch_html()
    patch_image_component()
    patch_legacy_text()
    create_logo_alias()
    validate()
    print("Static-host finalisation complete")
