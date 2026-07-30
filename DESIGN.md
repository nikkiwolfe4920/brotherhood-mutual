# DESIGN.md

This file is the source of truth for the visual design system: tokens, component standards,
spacing, typography, accessibility rules, and UI implementation guidelines. Read it alongside
`CLAUDE.md` before starting any UI work. If a decision here conflicts with a one-off request,
raise it rather than silently deviating.

> **Status:** Tech stack is locked in: static HTML/CSS/vanilla JS (see `CLAUDE.md`). Tokens below
> are CSS custom properties, implemented at `/design-system/tokens.css` and consumed by
> `/design-system/base.css` and `/design-system/components.css`. The palette, type scale, and
> component list in this file were sourced from the Figma homepage design
> (`figma.com/design/hlV7Q6MnEMhJQpdiDSXmUH`, node `1:2`) — see `/figma/component-map.json` for
> the node-id → component mapping.
>
> **Fonts:** the Figma file specifies Tobias (display serif) and Haffer (UI sans) — both licensed,
> non-Google fonts. This project uses the closest Google Fonts equivalents instead: **Fraunces**
> for `--font-family-display` and **Manrope** for `--font-family-base`. If the licensed fonts are
> ever purchased, swap the `@import`/`<link>` in `index.html` and the two `--font-family-*` values
> here — component code never references a font name directly.
>
> **Asset note:** this environment's egress policy blocks direct downloads from `figma.com`, so
> the photographic imagery in the Figma file (hero photo strip, feature-section photography)
> could not be pulled into the repo as real image assets. Those slots are implemented as
> gradient/pattern placeholders (see `.photo-tile` in `components.css`) sized and shaped to match
> the design — swap in real photography via the `background-image` / `<img>` slot when available.
> Icons and the two brand logos (Brotherhood Mutual, Brotherhood Works) are simple enough
> geometric marks that they were hand-authored as faithful inline SVG instead.
>
> **Second page — Universal Profile:** `/universal-profile` (`universal-profile/index.html`) is a
> CRM-style account dashboard for insurance agents, sourced from the same Figma file's
> `Pitch-Concepts` page (node `16:3`) — see `/figma/component-map.json` for its node mapping. Its
> source design uses its own dark-slate/teal/amber CRM color scheme; rather than importing a
> second palette, every color was re-mapped onto the existing token set (teal → the `success`
> semantic, amber → `warning`, dark slate → `--color-brand-900`/text tokens), and its empty logo
> placeholder was filled with the real `public/B-mutualnav.svg` mark. Its page-specific styles live
> in `/design-system/dashboard.css` (parallel to `chat-widget.css`) rather than growing
> `components.css` indefinitely — see `COMPONENTS.md` for the new primitives it introduces
> (`.panel-card`, `.stat-card`, `.data-table`, `.progress-bar`, `.rec-row`, the bar chart, etc.).
> Two token additions were needed to support it: `--color-warning-surface` /
> `--color-warning-border`, filling the same 3-tier surface/border pattern `success` and `info`
> already had. Implementing it also surfaced that the pre-existing `--color-warning-500` (`#b4790f`,
> unused anywhere until now) only cleared 3.36:1 against its new surface — short of the 4.5:1 AA
> floor this file requires for normal text — so it was darkened to `#8f620b` (5.36:1 on white,
> 4.87:1 on `--color-warning-surface`) rather than shipping a token nobody could actually use at
> body-text sizes.
>
> **Universal Profile — brand pass:** the CRM re-mapping above left the page's `brand` usage flat
> (solid `--color-brand-900` fills). A follow-up pass brought in the homepage's actual brand
> *treatments*, not just its tokens: the `brand-500`→`brand-900` gradient from `.photo-tile` now
> fills the icon badges (`.profile-summary__icon`, `.rec-row__icon`, `.app-avatar`) and the bar
> chart's "Proposed Premium" series; the `success-border`→`success-500` gradient from
> `.photo-tile--alt` fills `.progress-bar__fill`; and the tri-color radial glow from
> `.hero__atmosphere` now sits behind `.lead-grid` and `.chart-stat-grid` (contained to those grids
> via `isolation: isolate` so it can only render behind their opaque cards, never under bare text).
> `.panel-card--dark` also picked up a 4px tri-color accent strip along its top edge. See
> `COMPONENTS.md`'s "Brand accents" subsection for the contrast rationale on each.
>
> **Universal Profile — illustrated brand banner:** the brand pass above still left the page
> without the one thing that makes the homepage feel like Brotherhood Mutual rather than a generic
> CRM: the hand-illustrated figure used in its brand-blue banners. A small version of that
> illustration (hand-authored inline SVG, same treatment as the two brand logomarks — see the
> Status note above) was added to the bottom of the "AI Chat Summary" card, paired with a tagline
> adapted from the homepage's "You advance the Kingdom. We protect the work." — rewritten as "You
> advance the Kingdom. Shep helps you protect it." so it reads as this card's own AI agent (Shep,
> already the card's "Assigned Agent") speaking, not detached marketing copy. See `COMPONENTS.md`'s
> "Promo banner" entry for the markup and the reason it lives on this card specifically.
>
> **Universal Profile — flat brand pass:** a later revision reversed part of the brand pass above
> in favor of the plain `--color-brand-500` fill `.btn--primary` already uses everywhere else in
> the product. `.panel-card--dark` ("AI Chat Summary") is now a solid `brand-500` fill with no top
> accent strip; `.promo-owner__avatar` (the Shep icon) and `.promo-owner__action` (the send/message
> icon) use `brand-500` instead of the `success` token, with a `--color-neutral-0` ring on the
> latter so a blue icon button stays visible against the now-blue-not-navy card; `.lead-grid`'s
> ambient radial glow was removed entirely (that area is plain white/`--color-surface` again); and
> `.app-sidebar` is a solid `brand-500` fill with its nav links, icons, and the "Quick access"
> label recolored to `--color-neutral-50`/`--color-neutral-0` so they clear 4.5:1 against it — the
> active-state pill, badge counts, and quick-access tiles already used white/light local
> backgrounds and needed no change. `.chart-stat-grid` keeps its ambient glow; it wasn't part of
> this pass.

## Design Principles

1. **Clarity over decoration.** This is an insurance product; users are often here during a
   stressful moment (filing a claim, reviewing a policy). Favor plain language, obvious affordances,
   and low visual noise over ornamentation.
2. **Consistency over novelty.** Reuse existing tokens and components before introducing new ones.
   A new visual pattern must solve a real, recurring need.
3. **Accessible by default.** Accessibility is not a separate pass — it's a requirement of "done"
   for every component and screen.
4. **One system, not per-page styles.** No inline one-off colors, spacing, or font sizes. If a
   value isn't a token, it doesn't ship.

## Design Tokens

Tokens are the single source of truth for design values. They are defined once and referenced
everywhere else — never hardcode a raw hex, pixel, or font value in component code.

### Token Categories

- **Color** — brand, accent (decorative brand highlight, never semantic), semantic
  (success/warning/danger/info), neutral scale, surface, text, border
- **Typography** — font family, size scale, weight, line-height, letter-spacing
- **Spacing** — a single spacing scale used for margin, padding, and gap
- **Radius** — border-radius scale
- **Shadow/Elevation** — a small set of elevation levels
- **Glass/Blur** — frosted-glass surface tokens for overlay UI (sticky header on scroll, the Shep
  chat widget, hero atmosphere) — a real, recurring need across 3 surfaces, so it earns its own
  token category rather than one-off `backdrop-filter` values
- **Motion** — duration and easing for transitions/animations
- **Breakpoints** — responsive layout thresholds

### Reference Token Set

```css
:root {
  /* Color — neutral scale */
  --color-neutral-0: #ffffff;
  --color-neutral-25: #fbfbfc;
  --color-neutral-50: #f5f6f7;
  --color-neutral-100: #ebecef;
  --color-neutral-200: #e0e3e8;
  --color-neutral-300: #b7bec7;
  --color-neutral-400: #8f98a3;
  --color-neutral-500: #66718a;
  --color-neutral-600: #515964;
  --color-neutral-700: #3a4048;
  --color-neutral-800: #262a30;
  --color-neutral-900: #16181b;

  /* Color — brand (navy + blue, from the Figma source) */
  --color-brand-500: #0062f1;
  --color-brand-600: #0052c9;
  --color-brand-700: #003e99;
  --color-brand-900: #00133c;

  /* Color — accent (decorative brand highlight only — never repurposed as a semantic color) */
  --color-accent-500: #dc6803;

  /* Color — semantic */
  --color-success-500: #006353;
  --color-success-surface: #ebfbf8;
  --color-success-border: #aaece1;
  --color-warning-500: #8f620b;
  --color-warning-surface: #fdf3e2;
  --color-warning-border: #f0d99b;
  --color-danger-500: #b3261e;
  --color-info-500: #0071aa;
  --color-info-surface: #ebf8ff;
  --color-info-border: #aae3ff;

  /* Color — surface & text (light theme defaults) */
  --color-surface: var(--color-neutral-25);
  --color-surface-raised: var(--color-neutral-0);
  --color-surface-alt: var(--color-neutral-50);
  --color-text-primary: var(--color-brand-900);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-inverse: var(--color-neutral-0);
  --color-border: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);

  /* Color — glass/blur overlay surfaces (sticky header, chat widget, hero atmosphere) */
  --color-glass-surface: rgba(255, 255, 255, 0.72);
  --color-glass-surface-strong: rgba(255, 255, 255, 0.88);
  --color-glass-border: rgba(255, 255, 255, 0.5);
  --blur-md: 12px;
  --blur-lg: 24px;
  --blur-deep: 48px;

  /* Typography */
  --font-family-base: "Manrope", system-ui, -apple-system, sans-serif;
  --font-family-display: "Fraunces", Georgia, serif;
  --font-family-mono: "JetBrains Mono", ui-monospace, monospace;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-md: 1rem;       /* 16px — base */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3.0625rem; /* 49px — Provide/Protect-style h2 */
  --font-size-6xl: 3.8125rem; /* 61px — hero h1 */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing (4px base unit) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-sm: 0 1px 2px rgba(22, 24, 27, 0.06);
  --shadow-md: 0 4px 8px rgba(22, 24, 27, 0.08);
  --shadow-lg: 0 12px 24px rgba(22, 24, 27, 0.12);
  --shadow-xl: 0 24px 48px rgba(0, 19, 60, 0.16);

  /* Motion */
  --duration-fast: 100ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --easing-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Breakpoints (reference values — use in media queries, not as custom properties directly) */
  /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */
}
```

Dark theme overrides re-map the semantic surface/text/border variables only — never the base
neutral or brand scale:

```css
[data-theme="dark"] {
  --color-surface: var(--color-neutral-900);
  --color-surface-raised: var(--color-neutral-800);
  --color-surface-alt: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-0);
  --color-text-secondary: var(--color-neutral-300);
  --color-border: var(--color-neutral-700);
  --color-border-strong: var(--color-neutral-600);
  --color-glass-surface: rgba(10, 14, 26, 0.68);
  --color-glass-surface-strong: rgba(10, 14, 26, 0.85);
  --color-glass-border: rgba(255, 255, 255, 0.12);
}
```

### Token Rules

- Components reference **semantic** tokens (`--color-text-primary`, `--space-4`), not raw scale
  values (`--color-neutral-900`), so themes and future re-brands only require editing the token
  file.
- Never introduce a new raw color, spacing, or font-size value in component code. If the scale
  doesn't have what you need, propose a token addition and update this file.
- The spacing scale is used for **all** layout spacing (margin, padding, gap). Do not use
  arbitrary pixel values.

## Typography

- **Base size:** 16px (`--font-size-md`), scaling via `rem` so it respects user font-size
  preferences. Never use px for font sizes.
- **Type scale:** use the steps in `--font-size-*` only. Headings map to fixed steps:
  - `h1` → `--font-size-6xl` / `--font-weight-bold` / `--font-family-display` (hero-only; page `h1`s
    elsewhere use `--font-size-4xl`)
  - `h2` → `--font-size-5xl` / `--font-weight-semibold` / `--font-family-display`
  - `h3` → `--font-size-2xl` / `--font-weight-semibold` / `--font-family-base`
  - `h4` → `--font-size-xl` / `--font-weight-semibold` / `--font-family-base`
  - body → `--font-size-md` / `--font-weight-regular` / `--font-family-base`
  - caption/helper text → `--font-size-sm` / `--color-text-secondary`
  - **Display serif (`--font-family-display`) is reserved for `h1`/`h2`** — the moment it appears
    on body copy, a button, or a caption, that's a signal the hierarchy is wrong, not a reason to
    reach for the serif elsewhere.
- **Line length:** target 60–80 characters per line for body copy; constrain text blocks with
  `max-width` rather than letting them span the full viewport.
- **Line height:** `--line-height-tight` for headings, `--line-height-normal` for body text,
  `--line-height-relaxed` for long-form/legal copy (policy documents, disclosures).
- **Never** use font weights below 400 or skip a heading level for visual effect (e.g. using `h4`
  styling on an `h2` element) — visual size and semantic level must match.

## Spacing & Layout

- 4px base unit; all spacing values are multiples of it via the `--space-*` scale.
- Use a 12-column grid for page layout at `lg`/`xl` breakpoints, collapsing to a single column
  below `md`.
- Standard content max-width: 1280px, centered, with `--space-5` (24px) horizontal gutters on
  mobile and `--space-6` (32px) on desktop.
- Component-internal spacing (padding inside a card, gap between form fields) should use the same
  scale as page-level layout — don't invent a separate "small" scale.

### Breakpoints

| Name | Min-width | Typical use |
|------|-----------|-------------|
| `sm` | 640px     | Large phones |
| `md` | 768px     | Tablets |
| `lg` | 1024px    | Small desktop |
| `xl` | 1280px    | Desktop |

Design mobile-first: base styles target the smallest viewport, with `min-width` media queries
layering on enhancements.

## Color Usage

- **Text contrast:** body text on its surface must meet **WCAG 2.1 AA** (4.5:1 for normal text,
  3:1 for text ≥ 18px/bold ≥ 14px). Verify any new color pairing before use.
- **Semantic colors mean one thing each:**
  - `success` — confirmations, completed states (e.g., "Claim submitted")
  - `warning` — needs attention, not yet an error (e.g., "Policy renewal due soon")
  - `danger` — errors, destructive actions, failed states
  - `info` — neutral informational callouts
  - Do not repurpose a semantic color for decoration or branding.
- **`--color-accent-500` (orange) is decoration, not status.** It exists for one job: emphasizing
  a phrase inside a heading (e.g. "never lukewarm" in the homepage hero). It must never stand in
  for `warning`, and a warning/error state must never borrow it for "brand feel."
- **Color is never the only signal.** Pair color with an icon, label, or text (e.g., an error
  state has red border/text *and* an inline error message, not just a red outline).

## Component Standards

- **Build on primitives, not one-offs.** Buttons, inputs, selects, checkboxes, radios, cards,
  modals/dialogs, tables, tabs, tooltips, and toasts are the core primitive set. New UI is composed
  from these; a new primitive requires justification (a real, recurring need across ≥2 screens —
  see `CLAUDE.md`'s "no premature abstraction" rule).
- **Homepage-specific primitives** (added for the marketing site, documented in full in
  `COMPONENTS.md`): `.badge-pill` (rounded-full label chip, used for the hero eyebrow and the
  "Brotherhood Works"/"Brotherhood Mutual" section tags), `.feature-split` (two-column
  image/copy section, used for the Provide/Protect sections and any future product pairing), and
  `.checklist` (icon + label list for coverage bullets). `.photo-tile` is a placeholder-imagery
  primitive (see the Status note above) — replace with a real `<img>`/`background-image` per tile
  once photography assets are available; don't build new UI on top of the placeholder styling
  itself.
- **Universal Profile-specific primitives** (added for the `/universal-profile` CRM dashboard,
  documented in full in `COMPONENTS.md`): `.panel-card` (the bordered white card shell used for
  every dashboard section), `.stat-card`/`.stat-highlight` (metric tiles), `.data-table`, a CSS
  `.progress-bar`, `.rec-row` (the recommendation-list row), `.feed` (the Living Profile Feed
  list), `.promo-banner` (the illustrated brand tagline on the AI Chat Summary card), and a
  lightweight illustrative `.bar-chart`. These live in their own
  `design-system/dashboard.css` and read as a distinct "app" surface, not a second marketing page
  style — don't reuse them on marketing pages without checking they still fit.
- **The Shep chat widget** is a single, global, proactive assistant entry point — see
  `COMPONENTS.md` for its states and copy rules. Don't create a second chat/assistant surface
  without folding it into this one.
- **States are mandatory, not optional,** for every interactive component: `default`, `hover`,
  `focus-visible`, `active`, `disabled`, and (where applicable) `loading` and `error`. A component
  isn't done until all of these are implemented and visually distinct.
- **Buttons:**
  - Primary (one per view/section — the single main action), secondary, and destructive variants.
  - Minimum hit target 44×44px regardless of visual size, per WCAG 2.5.5 / mobile guidance.
  - Destructive actions (cancel policy, delete document) use the `danger` semantic color and
    require a confirmation step.
- **Forms:**
  - Every input has a visible, associated `<label>` — placeholder text is never a substitute for
    a label.
  - Validation errors appear inline, next to the field, in text (not color alone), and are
    announced to assistive tech (see Accessibility).
  - Required fields are marked explicitly (e.g., "(required)"), not only by a red asterisk.
- **Cards/containers:** use `--shadow-sm`/`--shadow-md` and `--radius-md` consistently; don't mix
  elevation levels arbitrarily within the same list/grid of items.
- **Modals/dialogs:** trap focus while open, restore focus to the trigger element on close, and
  are dismissible via `Esc` and an explicit close control.
- **Icons:** from a single icon set only — this project uses one hand-authored inline-SVG set
  (`design-system/icons.js` exposes them as template strings), 24×24 grid, 1.5px stroke, rounded
  caps/joins, no fills except for the two brand logomarks. Icons that convey meaning (not purely
  decorative) must have an accessible name (see Accessibility).

## Accessibility Rules

Target: **WCAG 2.1 Level AA**, minimum, for all shipped UI.

- **Contrast:** 4.5:1 for normal text, 3:1 for large text and meaningful UI graphics/icons, against
  their background, using the token pairings defined above.
- **Keyboard:** every interactive element is reachable and operable via keyboard alone, in a
  logical tab order matching visual order. No keyboard traps.
- **Focus visibility:** every focusable element has a visible `:focus-visible` style (never
  `outline: none` without a replacement indicator).
- **Semantic HTML first:** use native elements (`<button>`, `<a>`, `<label>`, `<table>`) before
  reaching for ARIA. ARIA supplements semantics; it doesn't replace them.
- **Forms & errors:** label every input; associate error messages with their field via
  `aria-describedby`; announce validation errors on submit via a live region or focus management
  so screen reader users aren't left on a silent form.
- **Images & icons:** meaningful images have descriptive `alt` text; purely decorative images use
  `alt=""` or `aria-hidden="true"`.
- **Motion:** respect `prefers-reduced-motion` — non-essential transitions/animations are disabled
  or reduced when the user has this preference set.
- **Headings:** one `h1` per page; heading levels don't skip (no `h1` → `h3`).
- **Testing:** run an automated accessibility check (e.g., axe) against new/changed screens before
  calling work done, in addition to manual keyboard and screen-reader spot checks for anything
  interactive.

## UI Implementation Guidelines

- **Tokens are the only source of design values.** Component styles reference CSS custom
  properties (or the equivalent in the chosen framework's theme system) — never hardcoded hex
  codes, pixel values, or font stacks.
- **Naming convention:** tokens follow `--<category>-<variant>-<step>` (e.g., `--color-brand-500`,
  `--space-4`). Component classes/files use the same casing convention as the rest of the codebase
  once the stack is chosen (see `CLAUDE.md`).
- **Responsive by default:** build mobile-first; verify each component at `sm`, `md`, and `lg`
  breakpoints before merging.
- **No magic numbers.** A pixel value, color, or duration that isn't a token is a signal to either
  use an existing token or propose a new one — not to hardcode it.
- **Component documentation:** any new shared component gets a brief usage note (props/variants,
  when to use vs. not use) alongside its code — not a separate wiki page that will drift.
- **Theming:** light/dark theme support is achieved by re-mapping semantic tokens only (see the
  `[data-theme="dark"]` block above); component code should never branch on theme directly.
- **Before merging UI work:** verify against this file's component states, spacing/typography
  scale, and the accessibility rules above. If something doesn't fit an existing token or
  component, raise it rather than working around it silently.

## Governance

- This is a living document. When a session establishes a new token, component pattern, or
  accessibility requirement, update this file in the same change — don't let the system drift
  from what's actually shipped.
- Significant design-system changes (new component primitives, token scale changes, breakpoint
  changes) should be called out explicitly in the PR description, same as architectural decisions
  under `CLAUDE.md`.
