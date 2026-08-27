from __future__ import annotations

import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

HOST = os.environ.get("DLS_OLD_HOST", "www.dlsbathrooms.co.uk")
IP = os.environ.get("DLS_OLD_IP", "162.159.143.30")
BASE = f"https://{HOST}"
ROOT = Path(os.environ.get("DLS_OUTPUT", ".")).resolve()

ROUTES = {
    "/": "index.html",
    "/quote": "quote.html",
    "/terms": "terms.html",
    "/privacy": "privacy.html",
    "/areas/stockport": "areas/stockport.html",
    "/areas/manchester": "areas/manchester.html",
    "/areas/cheadle": "areas/cheadle.html",
}

TEXT_EXTS = {
    ".html", ".js", ".css", ".svg", ".vtt", ".txt", ".xml", ".json", ".webmanifest"
}
ASSET_EXTS = {
    ".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico",
    ".mp4", ".webm", ".mov", ".vtt", ".woff", ".woff2", ".ttf", ".otf", ".json",
    ".webmanifest", ".pdf"
}

REPLACEMENTS = [
    ("dlsplumbinginfo@gmail.com", "info@dlsbathrooms.co.uk"),
    ("dlstilingandplumbing30@gmail.com", "info@dlsbathrooms.co.uk"),
    ("07304 056595", "07539 037841"),
    ("+44 7304 056595", "+44 7539 037841"),
    ("+447304056595", "+447539037841"),
    ("447304056595", "447539037841"),
    ("Klarna options available", "Major credit cards accepted"),
    (
        "Ask about Klarna availability for eligible bathroom projects when requesting your quotation.",
        "Use a major credit card and manage repayments directly with your own card provider.",
    ),
    (
        "Subject to status and eligibility. UK residents aged 18+ only. Klarna terms apply.",
        "Interest, fees, eligibility and repayment terms are set by your own card provider.",
    ),
    ("Can I use Klarna?", "Can I use a credit card?"),
    (
        "Ask about availability for eligible projects. Approval and payment terms are provided by Klarna.",
        "Yes. Major consumer credit cards are accepted and processed securely by Worldpay.",
    ),
    ("Klarna.", "Flexible payments."),
]


def fetch(path: str) -> bytes:
    process = subprocess.run(
        [
            "curl", "--fail", "--silent", "--show-error", "--location",
            "--retry", "3", "--retry-delay", "1",
            "--resolve", f"{HOST}:443:{IP}",
            "-A", "Mozilla/5.0 (DLS Bathrooms migration)",
            BASE + path,
        ],
        capture_output=True,
        check=False,
    )
    if process.returncode:
        error = process.stderr.decode("utf-8", "ignore")
        raise RuntimeError(f"Fetch failed for {BASE + path}: {error}")
    return process.stdout


def clean_text(text: str, *, html_page: bool = False) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)

    # Remove every remaining case-insensitive reference to the unverified payment option.
    text = re.sub(r"klarna", "credit card payments", text, flags=re.IGNORECASE)

    # Cloudflare challenge code belongs to the previous host and is not needed on Vercel.
    text = re.sub(
        r"<script[^>]+src=[\"']/cdn-cgi/[^>]*>\s*</script>",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = text.replace(
        "This website does not currently use advertising cookies or visitor-tracking analytics. "
        "If that changes, this notice will be updated and consent will be requested where required.",
        "We may use privacy-focused, aggregate website analytics to understand page visits and improve "
        "the site. We do not use analytics to build advertising profiles. Where consent is legally "
        "required for non-essential cookies, we will ask first.",
    )

    for old, new in [
        ("https://dlsbathrooms.co.uk/quote.html", "https://dlsbathrooms.co.uk/quote"),
        ("https://dlsbathrooms.co.uk/terms.html", "https://dlsbathrooms.co.uk/terms"),
        ("https://dlsbathrooms.co.uk/privacy.html", "https://dlsbathrooms.co.uk/privacy"),
        ("https://dlsbathrooms.co.uk/video-estimate.html", "https://dlsbathrooms.co.uk/video-estimate"),
    ]:
        text = text.replace(old, new)

    if html_page and "/_vercel/insights/script.js" not in text and "</head>" in text:
        text = text.replace(
            "</head>",
            '<script defer src="/_vercel/insights/script.js"></script></head>',
            1,
        )

    return text


def save_bytes(relative_path: str, data: bytes) -> None:
    destination = ROOT / relative_path.lstrip("/")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.suffix.lower() in TEXT_EXTS:
        destination.write_text(
            clean_text(data.decode("utf-8", "replace"), html_page=destination.suffix.lower() == ".html"),
            encoding="utf-8",
        )
    else:
        destination.write_bytes(data)


asset_queue: list[str] = []
seen_assets: set[str] = set()


def add_asset(reference: str, current_path: str = "/") -> None:
    reference = reference.strip().replace("\\/", "/")
    if not reference or reference.startswith(("data:", "mailto:", "tel:", "javascript:", "#")):
        return

    absolute_url = urljoin(BASE + current_path, reference)
    parsed = urlparse(absolute_url)
    if parsed.netloc and parsed.netloc != HOST:
        return

    path = parsed.path
    if path.startswith("/cdn-cgi/"):
        return
    if Path(path).suffix.lower() not in ASSET_EXTS:
        return

    if path not in seen_assets:
        seen_assets.add(path)
        asset_queue.append(path)


def discover_assets(text: str, current_path: str) -> None:
    for reference in re.findall(r"(?:src|href)=[\"']([^\"']+)", text, re.IGNORECASE):
        add_asset(reference, current_path)
    for reference in re.findall(r"url\(\s*[\"']?([^\)\"']+)", text, re.IGNORECASE):
        add_asset(reference, current_path)
    for reference in re.findall(r"(?:from\s*|import\s*)[\"']([^\"']+)[\"']", text):
        add_asset(reference, current_path)
    for reference in re.findall(
        r"[\"'`](\/[^\"'`\\\s<>]+\.(?:js|css|svg|png|jpe?g|webp|gif|ico|mp4|webm|mov|vtt|woff2?|ttf|otf|json|webmanifest|pdf))[\"'`]",
        text,
        re.IGNORECASE,
    ):
        add_asset(reference, current_path)


def write_supporting_files(project_images: list[Path], total_file_count: int, total_bytes: int) -> None:
    clean_urls = [
        "https://www.dlsbathrooms.co.uk/",
        "https://www.dlsbathrooms.co.uk/quote",
        "https://www.dlsbathrooms.co.uk/video-estimate",
        "https://www.dlsbathrooms.co.uk/areas/stockport",
        "https://www.dlsbathrooms.co.uk/areas/manchester",
        "https://www.dlsbathrooms.co.uk/areas/cheadle",
        "https://www.dlsbathrooms.co.uk/terms",
        "https://www.dlsbathrooms.co.uk/privacy",
    ]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap.extend(f"  <url><loc>{url}</loc></url>" for url in clean_urls)
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://www.dlsbathrooms.co.uk/sitemap.xml\n",
        encoding="utf-8",
    )

    (ROOT / "vercel.json").write_text(
        """{
  "cleanUrls": true,
  "redirects": [
    { "source": "/quote.html", "destination": "/quote", "permanent": true },
    { "source": "/video-estimate.html", "destination": "/video-estimate", "permanent": true },
    { "source": "/terms.html", "destination": "/terms", "permanent": true },
    { "source": "/privacy.html", "destination": "/privacy", "permanent": true },
    { "source": "/areas/stockport.html", "destination": "/areas/stockport", "permanent": true },
    { "source": "/areas/manchester.html", "destination": "/areas/manchester", "permanent": true },
    { "source": "/areas/cheadle.html", "destination": "/areas/cheadle", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
""",
        encoding="utf-8",
    )

    image_names = sorted(path.name for path in project_images)
    (ROOT / "projects" / "gallery-files.txt").write_text("\n".join(image_names) + "\n", encoding="utf-8")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    report = f"""# DLS Bathrooms newer-site migration

Completed: {timestamp}

- Mirrored the newer public design into the GitHub/Vercel source.
- Preserved the 75-photo public gallery plus the two design-preview images.
- Added Stockport, Manchester and Cheadle service pages.
- Preserved the newer Worldpay, remote-estimate, product-visualisation and WhatsApp enquiry content.
- Replaced legacy phone numbers and Gmail addresses with 07539 037841 and info@dlsbathrooms.co.uk.
- Removed unverified Klarna wording and retained verified Worldpay/card-payment wording.
- Added clean legacy redirects, sitemap entries and privacy-friendly Vercel Web Analytics tracking.

Files mirrored: {total_file_count}
Project/design WebP files: {len(project_images)}
Mirrored size: {total_bytes / 1024 / 1024:.1f} MiB
"""
    (ROOT / "MIGRATION_REPORT.md").write_text(report, encoding="utf-8")


def main() -> None:
    print("Fetching the newer DLS Bathrooms pages from the preserved origin...")

    for route, target in ROUTES.items():
        data = fetch(route)
        text = clean_text(data.decode("utf-8", "replace"), html_page=True)
        destination = ROOT / target
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(text, encoding="utf-8")
        discover_assets(text, route)
        print(f"  {route} -> {target} ({len(data):,} bytes)")

    for path in ["/favicon.ico", "/favicon.svg", "/apple-touch-icon.png", "/dls-badge-cropped.png"]:
        add_asset(path, "/")

    while asset_queue:
        path = asset_queue.pop(0)
        try:
            data = fetch(path)
        except Exception as exc:
            print(f"WARNING: {exc}", file=sys.stderr)
            continue

        save_bytes(path, data)
        if Path(path).suffix.lower() in TEXT_EXTS:
            text = clean_text(data.decode("utf-8", "replace"), html_page=Path(path).suffix.lower() == ".html")
            discover_assets(text, path)
        print(f"  asset {path} ({len(data):,} bytes)")

    text_files = [path for path in ROOT.rglob("*") if path.is_file() and path.suffix.lower() in TEXT_EXTS]
    all_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in text_files)
    for forbidden in [
        "07304 056595",
        "447304056595",
        "dlsplumbinginfo@gmail.com",
        "dlstilingandplumbing30@gmail.com",
        "klarna",
    ]:
        if forbidden.lower() in all_text.lower():
            locations = [
                str(path.relative_to(ROOT))
                for path in text_files
                if forbidden.lower() in path.read_text(encoding="utf-8", errors="ignore").lower()
            ]
            raise SystemExit(f"Forbidden legacy content remains: {forbidden} in {locations[:10]}")

    project_images = sorted((ROOT / "projects").glob("*.webp"))
    if len(project_images) < 77:
        raise SystemExit(f"Expected 75 gallery images plus two design images; found {len(project_images)}")

    required_pages = [
        "index.html",
        "quote.html",
        "video-estimate.html",
        "terms.html",
        "privacy.html",
        "areas/stockport.html",
        "areas/manchester.html",
        "areas/cheadle.html",
    ]
    missing = [page for page in required_pages if not (ROOT / page).exists()]
    if missing:
        raise SystemExit(f"Missing required pages: {missing}")

    total_files = [path for path in ROOT.rglob("*") if path.is_file()]
    total_bytes = sum(path.stat().st_size for path in total_files)
    write_supporting_files(project_images, len(total_files), total_bytes)

    print(
        f"Migration complete: {len(project_images)} project/design WebP files, "
        f"{len(total_files)} files, {total_bytes / 1024 / 1024:.1f} MiB"
    )


if __name__ == "__main__":
    main()
