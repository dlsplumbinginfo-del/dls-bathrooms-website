from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"


NEW_IMAGES = [
    (
        "/projects/enhanced-marble-vanity.webp",
        "Marble-look bathroom with illuminated oval mirror, floating timber vanity and bronze towel radiator",
        "Marble vanity bathroom",
    ),
    (
        "/projects/enhanced-bronze-shower.webp",
        "Bronze-framed shower screen with concealed controls, feature lighting and freestanding bath beyond",
        "Bronze detail bathroom",
    ),
    (
        "/projects/enhanced-fluted-bath.webp",
        "Fluted floating vanity, round mirror, bronze fittings and freestanding bath",
        "Fluted vanity bathroom",
    ),
    (
        "/projects/enhanced-illuminated-bath.webp",
        "Freestanding bath and wall-hung toilet with illuminated timber niche and floor-level lighting",
        "Illuminated bath suite",
    ),
    (
        "/projects/enhanced-light-stone-bathroom.webp",
        "Light stone bathroom with shower over bath, illuminated mirror and floating oak vanity",
        "Light stone bathroom",
    ),
]

FEATURED_SOURCES = [
    "/projects/enhanced-marble-vanity.webp",
    "/projects/enhanced-fluted-bath.webp",
    "/projects/enhanced-bronze-shower.webp",
    "/projects/enhanced-illuminated-bath.webp",
    "/projects/enhanced-light-stone-bathroom.webp",
    "/projects/green-tile-bathroom.webp",
    "/projects/traditional-green-cloakroom.webp",
    "/projects/black-frame-shower.webp",
    "/projects/oak-fluted-bath.webp",
    "/projects/black-marble-suite.webp",
]


def require_replace(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one {label}, found {count}")
    return text.replace(old, new, 1)


def card(src: str, alt: str, project: str, index: int) -> str:
    extra = " gallery-extra" if index >= 10 else ""
    loading = "eager" if index < 4 else "lazy"
    return (
        f'<button class="gallery-card{extra}" type="button" '
        f'data-gallery-index="{index}" '
        f'aria-label="Open {html.escape(project, quote=True)} photograph">'
        f'<img src="{html.escape(src, quote=True)}" '
        f'alt="{html.escape(alt, quote=True)}" loading="{loading}"/>'
        '<span class="gallery-gradient"></span>'
        '<span class="gallery-brand">DLS Bathrooms Ltd</span>'
        f'<strong>{html.escape(project)}</strong></button>'
    )


def update_gallery(text: str) -> str:
    match = re.search(
        r'(<div class="gallery-shell"><div class="gallery-grid">)(.*?)'
        r'(</div><div class="gallery-actions">)',
        text,
        flags=re.DOTALL,
    )
    if not match:
        raise RuntimeError("Gallery grid not found")

    old_cards = re.findall(
        r'<button class="gallery-card(?: gallery-extra)?".*?</button>',
        match.group(2),
        flags=re.DOTALL,
    )
    if len(old_cards) != 75:
        raise RuntimeError(f"Expected 75 existing gallery cards, found {len(old_cards)}")

    images: list[tuple[str, str, str]] = list(NEW_IMAGES)
    for old_card in old_cards:
        src = re.search(r'<img src="([^"]+)"', old_card)
        alt = re.search(r' alt="([^"]*)"', old_card)
        project = re.search(r'<strong>(.*?)</strong>', old_card, flags=re.DOTALL)
        if not (src and alt and project):
            raise RuntimeError("Could not parse an existing gallery card")
        images.append((src.group(1), html.unescape(alt.group(1)), html.unescape(project.group(1))))

    by_source = {item[0]: item for item in images}
    if len(by_source) != 80:
        raise RuntimeError(f"Expected 80 unique gallery photographs, found {len(by_source)}")
    missing = [source for source in FEATURED_SOURCES if source not in by_source]
    if missing:
        raise RuntimeError(f"Featured gallery files missing: {missing}")

    ordered = [by_source[source] for source in FEATURED_SOURCES]
    ordered.extend(item for item in images if item[0] not in set(FEATURED_SOURCES))
    cards = "".join(card(*item, index) for index, item in enumerate(ordered))
    return text[: match.start()] + match.group(1) + cards + match.group(3) + text[match.end() :]


def update_design_pair(text: str) -> str:
    replacement = (
        '<figure class="design-proof-pair"><div class="design-proof-grid">'
        '<div class="design-proof-image"><img class="design-proof-photo" '
        'src="/projects/design-preview-before-v2.webp" '
        'alt="Digital bathroom design preview created before the DLS installation began" loading="lazy"/>'
        '<span class="design-proof-label">AI design preview</span></div>'
        '<div class="design-proof-image design-proof-image-completed"><img class="design-proof-photo" '
        'src="/projects/design-preview-completed-v2.webp" '
        'alt="Completed wet room installed by DLS Bathrooms with two illuminated niches, bronze fittings and wall-hung toilet" loading="lazy"/>'
        '<span class="design-proof-label">Finished bathroom</span></div>'
        '<span class="design-proof-arrow" aria-hidden="true">→</span></div>'
        '<img class="design-proof-badge" src="/dls-badge-cropped.png" alt="" aria-hidden="true"/>'
        '<figcaption><strong>Design preview → completed by DLS</strong>'
        '<small>One project, shown together</small></figcaption></figure></div>'
        '<div class="shell visualisation-steps"'
    )
    text, count = re.subn(
        r'<div class="design-proof-grid">.*?</div></div>'
        r'<div class="shell visualisation-steps"',
        replacement,
        text,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError(f"Expected one design comparison block, found {count}")
    return text


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")

    text = require_replace(
        text,
        'Bathroom fitters across <span>Stockport and Manchester.</span>',
        'Your local bathroom specialist, <span>covering Stockport and Manchester.</span>',
        "areas heading",
    )
    text = require_replace(
        text,
        "Bathroom fitting across Manchester",
        "Complete bathrooms in Manchester",
        "Manchester card heading",
    )
    text = require_replace(
        text,
        '<article><span>Cheadle</span><h3>Complete bathrooms in Cheadle</h3><p>Full bathroom renovations, walk-in showers, wet rooms and premium tiling, coordinated from preparation through to the finished room.</p><a class="text-link" href="/areas/cheadle">View Cheadle services →</a></article>',
        "",
        "visible Cheadle area card",
    )
    text = require_replace(
        text,
        '<a href="https://wa.me/447539037841?text=Hello%20DLS%20Bathrooms%20Ltd%2C%20I%27d%20like%20a%20bathroom%20quotation.">WhatsApp</a><a href="mailto:info@dlsbathrooms.co.uk">Email</a>',
        '<a href="https://wa.me/447539037841?text=Hello%20DLS%20Bathrooms%20Ltd%2C%20I%27d%20like%20a%20bathroom%20quotation.">WhatsApp</a><a href="https://www.facebook.com/DLSBathrooms/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.instagram.com/dlstilingand/" target="_blank" rel="noreferrer">Instagram</a><a href="mailto:info@dlsbathrooms.co.uk">Email</a>',
        "social links",
    )
    text = require_replace(
        text,
        '<a href="/areas/manchester">Manchester</a><a href="/areas/cheadle">Cheadle</a>',
        '<a href="/areas/manchester">Manchester</a>',
        "footer Cheadle link",
    )
    text = require_replace(
        text,
        '{"@type":"City","name":"Manchester"},{"@type":"City","name":"Cheadle"},{"@type":"AdministrativeArea"',
        '{"@type":"City","name":"Manchester"},{"@type":"AdministrativeArea"',
        "structured Cheadle service area",
    )

    text = update_design_pair(text)
    text = update_gallery(text)
    text = require_replace(text, "View All 75 Photographs", "View All 80 Photographs", "gallery button")
    text = require_replace(
        text,
        "All installations are genuine DLS work. Removable styling accessories were digitally added to the blush cloakroom photographs.",
        "All installations are genuine DLS work. Some photographs were cropped or quality-enhanced for presentation; removable styling accessories were digitally added only to the blush cloakroom photographs.",
        "gallery presentation note",
    )

    INDEX.write_text(text, encoding="utf-8")
    print("Applied approved August DLS homepage updates: 80-photo gallery, comparison pair, wording, areas and social links")


if __name__ == "__main__":
    main()
