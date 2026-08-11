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
- `.feature-split__image` renders the real brand logo inside the media panel — `public/bro-works.png`
  (full-color, on the light "Provide" card) and `public/B-mutualWhite.png` (white-on-transparent, on
  the brand-blue "Protect" card). `width`/`height` auto with a `max-width` cap keeps it from
  outgrowing the panel while preserving the source PNG's aspect ratio — never `object-fit: cover`
  here, since cropping a logomark risks clipping the mark or wordmark.
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

**Per-page conversation flows (`data-flow`):** `#shep-root` accepts a `data-flow` attribute read
once in `initShep()`; it only changes which scripted messages/quick-replies play, never the panel
chrome, a11y contract, or open/close/dismiss behavior above. `data-flow="payroll"` (used by
`/payroll`) opens with a payroll-specific greeting instead of the homepage's mission-trip one — see
`js/shep-chat.js`'s `onPayrollIntroReply` / `showEmailCapture` / `onPayrollEmailVerified` /
`onPayrollRoofReply` chain. `data-flow="mission-trip"` (used by `/mission-trip`) runs a third,
longer chain — see the dedicated entry below. No `data-flow` (or any other value) falls back to the
original mission-trip flow. The three flows are still simple `if (flow === …)` checks throughout
`shep-chat.js`; if a fourth flow is ever added, that's the point to revisit whether a real per-flow
config object is overdue instead of one more `if` branch at each step.

- **Inline email capture** (`.shep__email-capture`, payroll flow only): a scripted step can call
  `showEmailCapture(onVerified)` to swap the quick-replies slot for a real `<input type="email">` +
  send button. Submission is validated client-side against a simple `EMAIL_PATTERN` regex;
  an invalid address shows an inline `role="alert"` error (`.shep__field-error`) tied to the input
  via `aria-describedby` and never proceeds. A valid address shows a visible `.shep__field-success`
  checkmark state before the form is torn down and the conversation continues — this is purely a
  UX confirmation, not a real account lookup (there's no backend here to actually check).

**Mission-trip flow (`data-flow="mission-trip"`) — step-by-step:**
1. **Greeting + topic select.** The greeting plays alongside `.shep__topic-select`
   (`showTopicSelect()`), a `<fieldset>` of three checkboxes (Trip protection, Fundraising tools,
   Background checks) rendered *above* `.shep__quick-replies` in the panel template so the topics
   are visible while the visitor picks Yes/No — unlike the payroll flow's email capture, this
   container coexists with quick-replies rather than replacing them. Trip protection starts
   checked; all three stay independently togglable. The checked set isn't currently read anywhere
   downstream (the intake form always shows every section) — it exists to set expectations in the
   greeting, not to gate content. If that ever needs to change, `onMissionTripIntroReply` is where
   to read the checkbox state before branching.
2. **Secondary-interest follow-ups.** Choosing "Yes, tell me more" doesn't jump straight to the
   intake form — `onMissionTripGroupSizeReply` and `onMissionTripTimingReply` ask two quick
   questions first (group size, then travel-date flexibility) via the same fixed
   `.shep__quick-replies` slot the intro uses. Each reply is where background checks and trip
   protection get worked into the conversation ("groups traveling together often like to get
   background checks done ahead of time" for a small/large group; "trip protection can cover costs
   if travel gets delayed or cancelled" for flexible dates) — but neither is ever offered as its own
   menu option, and every branch's copy still closes on mission protection as the reason Shep is
   asking at all. That throughline, not the two secondary topics, is what carries into
   `showIntakeForm()`.
3. **Intake form.** After the follow-ups, `showIntakeForm()` renders a full
   form as its own chat-message bubble via `addFormMessage()` (a `.shep__form-message` — see the
   primitive note below) rather than using a fixed-height slot, so it scrolls with the rest of
   `.shep__messages` instead of needing its own scroll region. Fields: First/Last name (required),
   Job title (required), Phone (required), Email (required), Contact preference (select),
   Organization name (required), Organization address (required), Organization type, an "I am
   interested in" checkbox group, a "Mission coverage options" checkbox group plus a free-text
   "Other" field, a "Background screening options" checkbox group, and a required consent checkbox
   whose label contains the privacy-statement link (`href="#"` — a placeholder anchor, same
   convention as the footer's `Privacy` link, until a real privacy page exists). Submitting runs
   `onIntakeFormSubmit`: required-field and email-format checks each show their own inline
   `role="alert"` error via `showFieldError`/`clearFieldError`/`validateRequired`; once everything
   passes, a `.shep__field-success` "Email verified" checkmark appears next to the email field
   (mirroring the payroll flow's inline email capture) before the whole form bubble is removed and
   the conversation continues.
4. **Closing confirmation.** `onMissionTripFormSubmitted()` closes the flow directly with "Thank
   you for making your request. Our Global Mission's Team will be reaching out to you soon." —
   unlike the payroll flow, there's no roof-savings upsell or second submit step here.

- **Form-as-message bubble** (`.shep__form-message`, mission-trip flow only): `addFormMessage(html)`
  appends arbitrary form markup into `.shep__messages` wrapped in the same `.shep__bubble
  .shep__bubble--shep` classes every other Shep message uses, plus `.shep__form-message` to widen
  it to the bubble's full available width (`max-width: 100%`) instead of the default `88%` — a form
  with this many fields needs the room a chat bubble doesn't normally get. The intake form uses this
  helper rather than the fixed `.shep__quick-replies` / `.shep__email-capture` slots, since those are
  sized for a handful of buttons or one input, not a multi-fieldset form. Because a form bubble can be
  much taller than the log's other messages, `addFormMessage` scrolls to bring the new bubble's top
  into view (via `getBoundingClientRect`, not `offsetTop` — the latter is relative to the nearest
  positioned ancestor, not necessarily `.shep__messages`) instead of jumping to `scrollHeight`, so the
  reply that introduced the form stays in view rather than being scrolled past.
- **Checkbox groups** (`.shep__form-fieldset` + `.shep__checkbox-option`): a plain `<fieldset>`/
  `<legend>` per group (topic select, "I am interested in," Mission coverage options, Background
  screening options) with native checkboxes styled via `accent-color: var(--color-brand-500)`
  rather than a custom-drawn checkbox — native controls keep the built-in keyboard/AT semantics
  `DESIGN.md`'s "semantic HTML first" rule asks for, and `accent-color` is enough to make them read
  as on-brand without hand-rolling a checked-state icon.

## Payroll landing page — `/payroll`

`payroll/index.html` is a second marketing landing page, not a new layout: it reuses the homepage's
`.site-header`/nav/announcement-banner/`.hero`/`.photo-marquee`/`.site-footer` markup verbatim (same
classes, same blur/atmosphere treatment) with payroll-specific hero copy, and reuses the homepage's
"Provide" `.feature-split` section (the Brotherhood Works checklist) as-is rather than inventing a
new content section — the "Protect" (core P&amp;C insurance) section isn't relevant here so it's not
duplicated. The only functional difference from the homepage is `<div id="shep-root"
data-flow="payroll">`, which drives Shep's payroll-specific scripted conversation (see the `data-flow`
note above). The homepage's "Payroll &amp; HR Solutions" dropdown link now points to `/payroll`
instead of `#`.

## Mission trip landing page — `/mission-trip`

`mission-trip/index.html` is a third marketing landing page: it reuses the homepage's
`.site-header`/nav/announcement-banner/`.hero`/`.photo-marquee`/`.site-footer` markup verbatim with
mission-trip-specific hero copy, and reuses the homepage's "Protect" `.feature-split` section
(`.section--brand`, `checklist--inverse`) as-is except for its bullet list, which swaps the
homepage's general P&amp;C coverage items for the mission-specific ones (Mission Travel Insurance,
Mission Liability Coverage, Medical/Evacuation Coverage, Trip Cancellation/Interruption Coverage,
Kidnap &amp; Ransom Coverage, Foreign Property/Liability Coverage) — the homepage's "Provide"
section isn't relevant here so it's not duplicated, mirroring how `/payroll` only kept "Provide."
The only functional difference from the homepage is `<div id="shep-root"
data-flow="mission-trip">`, which drives Shep's much longer mission-trip-specific scripted
conversation (see the "Mission-trip flow" entry under the Shep section above for the full
step-by-step contract). The homepage's and `/payroll`'s "Mission Trip Protection" dropdown links now
point to `/mission-trip` instead of `#`.

## Icon set — `design-system/icons.js`

Single source for JS-rendered icons (24×24, 1.5px stroke, `currentColor`). Icons embedded directly
in `index.html` markup (nav chevrons, checklist checks, search, close) follow the same visual spec
by hand — there's no build step to share literal markup between the two, so keep new icons visually
consistent with the existing set rather than trying to de-duplicate the strings.

## Universal Profile — `/universal-profile` (CRM dashboard)

A second, self-contained page (`universal-profile/index.html`, styled by
`design-system/dashboard.css`) implementing the Figma "Universal Profile" concept: an insurance
agent's living view of one client/ministry account. It's an **app-shell layout**, not a marketing
page — it doesn't use `.site-header`/`.main-nav`/`.site-footer` because its top bar has an
entirely different nav (a single "Unified Customer Record" link) and there's no page footer in the
source design. It does reuse the shared tokens, fonts,
`.btn`, and `.badge-pill` from `components.css` — see the Status note in `DESIGN.md` for how the
source file's teal/amber/dark-slate CRM palette was re-mapped onto this project's existing
`success`/`warning`/`brand` tokens instead of importing a second color scheme.

### Internal banner — `.app-internal-banner`

A short, full-width "Brotherhood Mutual Internal" strip inside `.app-shell`, above `.app-topbar`.
Reuses the marketing site's `.announcement-banner` color treatment (`brand-900` fill,
`--color-text-inverse` text) so this internal tool still reads as Brotherhood Mutual, but it's a
separate primitive: static rather than sticky, and not dismissible — it's a persistent "you're in
an internal tool" marker, not a promo a visitor closes once.

### App shell — `.app-shell`, `.app-topbar`, `.app-sidebar`, `.app-main`

- `.app-topbar` is `position: sticky`; contains the real site logo (`public/B-mutualnav.svg`), a
  "Live Sync" status pill (`.badge-pill.badge-pill--success`), the section nav (`.app-nav__link`,
  current page marked with `aria-current="page"`), a search input (`.app-search`, desktop-only
  `≥1024px` — the same accepted gap as the marketing header's `.nav-search`), a notification
  button (`.app-icon-btn`), and the account avatar (`.app-avatar`).
- `⌘K`/`Ctrl+K` focuses the search input from anywhere on the page — wired in `js/dashboard.js`.
  The visible `⌘K` hint (`.app-search__kbd`) is decorative text, not a live component.
- `.app-body` is a flex row of `.app-sidebar` (260px, `position: sticky` under the top bar on
  `≥1024px`) and `.app-main` (the flexible content column).
- **Mobile sidebar:** below `1024px`, `.app-sidebar` becomes an off-canvas panel
  (`transform: translateX(-100%)`, shown via `.is-open`) toggled by `#sidebar-toggle` in the top
  bar, with a click-to-close `#sidebar-scrim` overlay. `js/dashboard.js` wires the toggle, the
  scrim click, and `Esc` to close — mirrors the marketing site's mobile nav toggle pattern.
- Both `.app-nav` (top bar) and `.app-sidebar__nav` (sidebar) contain a single "Unified Customer
  Record" link, matching the Figma "Unified Customer Record" nav concept — see the Status note in
  `DESIGN.md` for why the sidebar's date card, stat tiles, and Quick Access section were removed
  rather than restyled.
- `.app-avatar` uses the same `brand-500` → `brand-900` gradient fill as the icon badges described
  below, rather than the flat `brand-900` the rest of the app-shell chrome (topbar, sidebar,
  `.app-icon-btn`) uses — restrained on purpose, so the brand color doesn't compete with the
  functional chrome around it.

### Brand accents — icon badges and ambient glow

To bring this page's visuals in line with the homepage's brand palette (previously it only reused
`success`/`warning`/`brand` as flat fills), two small, contrast-safe patterns were added:

- **Icon badge gradient:** `.profile-summary__icon`, `.rec-row__icon`, and `.app-avatar` (all
  originally a flat `--color-brand-900` fill) now use `linear-gradient(160deg, var(--color-brand-500),
  var(--color-brand-900))` — the exact recipe the homepage's `.photo-tile` already uses. Safe
  because these are icon-only surfaces: WCAG only requires 3:1 for "meaningful UI graphics," and
  even the lighter `brand-500` end of the gradient clears >5:1 against the white icon glyphs.
- **Contained ambient glow:** `.chart-stat-grid` gets a `::before` radial-gradient glow — the same
  recipe as the homepage's `.hero__atmosphere`, at lower opacity. It's scoped with
  `position: relative; isolation: isolate` on the grid container itself and a small negative
  `inset`, so the glow can only ever render behind the two (opaque) cards in that row and the gap
  between them — it structurally cannot underlap any bare page text, which is what keeps this safe
  under the AA contrast rules in `DESIGN.md`. `.lead-grid` had the same treatment but had it removed
  in the flat brand pass (see the Status note in `DESIGN.md`) in favor of a plain white background.
  Don't extend this glow further down the page (e.g. behind the data table or recommendations
  panel) without the same containment — a glow sitting under bare text needs a fresh contrast
  check, not a copy-paste.

### Panel card — `.panel-card`

```html
<div class="panel-card">
  <div class="panel-card__header">
    <h2 class="panel-card__heading">Product Ecosystem</h2>
    <button class="btn btn--secondary btn--sm" type="button">Add Product</button>
  </div>
  <div class="panel-card__body">…</div>
</div>
```

- The one card shell every dashboard section sits in (white surface, `--radius-lg`, `--shadow-sm`,
  `--color-border`) — reuse this instead of writing a one-off bordered `<div>` per section.
- `.panel-card--dark` (brand-500 background, inverse text) is for the single "AI Chat Summary"
  promo card — don't use it as a generic "dark mode" card, it's one deliberate visual accent, not a
  pattern to spread around. Its text/icon colors (`.promo-list__text`, `.promo-owner__role`, the
  eyebrow label) use `--color-neutral-0`/`--color-neutral-50` rather than the darker neutrals a
  near-black card could get away with — brand-500 is lighter, so anything under 4.5:1 fails AA.
- `.panel-card__header` / `.panel-card__footer` are optional top/bottom strips with a
  `--color-border` divider; `.panel-card__body` is plain padding for everything else
  (`.profile-summary`, `.stat-highlight`, etc. lay out their own content inside it).

### Stat tiles — `.stat-card`, `.stat-highlight`, `.stat-block`

Three related but distinct metric displays, matched to how the source design used them:
- `.stat-card` — the "Quick stats" mini-cards (Ministry Size, Building Age, Renewal, Excess Cyber
  Need). `.stat-card--warning` is for a signal that needs attention (maps to the `warning` semantic
  token, not a repurposed accent color).
- `.stat-highlight` — the large "Estimated Annual Premium" / "AI-Driven Safety Savings" figures;
  stacks two `.stat-highlight__section`s with a divider between them.
- `.stat-block` — the small right-aligned label/value pairs in the profile summary header (Net
  Worth, Premium). `.stat-block__value--accent` marks the one value styled with the `success`
  token (Premium, echoing the source's teal emphasis).

### Living Profile Feed — `.feed`

```html
<div class="feed">
  <div class="feed__header">…</div>
  <ul class="feed__list" id="feed-list">
    <li class="feed__item">
      <span class="feed__icon feed__icon--accent">…svg…</span>
      <div>
        <div class="feed__row">
          <p class="feed__row-title">Opened: <strong>Campaign source: Spring Outreach 2026</strong></p>
          <span class="feed__timestamp">2d ago</span>
        </div>
        <p class="feed__desc">…</p>
      </div>
    </li>
  </ul>
</div>
```

`.feed__icon--accent` (success-tinted) vs. the plain `.feed__icon` distinguishes the source's
campaign/call icon treatments from its browse-activity one — it's a visual variant, not a status
indicator.

`#feed-list` is a live list, not just a template: submitting the "Ask Shep a question" form
(`js/dashboard.js`'s `addShepFeedItem`) prepends a new `.feed__item` here so the promised "will
follow up in the Living Profile Feed" response actually happens. That entry uses a dedicated
`.feed__icon--shep` (a `brand-500`-filled circle, matching `.promo-owner__avatar` exactly) so it
reads as coming from the same Shep shown on the AI Chat Summary card, rather than blending into the
feed's other icon backgrounds.

### Promo banner — `.promo-banner`

```html
<div class="promo-banner">
  <p class="promo-banner__text">You advance the Kingdom.<br />Shep helps you protect it.</p>
  <img class="promo-banner__illustration" src="../public/bm-illustration.png" width="856" height="480" alt="" aria-hidden="true" />
</div>
```

- Sits at the bottom of the "AI Chat Summary" `.panel-card--dark`, after `.promo-owner`, with the
  same `rgba(255, 255, 255, 0.1)` divider used above it. This is the one place on the page that
  deliberately reuses the homepage's illustrated-figure brand treatment (see the "Universal
  Profile — illustrated brand banner" note in `DESIGN.md`) — it's scoped to this card because the
  card already has an "Assigned Agent" (Shep) for the illustration and tagline to represent; don't
  copy this banner onto other cards without a similar reason, or it reads as decoration for its own
  sake rather than a brand moment.
- The illustration is `public/bm-illustration.png`, the same asset used elsewhere in the repo —
  shown at its full 856:480 aspect ratio via `width: 88px; height: auto; aspect-ratio: 856 / 480`,
  not cropped with `object-fit`. The figure's raised, pointing hand is the point of the graphic; a
  fixed-square crop cuts it off.
- `.promo-banner__text` uses `--font-family-display` (Fraunces) at `--font-size-lg` — the one piece
  of dashboard body copy allowed to use the display serif, since it's standing in for marketing-style
  brand voice rather than dashboard data.
- `flex` with `justify-content: space-between` lets the text wrap to two lines on narrow widths
  without colliding with the illustration, which stays a fixed 88px width (scaling its height to
  match) rather than shrinking further — below that it would stop reading clearly.

### Data table — `.data-table`

Standard `<table>` wrapped in `.data-table-wrap` (`overflow-x: auto`) so it doesn't break layout on
narrow viewports instead of trying to reflow into cards. Status cells use the existing
`.badge-pill` variants (`--success` for Active/Opportunity, `--warning` for Pending) — there's no
gray/inactive variant yet because the source data doesn't have one; add `.badge-pill--neutral` (see
below) if a genuinely inactive/neutral status shows up later, don't reuse `--warning` for it.

### Badge pill additions — `.badge-pill--warning`, `.badge-pill--neutral`

Added to `components.css` (not `dashboard.css`) since `.badge-pill` is already a shared primitive:
- `.badge-pill--warning` — the `warning` semantic pairing (amber surface/border/text), for
  "Pending"-style states.
- `.badge-pill--neutral` — a plain gray tag for attribute/signal chips that aren't a status at all
  (e.g. "Ministry Size: High", the sidebar's "128" nav count) — deliberately colorless so it never
  reads as a semantic state.

### Progress bar — `.progress-bar`

```html
<div class="progress-bar">
  <span class="progress-bar__track"><span class="progress-bar__fill" style="--progress: 94%"></span></span>
  <span class="progress-bar__label">94%</span>
</div>
```

Set `--progress` inline per instance; the fill is a `success-border` → `success-500` gradient
(these are "confidence score" bars, framed as a positive metric, not a generic progress indicator
with variable color) — same gradient recipe as the homepage's `.photo-tile--alt`. Purely
decorative; the numeric label lives outside the track, so the gradient carries no text-contrast
concern.

### Recommendation row — `.rec-row`

The "Intelligent Recommendations & Routing" panel's repeating row: a 4-column grid
(`.rec-row__product`, `.progress-bar`, the "why" text + `.rec-row__tags`, and `.rec-owner`) that
collapses to a single stacked column below `1024px`. `.rec-columns` renders the column headings
above the list on `≥1024px` only (`aria-hidden="true"` — the row content is already
self-describing via visible labels, so the column headers are a layout aid, not the only source of
that meaning). `.rec-owner__avatar` uses initials or `?` text rather than a photo, consistent with
this repo's no-photography-placeholder approach. The pending-owner state's `rec-owner__status--pending`
line ends with a `.rec-owner__reminder-link` — an inline text link ("Send a reminder") to `/email`,
the transactional lead-notification template (see "Email — `/email`" below). It's a plain underlined
`brand-500` link rather than a `.btn`, since it's one clause inside a sentence, not a standalone
action — WCAG 2.5.5's 44px hit-target rule has a standing exception for inline links in text for
exactly this reason.

### Bar chart — `.bar-chart`

A deliberately simple, illustrative CSS bar chart (flex columns + `--bar-height` custom properties
per bar), **not** a pixel-accurate reproduction of the source Figma chart — that chart is a deeply
nested vector group that was infeasible to extract exactly, and a hand-rolled approximation that
matches its described trend (premium rising, savings low and flat) is more honest than fabricating
false precision. The whole plot has a single `role="img"` with a descriptive `aria-label`
summarizing the trend in words, since the bars/gridlines carry no accessible text on their own.
The "Proposed Premium" bars/legend dot use the same `brand-500` → `brand-900` gradient as the icon
badges below; "Risk Savings" stays a flat `success-500` fill to keep the two series visually
distinct at a glance.

### Empty state — `.empty-state`

Dashed-border placeholder ("Future Ecosystem Partners") for a list section with no current data —
reuse this instead of just omitting the section, so it's clear the empty state is intentional
rather than a bug.

## Partner Console — `/dashboard-partner`

A second, self-contained page (`dashboard-partner/index.html`, same `dashboard.css`) — Forte's
external-facing view into its Brotherhood Mutual partnership. It's built on the same app-shell as
`/universal-profile` (topbar, off-canvas sidebar, `.panel-card`, `.badge-pill`, `.btn`, the Shep
voice) but is a **governed projection**, not a second internal record: see the "Sixth page" note in
`DESIGN.md` for the architecture. Every section below only ever renders data Forte's partner
agreement permits — no policy/premium/claims detail, no other partner's activity, no unmatched
organizations, no individual-level information.

### Reused as-is

`.profile-summary` (partner identity header — "Forte" stands in for the org name `/universal-profile`
uses it for), `.quick-stats`/`.stat-card` (Partnership Performance, Match Quality, Inbound stat
rows), `.feed` (Recent Activity), `.rec-owner__avatar` (agent initials in `.record-row__agent`), and
`.empty-state`'s dashed-border pattern are all unmodified — reused directly rather than re-styled,
per "build on primitives, not one-offs."

### Governance note — `.governance-note`

```html
<div class="governance-note">
  <svg>…lock icon…</svg>
  <span><strong>Matched organizations only</strong> — your access is limited to organizations and
  fields permitted by your partner agreement.</span>
</div>
```

Calm, factual framing of the access boundary required by the product's governance rules — no
warning-surface tint, no legal-notice styling. This is a standing fact about the product, not
something to flag as a problem. Used under "Matched Organizations" and again (in a slightly
different sentence) under "Inbound from Forte."

### Opportunity funnel — `.funnel`

```html
<div class="funnel" role="group" aria-label="…">
  <button class="funnel__stage" type="button" data-stage="matched" aria-pressed="false">
    <span class="funnel__stage-count">42</span>
    <span class="funnel__stage-label">Matched</span>
    <span class="funnel__stage-bar" style="--funnel-fill: 100%"></span>
  </button>
  <svg class="funnel__arrow">…</svg>
  <!-- …repeated for Recommended/Introduced/Session/Engaged/Converted… -->
</div>
<button class="funnel__stalled" type="button" data-stage="stalled">3 opportunities stalled after recommendation</button>
```

A clean stepped-card progression rather than a BI-style funnel chart, per the design brief's "calm,
sparse, human-scale" direction. `--funnel-fill` (set inline per stage, same pattern as
`.bar-chart`'s `--bar-height` and `.progress-bar`'s `--progress`) sizes each stage's underline bar
relative to the first stage, giving an at-a-glance sense of drop-off without a real chart. The
stalled note is deliberately plain text with a small warning-colored icon — not a warning-surface
banner — per the brief's "actionable but not alarming."

Stage buttons and the stalled note are **live filters**, wired in `js/dashboard-partner.js`:
clicking one filters `#org-list`'s `.record-row`s to that `data-stage` (or, for "stalled", to rows
with `data-stalled="true"`), shows `.funnel-filter-status` with a live count and a "Clear filter"
action, and toggles `aria-pressed`/`.is-active` on the buttons. Clicking the active stage again (or
"Clear filter") resets to the full list.

### Record rows — `.record-list`, `.record-row`, `.record-row--lead`

```html
<div class="record-row" data-org="grace-fellowship" data-stage="recommended" data-stalled="true">
  <div class="record-row__identity">
    <p class="record-row__name">Grace Fellowship</p>
    <p class="record-row__meta">Large ministry · Midwest</p>
    <p class="record-row__stalled-flag"><svg>…</svg> Stalled 12 days</p>
  </div>
  <span class="badge-pill badge-pill--neutral">Recommended</span>
  <div class="record-row__agent"><span class="rec-owner__avatar">AL</span> <span class="record-row__agent-name">Alan</span></div>
  <span class="badge-pill badge-pill--success">High match</span>
  <button class="btn btn--secondary btn--sm record-row__action" type="button" data-org-detail="grace-fellowship">View</button>
</div>
```

One shared row shape for both "Matched Organizations" (5 columns: identity, funnel-stage badge,
agent, match-quality badge, a "View" action) and "Inbound from Forte" (`.record-row--lead`, a
3-column variant — identity, consent badge, resolution badge — since inbound leads don't have an
agent or match score yet). Badge color mapping is deliberate, not arbitrary: `--neutral` for
Matched/Recommended (early, no signal yet), `--info` (new — see below) for Introduced/Session
booked/Engaged (in progress, not yet a confirmed outcome), `--success` reserved for Converted only,
matching `DESIGN.md`'s "success = confirmations/completed states" rule rather than using it for
every positive-sounding stage. Match quality reuses the same success/neutral pairing (High/Medium).
An org's incompleteness — no premium, no risk detail, sometimes no agent yet
("Pending assignment", `.rec-owner__avatar` showing "?") — is intentional per the design brief, not
a missing-data bug.

Collapses to a single stacked column below `1024px`, same responsive strategy as `.rec-row`.

### `.badge-pill--info` (added to `components.css`)

A fourth `.badge-pill` variant, alongside `--success`/`--warning`/`--neutral`, for in-progress
states that aren't a completed success yet (Introduced, Session booked, Engaged, and the inbound
"Net-new prospect" resolution). `--color-info-500` on `--color-info-surface` clears ~4.9:1 — just
over the 4.5:1 AA floor at this pill's small text size, following the same check `--warning-500` got
in the original brand pass.

### Partner Opportunity Detail — `.org-detail` (native `<dialog>`)

A single reusable `<dialog>`, populated per-organization by `js/dashboard-partner.js`'s
`openOrgDetail()` rather than nine near-duplicate static detail blocks. Native `<dialog>` +
`showModal()` gives a real focus trap, Esc-to-close, and a `::backdrop` for free — `dashboard.css`
only resets its default browser chrome (border, padding, max-height/width) and adds the
close-button/backdrop-click handlers in JS. Closing restores focus to whichever `[data-org-detail]`
button opened it (`js/dashboard-partner.js` tracks `lastTrigger`), satisfying `DESIGN.md`'s modal
focus-restoration rule.

Content is data-driven from an `ORG_DETAILS` map keyed by the same slug used in `data-org-detail`:
facts (Forte opportunity / match quality / agent), a "Why this organization was matched" callout
(`.org-detail__why`), and a 6-step `.org-detail__timeline` (Matched → Recommended to agent → Agent
engaged → Introduction made → Session booked → Conversion) with the first `doneSteps` marked
`.is-done`. **The "why matched" copy is a hard product-governance rule, not just tone**: every
reason is organizational context Brotherhood is permitted to use (leadership transitions, ministry
size, staff growth, region) — never an inference about a named individual's health, mental health,
or private circumstances. Don't add a "why" string to `ORG_DETAILS` that violates this.

### Reciprocal flow schematic — `.flow-diagram`

```html
<div class="flow-diagram" role="img" aria-label="…">
  <span class="flow-diagram__step"><svg>…</svg> Forte site</span>
  <svg class="flow-diagram__arrow">…</svg>
  <!-- …Consent → Brotherhood match → Existing / net-new → Agent routing… -->
</div>
```

Under "Inbound from Forte" — a static chain of pill-shaped steps, visually distinct from the
interactive, count-driven `.funnel` above it (no numbers, not clickable) so the outbound
(Brotherhood → Forte) and inbound (Forte → Brotherhood) halves of the loop read as two different
mechanisms, per the design brief. `role="img"` + a descriptive `aria-label` on the container, same
pattern as `.bar-chart__plot`, since the steps carry no other accessible grouping text.

### Digest list — `.digest-list`

A plain icon+text bullet list for "Latest Partner Digest" — deliberately not an activity feed
(reuses `.feed` for that, in "Recent Activity" instead). Kept intentionally small/quiet: the design
brief frames the email digest as the primary interface and this dashboard as the secondary
drill-down, so this section should read as a summary, not compete with the funnel/matched-orgs
sections above it for attention.

### Resource list — `.resource-list`

```html
<div class="resource-list__item">
  <span class="data-table__icon data-table__icon--accent">…</span>
  <div class="resource-list__text">
    <p class="resource-list__title">90-Second Forte Overview</p>
    <p class="resource-list__meta">Video · 1:30</p>
  </div>
  <button class="btn btn--secondary btn--sm">Watch</button>
</div>
```

Under "Partner Resources" — reuses `.data-table__icon`'s existing icon-bubble treatment rather than
a new one. A flat divided list (`border-bottom` between items) instead of cards, since these are
simple link-style actions, not data records.

### Shep contextual note — `.shep-note`

```html
<div class="shep-note">
  <span class="shep-note__avatar"><svg>…</svg></span>
  <p class="shep-note__text"><strong>Shep:</strong> 3 organizations changed stage since your last digest.</p>
</div>
```

One-line, non-modal Shep callouts (under the partner header and again under Match Quality) — reuses
`.feed__icon--shep`'s exact avatar treatment. Two on the whole page, by design: the brief is explicit
that Shep should stay a small, contextual presence here, not the center of the dashboard the way the
"Ask Shep" input and AI Chat Summary card are on `/universal-profile`. This page doesn't reuse
`.panel-card--dark`/`.promo-*`/`.ask-shep` for that reason — those are `/universal-profile`'s
internal-agent AI surface, not part of what a partner needs.

## Email — `/email`

`email/index.html` is the transactional "new lead" notification email sent from Shep to the
routed agent (currently hardcoded to a "Peter" recipient and the Grace Community Church lead used
throughout `/universal-profile`, matching this repo's other pages' use of one representative
example account rather than dynamic data). It's a summary/nudge that recaps two blocks straight
from the Universal Profile — a condensed Living Profile Feed (3 of its items) and the full
Recommended Next Steps list — with a single primary CTA ("View Profile") deep-linking to
`/universal-profile`.

**This page does not load `tokens.css`/`components.css`/`dashboard.css`.** That's a deliberate,
necessary exception to "tokens are the only source of design values": it's authored as a real HTML
email template (table layout, inline styles throughout, one small `<style>` block only for the
`@media` mobile-stacking rule and link/button `:hover`), because the inboxes this is meant to
render in — Outlook desktop above all — strip `<link>` stylesheets and don't support CSS custom
properties. Every inline hex value is still a direct copy of a `tokens.css` value (not a new
color), so the page stays visually identical to `/universal-profile`; if the token palette ever
changes, this file's hex values need a manual, matching update since they can't `var()` off the
token file the way every other page does.

Content mapping back to `/universal-profile`, so the two stay in sync if either changes:
- The lead identity card (org name + `.badge-pill--success`, policy/location line, three stats)
  mirrors `.profile-summary` + `.quick-stats`.
- "Living Profile Feed" mirrors `.feed`, trimmed to 3 of its 4 items (an email nudge that reproduces
  the entire feed stops reading as a snapshot) — the Opened/Engaged pair collapses to just the
  Engaged entry since they describe the same campaign touch.
- The blue "Recommended Next Steps" block mirrors `.promo-recommendations` verbatim (same two
  bullets, same copy).
- The sign-off strip mirrors `.promo-banner` (same illustration + tagline), and is hidden on the
  `@media (max-width: 620px)` breakpoint rather than shrunk further, since a wallet-sized version of
  `bm-illustration.png` stopped being legible in testing.

Icons are the same inline SVGs used by `/universal-profile` (Shep's compass mark, the feed-item
icons, the recommendation bullet's circle-chevron) — kept as SVG for this in-browser preview so it
stays pixel-identical to the source page, but flagged here since a production send through an ESP
would need to export them as PNGs first: Outlook desktop's Word rendering engine has no SVG
support at all, unlike this repo's brand mark, which already ships both an SVG (`B-mutualnav.svg`,
used in the email's header, on-brand for this page's white-background chrome) and a PNG fallback
(`B-mutualWhite.png`) for exactly this kind of client gap.

Reachable from `/universal-profile` via the `.rec-owner__reminder-link` documented above ("Send a
reminder" on the Mission Travel row's pending-owner status — the same lead this email is about).

## Email — `/email-carly-follow`

`email-carly-follow/index.html` is Shep's check-in note to Carly herself, sent after Alan's
callback covered her renewal plus the three threads it surfaced (payroll, roof, missions travel).
It's structurally closest to `/email-peter` — no identity card, Living Profile Feed, or
Recommended Next Steps block, since there's no account data to summarize for the recipient who
*is* the account — but adds one thing `/email-peter` doesn't need: a "What Happens Next" recap
block (reusing the blue box and circle-chevron bullet from `/email`'s Recommended Next Steps)
listing who owns each of the three threads and what Carly should expect from them next. Unlike
`/email-peter`'s plain inline reply link, the CTA here is a full button (`.reminder-btn`, matching
`/email`'s and `/email-carly`'s primary CTA) pointed at a `mailto:` link — this page's ask is a
reply, so the reply is the primary action, not a secondary link under a button that goes somewhere
else.

Same inline-styles/table-layout rationale as `/email` applies (see that entry) — this is not a new
pattern, just a third content variant of the same transactional template.
