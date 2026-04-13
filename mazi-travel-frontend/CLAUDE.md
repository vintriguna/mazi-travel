# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This repository contains a hackathon MVP for an AI-powered group travel planning web app.

Primary goal:
Reduce group decision-making friction when planning trips.

Primary users:
Small groups of students, friends, or colleagues planning a shared trip.

Core MVP flow:

1. Host creates a trip
2. Host adds initial structured trip details
3. Participants join via invite
4. Participants submit preferences
5. AI generates 2–3 trip plan options
6. Participants vote
7. App generates a final itinerary for the winning option

## Product boundaries

Optimize for:

- fast consensus
- clear group preference collection
- demoable end-to-end flow

Do not overbuild:

- no booking integrations unless explicitly requested
- no live pricing system unless explicitly requested
- no enterprise-grade architecture unless explicitly requested
- no native mobile app in MVP

## Tech stack

- Next.js
- Supabase
  - Postgres
  - Auth
  - Storage if needed
- n8n may be added later for automation

## Current implementation priorities

Focus on these first:

1. Trip creation
2. Trip invitation and participant joining
3. Preference collection
4. AI generation of trip options
5. Voting flow
6. Final itinerary generation

When suggesting work, prefer the smallest complete vertical slice.

## Repository expectations

Before making changes:

- inspect existing routes, components, and database usage
- summarize relevant files before large edits
- explain schema changes before implementing them
- prefer extending existing patterns over introducing new abstractions

## Database guidance

This app is centered around collaborative trip planning.
Likely core entities include:

- trips
- trip_participants
- participant_preferences
- trip_options
- votes
- itinerary

When proposing schema changes:

- show affected tables and relationships
- keep the schema simple
- prefer normalized structure over ad hoc JSON unless JSON clearly simplifies the MVP

## Coding guidance

- Keep implementations simple and maintainable
- Avoid unnecessary abstraction
- Prefer readable code over clever code
- Flag assumptions clearly
- Do not introduce major dependencies unless they solve a real MVP need
- Keep AI-related code modular so prompts and generation logic can be changed later

## UI components (shadcn/ui)

shadcn/ui is installed and configured. Installed primitives live in `components/ui/`. Use them where they add clear value — do not reach for them by default.

**Use shadcn components for:**
- Interactive form elements: `Input`, `Label`, `Select`, `Button`
- Structural containers: `Card` and its sub-components
- Feedback and status: `Alert`, `Badge`
- Layout helpers: `Separator`

**Prefer plain Tailwind when:**
- A component is purely decorative or one-off
- A shadcn component would need heavy overriding to match the intended design
- The element is a simple wrapper like a page background, heading, or static text block

**Installing new components:**
Run `npx shadcn@latest add <component>` from the project root. Do not hand-write shadcn component files.

**Do not use shadcn** as a blanket rule for all UI. Raw Tailwind is fine and often simpler. The goal is consistency and saved time, not coverage.

## UX guidance

- Prefer structured inputs where possible
- Use free text only where it adds clear value
- The app should feel collaborative, not single-user
- The product should make choices easier, not just generate lots of content

## Output expectations

When asked to implement a feature:

1. briefly summarize the existing relevant code
2. propose the smallest implementation plan
3. implement only what is needed
4. note any follow-up work separately

When uncertain:

- do not invent hidden requirements
- state the assumption and proceed with the most reasonable MVP-friendly option

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
