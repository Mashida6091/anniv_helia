# Project memory

## Product intent & audience

- Birthday website interface recreated from a provided design, built with Vite + React.
- Personal/celebratory use; expected to feel festive and production-quality.
- User communicates in French; UI copy and responses should remain in French.

## Brand personality & voice

- Warm, celebratory, elegant.
- Polished and "worthy of production," not generic.

## Visual design & UX direction

- Two-color palette (user-specified):
  - Khaki green `#788267` (RGB 120,130,103) — accents, buttons.
  - Brown `#5C4A3C` (RGB 92,74,60) — titles, secondary text.
- Backgrounds use very light tints of these two colors for readability.
- Buttons use khaki→brown gradient.
- Lightest shades adjusted to keep text legible on light backgrounds.
- Title animation effect preserved across color changes.
- Responsive behavior noted as unverified on mobile — worth checking.

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind CSS + Lucide React icons (per `.bolt/prompt`).
- Path alias `@/` → `src/` for imports.
- No extra UI/icon packages installed.
- Color replacement done project-wide; old pink/amber/fuchsia palette fully removed.
- Build passes without errors; visual rendering not browser-verified by assistant.

## Open questions & assumptions

- Mobile rendering unverified — may need visual QA.
- No explicit user-supplied screenshot/design reference stored; current state is the source of truth.
- Animation effects assumed preserved; user has not confirmed final approval of new palette.