# AUQUE — The Art of Desire

Original Korean luxury concept maison for high jewelry, timepieces and perfume.

## Run

Node 22.13 or newer. Use `npm install` then `npm run dev`.
Production compilation: `npm run build`. Type check: `npx tsc --noEmit`.
Inquiry validation: `node --experimental-strip-types --test tests/inquiry.test.mjs`.

## Contents

- One responsive editorial page with three collection detail dialogs, maison story, private creation inquiry and film player.
- Original generated photography in `creative/originals`; exact built-in imagegen prompts in `creative/image-prompts.txt`. Optimized delivery files in `public/images`.
- Silent 18-second 1920×1080 H.264 image-based mood montage in `public/films/auque-desire.mp4`. This is not generated moving-character footage. Higgsfield preflight required 52 credits; the connected workspace had 10, so no paid video generation was submitted.
- Server-side validated inquiry requests are stored in D1. No email, calendar confirmation, payment or external messaging is performed. No public API exposes inquiries.
- D1 schema migrations are generated in `drizzle` and included in the Sites deployment.

## Product context

AUQUE expresses artistic sensuality, bright palatial grandeur and the desire for rare creations. Initial concepts: La Couronne necklace, L’Heure Dorée jeweled watch, Le Désir perfume object. The intended positioning is approximately KRW 100 million for extraordinary commissions; it is a brand direction, not a substantiated price for every concept. Manufacturing, material verification, movement specifications, fragrance formulation, edition quantities and quotations remain to be established.

## Validation scope

The production build and TypeScript checks, local request validation and D1 request persistence are checked before delivery. Browser visual/interaction testing was not requested. The optional `document.modelContext` creation-detail tool is feature-detected; this environment has no supported WebMCP contract validation context, so it is not claimed as verified.
