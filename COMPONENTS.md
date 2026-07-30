# COMPONENTS.md

Usage notes for the shared components in `/design-system`. See `DESIGN.md` for the token values
these components consume, and `figma/component-map.json` for the Figma node → component mapping.
Every component here is plain HTML + CSS classes (no framework) — apply classes directly to
semantic elements; there's no component API beyond that.

## Button — `.btn`

```html
<a class="btn btn--primary" href="#quote">Request a quote</a>
<button class="btn btn--secondary" type="button">Cancel</button>
```

- **Variants:** `.btn--primary` (one per view/section — the main action), `.btn--secondary`
  (neutral, outlined), `.btn--inverse` (white-on-brand, use only on a `.section--brand` or other
  brand-colored background), `.btn--destructive` (danger actions — pair with a confirmation step,
  this repo has no destructive flows yet but the primitive exists for when one is added).
- **Sizes:** default, or `.btn--sm` for compact contexts (e.g. the utility-row "Request a quote").
- **States:** `hover`/`active`/`:focus-visible` are handled by the class; pass a real `disabled`
  attribute for the disabled state, don't fake it with a class.
- Works on `<a>` or `<button>` — use `<a>` for navigation, `<button>` for in-page actions.
- Minimum 44px hit target is baked in; don't override `min-height` down.

## Badge pill — `.badge-pill`

```html
<span class="badge-pill">Serving Christian ministries for over 100 years</span>
<span class="badge-pill badge-pill--success">Brotherhood Works</span>
<span class="badge-pill badge-pill--inverse">Brotherhood Mutual</span>
```

- Decorative label chip, not interactive — use a `<span>`, not a `<button>`/`<a>`.
- `.badge-pill--inverse` is for use on brand-colored backgrounds only (mirrors `.btn--inverse`).

## Site header / nav

`.site-header` is `position: sticky`; `main.js` toggles `.is-scrolled` once `scrollY > 8`, which
swaps in the deep-blur frosted-glass treatment (`backdrop-filter: blur(var(--blur-deep))`) instead
of a flat background — this is the "very deep blur" treatment applied to the header.

- **Dropdown nav items** (`Insure Your Ministry`, `Care for your People`, `Resources`): markup is
  `<li data-dropdown><button data-dropdown-trigger aria-expanded="…">…</button><div
  data-dropdown-panel hidden>…</div></li>`. `main.js` wires click-to-toggle, closes on outside
  click and `Esc`, and only one panel is open at a time. `aria-expanded` is the source of truth for
  open state — don't toggle visibility by any other means.
- **Plain nav items** (`Legal Assist`): just an `<a class="main-nav__link">`, no dropdown markup.
- **Mobile:** below `1024px` the nav collapses behind `#mobile-nav-toggle`; `.main-nav.is-open`
  renders it as a full-width panel under the header.
- **Search:** `.nav-search` is a real `<form role="search">` with a visible-to-AT `<label>` (via
  `.visually-hidden`, not a placeholder-only label) — desktop only (`≥1024px`); there's no mobile
  equivalent yet, which is a known gap, not an oversight.

## Announcement banner — `.announcement-banner`

Single dismissible bar above the header. `main.js` persists the dismissal in
`localStorage["bm-banner-dismissed"]` so it stays closed across page loads. There's only ever one
banner primitive — don't stack a second one above the header.

## Hero — `.hero`

- `.hero__atmosphere` is the decorative deep-blur backdrop (`aria-hidden="true"`, `filter:
  blur(var(--blur-deep))` over a soft brand-colored radial gradient) — purely atmospheric, must
  never contain text or the only copy of any information.
- `.hero__highlight` (the orange span around "never lukewarm") uses `--color-accent-500` and is
  the one sanctioned use of the accent color inside heading copy — don't reuse it for anything
  that isn't a hero-style emphasized phrase.
- `h1` inside `.hero__heading` renders at `--font-size-6xl` down to `--font-size-4xl` below
  `768px` (see the media query in `components.css`) — this is the one place a page `h1` is allowed
  to exceed the normal `--font-size-4xl` heading size.

## Photo marquee — `.photo-marquee` / `.photo-tile`

Infinite-loop CSS marquee (track duplicated once in markup, animated with a `translateX(-50%)`
keyframe) with a soft edge mask. **`.photo-tile` is a placeholder** — see the Status note at the
top of `DESIGN.md` for why real photography couldn't be pulled from Figma in this environment.
Shape variants (`--rect`, `--arch`) and color variants (`--alt`, `--warm`) exist purely to
reproduce the Figma strip's alternating geometry; once real images are available, replace the
gradient background with an `<img>`/`background-image` per tile and drop the color variant
classes (keep the shape classes — they set `border-radius`, which still applies to a real photo).
Marked `aria-hidden="true"` in full since it carries no non-decorative information.

## Feature split — `.feature-split`

Two-column copy/media layout used for the "Provide" and "Protect" sections; collapses to one
column below `1024px`.

- `.feature-split__media--light` / `--brand` pick the media panel's background to match the
  section it's in (light section vs. `.section--brand`).
- Pair with `.checklist` for the coverage bullet list.

## Checklist — `.checklist`

```html
<ul class="checklist">
  <li class="checklist__item"><span class="checklist__icon">…check svg…</span>Health Insurance</li>
</ul>
```

- Two-column from `480px` up, single column below.
- Default icon color is `--color-success-500` (green). Add `.checklist--inverse` on the `<ul>`
  when the checklist sits on a brand-colored background (like the "Protect" section) — this
  switches the icon to white. The Figma source uses orange here, but orange-on-brand-blue measures
  ~1.5:1 contrast, well under the WCAG AA 3:1 floor for meaningful icons — white clears it
  (~5.2:1) instead. Either way this is a contrast choice, not a status change (every item is
  still "included"), so don't read `--inverse` as "warning."

## Site footer — `.site-footer`

Minimal by design — this Figma file doesn't model a footer section, so this isn't a literal
implementation of a design, just enough for the page to end cleanly. Don't expand it into a full
sitemap-style footer without a design to implement first.

## Shep — the proactive chat widget (`.shep`)

The single global assistant entry point (see `DESIGN.md`'s "homepage-specific primitives"). Lives
in `js/shep-chat.js`, rendered into `#shep-root`, styled by `design-system/chat-widget.css`.

**Why it's built this way (proactive, but still respects a dismissal):**
- The panel opens by default as soon as the widget initializes — no delay — as long as the
  visitor hasn't dismissed it in the last 24h (`localStorage["shep-last-dismiss"]`) or already
  had it auto-open this session (`sessionStorage["shep-auto-opened"]`). It still never nags on
  every page load once dismissed.
- While open, `.shep__scrim` — a full-viewport `position: fixed` layer appended to `<body>` —
  sits behind the panel/launcher (`z-index: 999` vs. the widget's `1000`) and applies the same
  deep-blur glass treatment to the entire page behind it, so the dialog reads as the sole focus.
  It's created in `openPanel()`/removed in `closePanel()` (and on the outside-click soft dismiss)
  alongside the panel itself.
- The opening line doesn't claim to know anything about the specific visitor (no "we noticed
  you're going on a trip") — it asks, framed generically ("Planning a mission trip with your
  ministry?"). Claiming real behavioral knowledge we don't have would read as either creepy or
  dishonest; asking is the same proactive nudge without the false claim. If real trip/policy data
  is ever wired in, that's the point to revisit this copy — not before.
- It doesn't claim to be a general-purpose AI. Free-text replies get one honest, scoped fallback
  ("I'll route you to a specialist for that") rather than an improvised answer — this is a lead-in
  to a human/quote flow, not a support bot.
- Closing it (the `×` button or clicking outside) sets the 24h cooldown; asking a quick-reply
  question does not — only an explicit dismissal counts as "not now."

**Interaction / accessibility contract — preserve these if you touch the widget:**
- `.shep__panel` is `role="dialog"` `aria-modal="true"`; `Tab`/`Shift+Tab` are trapped inside it
  (`trapFocus` in `shep-chat.js`); `Esc` closes it and returns focus to the launcher button.
- `.shep__messages` is `role="log" aria-live="polite"` so new messages are announced to screen
  readers without stealing focus.
- Quick-reply buttons are removed from the DOM once clicked (`container.innerHTML = ""`). Two
  things depend on that being handled carefully, both already fixed once — don't regress them:
  1. The outside-click "soft dismiss" listener checks `event.composedPath().includes(root)`, not
     `root.contains(event.target)` — the clicked button can be detached from the DOM before the
     event finishes bubbling, which would make `contains()` false-negative and close the whole
     panel right after a quick reply.
  2. `onQuickReply` explicitly refocuses `#shep-input` at the end — the clicked button held focus
     and just got removed, so without this, focus silently drops to `<body>` and keyboard users
     lose their place (including breaking `Esc`, whose listener lives on the panel and only fires
     while focus is inside it).
- Respects `prefers-reduced-motion` (panel/bubble slide-ins and the launcher's idle pulse are
  disabled; the typing indicator holds a static opacity instead of animating).
- Glass panel background uses `--color-glass-surface` + `backdrop-filter: blur(var(--blur-deep))`
  — the same "very deep blur" treatment as the sticky header, not a one-off value.

## Icon set — `design-system/icons.js`

Single source for JS-rendered icons (24×24, 1.5px stroke, `currentColor`). Icons embedded directly
in `index.html` markup (nav chevrons, checklist checks, search, close) follow the same visual spec
by hand — there's no build step to share literal markup between the two, so keep new icons visually
consistent with the existing set rather than trying to de-duplicate the strings.
