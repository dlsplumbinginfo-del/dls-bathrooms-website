from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PAGES = [path for path in ROOT.rglob("*.html") if ".git" not in path.parts]


def gallery_items() -> list[tuple[str, str, str]]:
    source = (ROOT / "assets" / "project-gallery-CrXVqLmy.js").read_text(
        encoding="utf-8", errors="ignore"
    )
    items = re.findall(
        r"\{src:`([^`]+)`,alt:`([^`]+)`,project:`([^`]+)`\}", source
    )
    if len(items) != 75:
        raise RuntimeError(f"Expected 75 gallery items, found {len(items)}")
    return items


def gallery_cards(items: list[tuple[str, str, str]]) -> str:
    cards: list[str] = []
    for index, (src, alt, project) in enumerate(items):
        card_class = "gallery-card gallery-extra" if index >= 10 else "gallery-card"
        loading = "eager" if index < 4 else "lazy"
        cards.append(
            f'<button class="{card_class}" type="button" '
            f'data-gallery-index="{index}" '
            f'aria-label="Open {html.escape(project, quote=True)} photograph">'
            f'<img src="{html.escape(src, quote=True)}" '
            f'alt="{html.escape(alt, quote=True)}" loading="{loading}"/>'
            '<span class="gallery-gradient"></span>'
            '<span class="gallery-brand">DLS Bathrooms Ltd</span>'
            f'<strong>{html.escape(project)}</strong></button>'
        )
    return "".join(cards)


def strip_vinext_runtime(text: str) -> str:
    # The recovered files contain a complete server-rendered page followed by
    # Vinext RSC payloads. Keep the page and remove the host-specific runtime.
    closing = text.lower().find("</html>")
    if closing >= 0:
        text = text[: closing + len("</html>")]

    text = re.sub(
        r"<script[^>]*>\s*self\.__VINEXT_RSC_(?:PARAMS|NAV)__=.*?</script>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    text = re.sub(
        r"<script[^>]*id=[\"']_R_[\"'][^>]*>.*?</script>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    text = re.sub(
        r"<link[^>]+rel=[\"']modulepreload[\"'][^>]*>",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text


def accurate_claims(text: str) -> str:
    replacements = [
        (
            '<strong>98%</strong><span>Recommend on Facebook · 41 reviews</span>',
            '<strong>Recommended</strong><span>Customer feedback on Facebook</span>',
        ),
        (
            "With accurate room information and confirmed products, the preview can achieve up to a 98% visual match to your proposed finished bathroom.",
            "With accurate room information and confirmed products, the preview provides a detailed visual guide to your proposed finished bathroom.",
        ),
        (
            "Can DLS visit and provide a quotation on the same day?",
            "How quickly can DLS arrange a visit and quotation?",
        ),
        (
            "Subject to appointment availability, location and having enough project information, DLS can visit, assess the room and provide a quotation on the same day. Ask when you enquire and we will confirm what is possible for your postcode.",
            "DLS will review your project details and confirm the earliest available appointment. Quotation timing depends on the location, scope and information available.",
        ),
        (
            '<strong>Same-day visit</strong><small>Subject to availability</small>',
            '<strong>Fast appointment options</strong><small>Subject to availability</small>',
        ),
        (
            '<strong>Same-day quotation</strong><small>Where the scope can be confirmed</small>',
            '<strong>Clear written quotation</strong><small>Once the scope is confirmed</small>',
        ),
        (
            '<strong>Up to a 98% visual match</strong><small>To your proposed finished bathroom</small>',
            '<strong>High-detail visual guide</strong><small>Based on the information supplied</small>',
        ),
        (
            "Where availability, access and project information allow, DLS can visit, assess your bathroom, price the work and prepare the visual on the same day.",
            "DLS will review your project details, confirm the earliest suitable appointment and prepare the quotation and visual once the scope and products are clear.",
        ),
        (
            "The up-to-98% figure describes the visual match to the proposed design where accurate measurements and confirmed product references are supplied. ",
            "",
        ),
        (
            "Same-day visits, quotations and visuals are subject to appointment availability, location, access and sufficient project information.",
            "Appointments, quotations and visuals are subject to availability, location, access and sufficient project information.",
        ),
        (
            '<strong>Ask about same-day service</strong><p>Subject to availability and location, DLS may be able to visit, quote and prepare your visual on the same day.</p>',
            '<strong>Ask about availability</strong><p>DLS will review your details and confirm the earliest suitable appointment and likely quotation timescale.</p>',
        ),
        (
            'paymentAccepted":"Major debit cards, major credit cards, credit card payments subject to eligibility"',
            'paymentAccepted":"Major debit cards, major credit cards"',
        ),
        ('class="credit card payments-panel"', 'class="card-payment-panel"'),
        ('class="credit card payments-word"', 'class="card-payment-word"'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text


def convert_pages() -> None:
    for path in HTML_PAGES:
        text = path.read_text(encoding="utf-8", errors="ignore")
        text = accurate_claims(strip_vinext_runtime(text))
        text = text.replace(
            '<a class="button" href="/quote">Request a Video Estimate</a>',
            '<a class="button" href="/video-estimate">Request a Video Estimate</a>',
        )
        if "/static-overrides.css" not in text:
            text = text.replace(
                "</head>",
                '<link rel="stylesheet" href="/static-overrides.css"/></head>',
                1,
            )
        if "/site-static.js" not in text:
            text = text.replace(
                "</body>", '<script src="/site-static.js" defer></script></body>', 1
            )
        path.write_text(text, encoding="utf-8")


def convert_gallery(items: list[tuple[str, str, str]]) -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    pattern = (
        r'(<div class="gallery-shell"><div class="gallery-grid">).*?'
        r'(</div><div class="gallery-actions">)'
    )
    text, count = re.subn(
        pattern,
        lambda match: match.group(1) + gallery_cards(items) + match.group(2),
        text,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError(f"Could not replace homepage gallery grid: {count}")
    text = text.replace(
        '<button class="button button-outline" type="button">View All 75 Photographs</button>',
        '<button class="button button-outline" id="gallery-toggle" '
        'type="button" aria-expanded="false">View All 75 Photographs</button>',
    )
    path.write_text(text, encoding="utf-8")


def repair_css() -> None:
    path = ROOT / "assets" / "index-DTApk1f7.css"
    text = path.read_text(encoding="utf-8", errors="ignore")
    text = text.replace(".credit card payments-panel", ".card-payment-panel")
    text = text.replace(".credit card payments-word", ".card-payment-word")
    path.write_text(text, encoding="utf-8")


def align_canonical_files() -> None:
    for filename in ["sitemap.xml", "robots.txt"]:
        path = ROOT / filename
        if path.exists():
            text = path.read_text(encoding="utf-8")
            text = text.replace(
                "https://www.dlsbathrooms.co.uk", "https://dlsbathrooms.co.uk"
            )
            path.write_text(text, encoding="utf-8")


def validate() -> None:
    for path in HTML_PAGES:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for forbidden in ["__VINEXT_RSC_", 'id="_R_"', "RSC_CHUNKS"]:
            if forbidden in text:
                raise RuntimeError(f"Vinext runtime remains in {path}: {forbidden}")
        if "/site-static.js" not in text or "/static-overrides.css" not in text:
            raise RuntimeError(f"Static assets are not linked from {path}")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if index.count("data-gallery-index=") != 75:
        raise RuntimeError("Static gallery does not contain 75 cards")

    production_text = "\n".join(
        path.read_text(encoding="utf-8", errors="ignore")
        for path in [*HTML_PAGES, ROOT / "assets" / "index-DTApk1f7.css"]
    ).lower()
    for forbidden in [
        "07304 056595",
        "447304056595",
        "dlsplumbinginfo@gmail.com",
        "dlstilingandplumbing30@gmail.com",
        "klarna",
        "same-day",
        "41 reviews",
        "98%",
        ".credit card payments-",
    ]:
        if forbidden.lower() in production_text:
            raise RuntimeError(f"Legacy or unsupported content remains: {forbidden}")


if __name__ == "__main__":
    items = gallery_items()
    convert_pages()
    convert_gallery(items)
    repair_css()
    align_canonical_files()
    validate()
    print(f"Static conversion complete: {len(HTML_PAGES)} pages, {len(items)} photographs")
