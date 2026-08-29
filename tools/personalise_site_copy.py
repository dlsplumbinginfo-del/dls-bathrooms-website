from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SOCIAL_OLD = (
    '<a href="https://wa.me/447539037841?text=Hello%20DLS%20Bathrooms%20Ltd%2C%20I%27d%20like%20a%20bathroom%20quotation.">WhatsApp</a>'
    '<a href="mailto:info@dlsbathrooms.co.uk">Email</a>'
)
SOCIAL_NEW = (
    '<a href="https://wa.me/447539037841?text=Hello%20DLS%20Bathrooms%20Ltd%2C%20I%27d%20like%20a%20bathroom%20quotation.">WhatsApp</a>'
    '<a href="https://www.facebook.com/DLSBathrooms/" target="_blank" rel="noreferrer">Facebook</a>'
    '<a href="https://www.instagram.com/dlstilingand/" target="_blank" rel="noreferrer">Instagram</a>'
    '<a href="mailto:info@dlsbathrooms.co.uk">Email</a>'
)

REPLACEMENTS = [
    (
        "Bathroom Fitters Stockport &amp; Manchester | DLS Bathrooms Ltd",
        "Local Bathroom Specialist | Stockport &amp; Manchester | DLS Bathrooms Ltd",
    ),
    (
        "Bathroom Fitters Stockport | Complete Renovations | DLS Bathrooms Ltd",
        "Bathroom Specialist Stockport | Complete Renovations | DLS Bathrooms Ltd",
    ),
    (
        "Bathroom Fitters Manchester | Complete Renovations | DLS Bathrooms Ltd",
        "Bathroom Specialist Manchester | Complete Renovations | DLS Bathrooms Ltd",
    ),
    (
        "Bathroom fitters in <!-- -->Stockport",
        "Your local bathroom specialist in <!-- -->Stockport",
    ),
    (
        "Bathroom fitters in <!-- -->Manchester",
        "Your local bathroom specialist in <!-- -->Manchester",
    ),
    (
        "Complete bathroom fitting across Manchester",
        "Complete bathroom renovations across Manchester",
    ),
    (
        '{"@type":"City","name":"Manchester"},{"@type":"City","name":"Cheadle"},{"@type":"AdministrativeArea"',
        '{"@type":"City","name":"Manchester"},{"@type":"AdministrativeArea"',
    ),
    (
        '<a href="/areas/manchester">Manchester</a><a href="/areas/cheadle">Cheadle</a>',
        '<a href="/areas/manchester">Manchester</a>',
    ),
]


def update_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if "instagram.com/dlstilingand" not in text:
        text = text.replace(SOCIAL_OLD, SOCIAL_NEW)
    path.write_text(text, encoding="utf-8")


def replace_legacy_area_page() -> None:
    path = ROOT / "areas" / "cheadle.html"
    path.write_text(
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>'
        '<meta name="viewport" content="width=device-width,initial-scale=1"/>'
        '<title>Page moved | DLS Bathrooms Ltd</title>'
        '<meta name="robots" content="noindex,follow"/>'
        '<link rel="canonical" href="https://dlsbathrooms.co.uk/areas/stockport"/>'
        '<meta http-equiv="refresh" content="0;url=/areas/stockport"/>'
        '</head><body><main><h1>Page moved</h1>'
        '<p>Please continue to <a href="/areas/stockport">Stockport bathroom services</a>.</p>'
        '</main><script>window.location.replace("/areas/stockport")</script></body></html>',
        encoding="utf-8",
    )


def validate() -> None:
    public_text = "\n".join(
        path.read_text(encoding="utf-8", errors="ignore")
        for path in ROOT.rglob("*.html")
        if ".git" not in path.parts
    ).lower()
    for forbidden in ["bathroom fitters", "bathroom fitting", ">cheadle<", '"name":"cheadle"']:
        if forbidden in public_text:
            raise RuntimeError(f"Advertising-style or retired area wording remains: {forbidden}")

    homepage = (ROOT / "index.html").read_text(encoding="utf-8")
    for required in [
        "Your local bathroom specialist",
        "Local Bathroom Specialist | Stockport &amp; Manchester",
        "https://www.instagram.com/dlstilingand/",
    ]:
        if required not in homepage:
            raise RuntimeError(f"Required personal/site wording is missing: {required}")


if __name__ == "__main__":
    for html_path in ROOT.rglob("*.html"):
        if ".git" not in html_path.parts:
            update_html(html_path)
    replace_legacy_area_page()
    validate()
    print("Personalised public wording and social links across every site page")
