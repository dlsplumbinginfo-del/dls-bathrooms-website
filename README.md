# DLS Bathrooms website

Static website for DLS Bathrooms Ltd. The current production release lives in `index.html` with real DLS project images, the music-only showreel, standard and remote quote routes, legal pages and a downloadable customer-terms PDF.

## Pages

- `index.html` - main website and 80-image project gallery
- `quote.html` - standard multi-step enquiry form
- `video-estimate.html` - remote estimate form with photo/video uploads
- `terms.html` - web terms and downloadable PDF
- `privacy.html` - privacy policy

## Local review

Start a local server from this directory:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

For the automated desktop/mobile browser checks:

```sh
npm install
npx playwright install chromium
npm run test:site
```

The browser check expects the local server to be running on port 4173. It tests all routes, local assets, gallery controls, the standard quote steps, video-upload support, mobile overflow and browser errors without submitting either enquiry form.

## Terms PDF

The customer terms PDF is tracked at `assets/DLS-Bathrooms-Terms-and-Conditions.pdf`. Rebuild it after editing the source:

```sh
python tools/build_terms_pdf.py
cp output/pdf/DLS_Bathrooms_Terms_and_Conditions.pdf assets/DLS-Bathrooms-Terms-and-Conditions.pdf
```

Render and inspect every page before replacing the tracked PDF. The terms are a business template and should receive solicitor review before first contractual use.

## Pre-publish checklist

1. Confirm `info@dlsbathrooms.co.uk` can send and receive mail.
2. Activate the form-delivery service for the verified inbox, then change both form actions together.
3. Submit a standard quote and a remote estimate from a phone, including test attachments, and confirm both arrive.
4. Check every page, gallery lightbox, telephone link, WhatsApp link, email link, showreel and PDF download.
5. Confirm the company number, registered office, telephone number, email and service area.
6. Review the terms with a qualified solicitor before contractual use.
7. Merge only after approval of the preview. Tag the approved commit before deploying so a rollback is immediate.

## Recovery and rollback

Keep work on a review branch until approved. The production branch should contain only tested commits. For each approved release, create an annotated Git tag (for example `site-v4.0.0`) and retain the previous Vercel deployment so either Git or Vercel can restore the last known-good version.
