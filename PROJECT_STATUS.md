# AMBARA Project Status

## Current Progress
- Fresh public frontend website preview is complete.
- Visual direction: warm ivory, soft stone gray, charcoal black, champagne gold accent.
- Backend, authentication, CMS, RBAC, client portal, and project tracking are intentionally not included.

## Completed Features
- Vite + React + TypeScript project files created.
- Tailwind CSS configuration created.
- Framer Motion added in the React implementation.
- One-page public website completed: Hero, Tentang Ambara, Layanan, Portofolio, Proses Kerja, Testimoni, Kontak, footer.
- Premium Bahasa Indonesia copy completed for public-facing sections.
- Hero visual implemented as a code-native architectural composition for source-only deployment.
- Responsive navigation and mobile menu implemented.
- Smooth scroll, polished hover states, portfolio grid, service cards, process timeline, testimonial section, and contact CTA implemented.
- npm dependencies installed for local verification.
- Local Vite preview is running at `http://127.0.0.1:5173/`.

## Remaining Features
- Browser-based visual QA is still recommended once the in-app browser or a local browser is available.
- Future backend, authentication, CMS, RBAC, client portal, and project tracking remain intentionally out of scope for this preview.

## Known Issues
- The local machine did not have global `node`, `npm`, or `git` on PATH. A workspace-local portable Node runtime was used for install/build verification and is ignored by git in `.tools/`.
- The GitHub connector path cannot stream large local binaries, so the generated hero PNG was replaced with a deployable code-native visual block.
- `package-lock.json` is not required for this preview and was removed from the source scope; Vercel can install from `package.json`.
- The Codex in-app browser failed to connect in this Windows sandbox, and the local Playwright fallback could not resolve its bundled peer modules. HTTP preview was verified with status `200 OK`.
- `npm run build` succeeds but prints non-fatal Framer Motion warnings about ignored `"use client"` directives during bundling.

## Next Task
- Open the local preview in a browser and do a final visual pass across desktop and mobile widths.

## Exact Command To Run Locally
```bash
npm install
npm run dev
```

## Build Status
- Passed with `npm run build`.
- Output directory: `dist/`.
- Non-fatal warnings: Framer Motion `"use client"` directives are ignored by the client bundler.

## Local Preview Instructions
- Current preview URL: `http://127.0.0.1:5173/`.
- To run fresh locally, install Node.js, then run `npm install` and `npm run dev`.
- Open the local Vite URL shown in the terminal, typically `http://localhost:5173/` or `http://127.0.0.1:5173/`.
