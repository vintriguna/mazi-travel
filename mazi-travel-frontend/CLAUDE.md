# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Warning

This project uses **Next.js 16**, which has breaking changes vs. earlier versions. Before writing any Next.js-specific code, read the relevant guide from `node_modules/next/dist/docs/`. Heed all deprecation notices. APIs, conventions, and file structure may differ from training data.

## Commands

All commands run from `mazi-travel/` (the Next.js project root):

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

No test framework is installed.

## Architecture

This is a **Next.js 16 App Router** project (TypeScript + Tailwind CSS 4).

- `app/` — App Router root. `layout.tsx` is the root layout; `page.tsx` is the `/` route. New routes go here as folders with `page.tsx` files.
- `public/` — Static assets served at `/`.
- Path alias `@/*` maps to the project root (`mazi-travel/`).
- Tailwind 4 is configured via PostCSS (`postcss.config.mjs`). Global styles and CSS custom properties (light/dark theme tokens) live in `app/globals.css`.
- Fonts are loaded via `next/font/google` in `layout.tsx` and injected as CSS variables (`--font-geist-sans`, `--font-geist-mono`).
