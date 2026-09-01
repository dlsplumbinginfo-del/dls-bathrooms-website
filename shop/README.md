# DLS Bathroom Shop framework

This folder is a private, no-index preview of a separate DLS product-selection website.

## What already works

- Five-step guided bathroom brief
- Room-specific product checklist
- Complete-look shortcuts using genuine DLS project photography
- Plain-English search and category/finish filters
- Saved product list using browser storage
- Missing-category prompts
- WhatsApp, email and copy-list handoff to DLS
- Responsive mobile and desktop layouts

## Current data status

`demo-products.js` contains demonstration product **types only**. It deliberately contains no supplier branding, product photographs, protected descriptions, genuine product codes or prices.

When written permission and approved supplier data are received, import records using `product-import-template.csv`. The front-end data contract is documented at the top of `demo-products.js`.

## Production path

1. Validate the approved supplier file and map its categories/finishes.
2. Import real products into a database or generated catalogue file.
3. Add image optimisation and product-detail routes.
4. Add server-side enquiry storage and email delivery.
5. Add an administration/import screen and scheduled catalogue refresh.
6. Run accessibility, performance, security and full-device testing.
7. Deploy as a separate project/subdomain only after DLS approval.

This branch must not be merged into the live DLS installation website until Dave explicitly approves a deployment plan.
