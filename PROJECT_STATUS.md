# AMBARA Project Status

## Current Progress
- Final premium frontend detail pass added to the client-ready multi-page visual preview.
- Source has been published to GitHub branch `main`.
- Visual direction: warm ivory, soft stone gray, charcoal black, champagne gold accent.
- Backend, authentication, CMS, RBAC, client portal, and project tracking are intentionally not included.

## Completed Features
- Vite + React + TypeScript + Tailwind CSS + Framer Motion stack retained.
- React Router added for a multi-page company profile experience.
- Dedicated pages added: Home, Tentang Ambara, Layanan, Portofolio, Portfolio Detail, Proses Kerja, Lacak Proyek, Kontak.
- Homepage upgraded with richer hero, service preview, editorial portfolio preview, process preview, material and craftsmanship section, Why Ambara section, testimonials, and consultation CTA.
- Layanan page expanded into detailed premium service panels.
- Portofolio page expanded with filters, asymmetric gallery layout, project metadata, and detail routes.
- Frontend-only Lacak Proyek mock added with example code `AMB-2026-001`, status card, progress bar, timeline, stages, photo placeholders, document placeholders, and estimated completion preview.
- Featured Project cinematic section added.
- Material & finishing detail added.
- Lacak Proyek frontend mock enhanced with payment status, project PIC, last update, progress notes, documents, and workshop photo placeholders.
- FAQ added.
- Floating WhatsApp CTA added.
- Download Company Profile CTA added.
- Design Mood Selector added with `Lainnya` option.
- Project Availability intentionally not added.
- Kontak page added with consultation form preview, WhatsApp CTA, inquiry CTA, and studio contact placeholders.
- Backend not implemented.
- Authentication not implemented.
- RBAC not implemented.
- CMS not implemented.
- Real client portal not implemented.
- Real tracking backend/database not implemented.

## Remaining Features
- Deploy preview after GitHub push.
- Visual approval pass across desktop and mobile.
- Next phase after visual approval: Deploy preview, then Phase 2 Auth + RBAC + Admin Dashboard + real tracking system.

## Known Issues
- The local machine did not have global `node`, `npm`, or `git` on PATH. A workspace-local portable Node runtime was used for install/build verification and is ignored by git in `.tools/`.
- The Codex in-app browser failed to connect in this Windows sandbox, and the local Playwright fallback could not resolve its bundled peer modules. HTTP preview was verified with status `200 OK`.
- `npm run build` succeeds but prints non-fatal React Router and Framer Motion warnings about ignored `"use client"` directives during bundling.

## Next Task
- Deploy preview to Vercel from GitHub branch `main`.

## Exact Command To Run Locally
```bash
npm install
npm run dev
```

## Build Status
- Passed with `npm run build`.
- Output directory: `dist/`.
- Non-fatal warnings: React Router and Framer Motion `"use client"` directives are ignored by the client bundler.

## Local Preview Instructions
- Current preview URL: `http://127.0.0.1:5173/`.
- To run fresh locally, install Node.js, then run `npm install` and `npm run dev`.
- Open the local Vite URL shown in the terminal, typically `http://localhost:5173/` or `http://127.0.0.1:5173/`.
