# Project memory

## Product intent & audience

- Birthday website interface recreated from a provided design, built with Vite + React.
- Personal/celebratory use; expected to feel festive and production-quality.
- User communicates in French; UI copy and responses should remain in French.
- "Partage" tab now structured as a multi-page flow: a table-selection page (11 tiles) → one dedicated page per table with its own form and URL (`#partager/table-N`), instead of a single page with a dropdown.
- Album tab potentially candidate for same multi-page treatment (user mentioned as follow-up option).

## Brand personality & voice

- Warm, celebratory, elegant.
- Polished and "worthy of production," not generic.

## Visual design & UX direction

- Two-color palette (user-specified):
  - Khaki green `#788267` — accents, buttons.
  - Brown `#5C4A3C` — titles, secondary text.
- Backgrounds use very light tints of these two colors for readability.
- Buttons use khaki→brown gradient.
- Lightest shades adjusted to keep text legible on light backgrounds.
- Title animation effect preserved across color changes.
- Responsive behavior noted as unverified on mobile — worth checking.
- Partage flow: grid of 11 tiles on selection page; each table page has prev/next arrows + "Toutes les tables" button; table is fixed (no dropdown).
- Post-submission on a table page links directly to that table's album.
- No routing library — URL hash-based navigation (`#partager/table-N`).

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind CSS + Lucide React icons (per `.bolt/prompt`).
- Path alias `@/` → `src/` for imports.
- No extra UI/icon/routing packages installed.
- Color replacement done project-wide; old pink/amber/fuchsia palette fully removed.
- Build passes without errors; visual rendering not browser-verified by assistant.
- Multi-page partage implemented via hash routing without adding react-router or similar.

## Open questions & assumptions

- Mobile rendering unverified — transitions between pages on mobile especially need visual QA.
- No explicit user-supplied screenshot/design reference stored; current state is the source of truth.
- Animation effects assumed preserved; user has not confirmed final approval of new palette.
- Album tab could benefit from same per-table multi-page structure — not yet requested explicitly.
- Accessibility of hash-based navigation (focus management, screen-reader announcements) not addressed.