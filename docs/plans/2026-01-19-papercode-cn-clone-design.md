# PaperCode CN Full Clone Design

## Overview
Rebuild the entire https://papercode.vercel.app/ site in this repo using the existing Vite + React stack.
The clone must match layout, styling, interactions, and motion 1:1 while replacing all text with short,
clear Chinese copy that preserves every information point. All assets are localized (downloaded into
this repo) and referenced locally.

## Goals
- Full site parity: Home, Papers, Roadmap (ML150), Reviews, Sponsors, About, and any detail views.
- Visual and interaction parity: typography, spacing, gradients, glass effects, hover states, scroll
  animations, and page transitions should match the original site closely.
- All copy in concise, conversational Chinese without losing meaning.
- No authentication; use localStorage only where state is needed (filters, progress, favorites).

## Non-goals
- No real backend or external APIs.
- No analytics or OAuth.
- No admin or content management UI.

## Architecture
- Frontend only: Vite + React + TypeScript.
- React Router for client-side routing to replicate multi-page experience.
- Shared layout: Navbar + PageTransition + Footer wrapped around each route.
- State: React state + localStorage for persistence; no server calls.

## Pages
- Home: hero, animated timeline/stacked cards, feature grid, CTA blocks, and footer.
- Papers: search, tag filters, grid of paper cards, empty state messaging.
- Roadmap (ML150): grouped learning path items with progress indicators.
- Reviews: list layout with ratings, tags, and highlights.
- Sponsors: tiered sponsor cards + CTA.
- About: mission, team, and method blocks.
- 404: simple, consistent error view with link back home.

## Components
- Navbar: desktop nav, mobile drawer toggle, active route styles.
- PageTransition: entry animation on route change.
- Hero: gradient title, mono accent, CTA buttons.
- BackdropCanvas: background noise/particles/glows.
- GlassCard: shared glass effect and borders.
- TimelineStack: sticky scroll sequence with progress transforms.
- FeatureGrid: three task cards + check badges.
- PaperGrid: search input, tag chips, cards, and filtering logic.
- ReviewList / SponsorTiers / AboutBlocks / Footer.

## Data Model
Static data modules in `src/data/`:
- `site.ts`: navigation, CTA labels, shared labels.
- `papers.ts`: list entries, tags, difficulty, status.
- `roadmap.ts`, `reviews.ts`, `sponsors.ts`, `about.ts`.

## Local Storage
Keys (namespaced) for local persistence:
- `pc.search`, `pc.filters`, `pc.progress`, `pc.favorites`.
Graceful fallback if localStorage is unavailable (in-memory only).

## Assets
- Download fonts (Inter, Geist Mono, JetBrains Mono) as woff2 and rewire `@font-face` in CSS.
- Download all images/icons/noise assets into `public/assets/`.
- Keep favicon/logo local.

## Styling and Motion
- Start from the original compiled CSS and refactor into project styles.
- Fix URLs for locally hosted assets.
- Recreate scroll-driven transforms and entry animations with CSS + JS
  (IntersectionObserver and requestAnimationFrame as needed).

## Accessibility
- Preserve aria-labels, focus rings, and keyboard navigation.
- Ensure text contrast is equivalent to original.

## Testing
- Manual visual parity checks by page.
- Minimal Playwright smoke: open key routes, mobile menu, search + filters.

## Implementation Notes
- Remove existing app code under `src` and replace with new routes/components.
- Keep backend folder intact but unused.
- All content rendered in Chinese; brand renamed to the Chinese equivalent.
