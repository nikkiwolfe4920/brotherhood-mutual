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

A second, self-contained page (`dashboard-partner/index.html`, same `dashboard.css`) — Highpoint
Roofing & Restoration's external-facing view into its Brotherhood Mutual partnership. (An earlier
revision built this for a different partner, Forte, a mental-fitness coaching company — see the
"second partner" note in `DESIGN.md` for what changed and why "Highpoint" appears as shorthand for
the full name in body copy.) It's built on the same app-shell as `/universal-profile` (topbar,
off-canvas sidebar, `.panel-card`, `.badge-pill`, `.btn`, the Shep voice) but is a **governed
projection**, not a second internal record: see the "Sixth page" note in `DESIGN.md` for the
architecture. Every section below only ever renders data Highpoint's partner agreement permits — no
policy/premium/claims detail, no other partner's activity, no unmatched organizations, no
individual-level information.

### In-page section navigation

The top nav links to Overview, Matched Organizations, Inbound Leads, Financial Trends, and
Performance; the sidebar links to Dashboard (`#main-content`) and — in a new tab — Partner
Integration (see below). "Resources" was removed from the top nav along with the Partner Resources
card it pointed to.

Clicking a top-nav or sidebar link scrolls (smoothly, via `html { scroll-behavior: smooth; }` in
`dashboard.css`, and `prefers-reduced-motion` respected automatically through base.css's existing
global override) to that section with its own `.panel-card__heading` landing just below the sticky
topbar, instead of the browser's default anchor jump, which puts the target flush with the viewport
top and hides it entirely behind the topbar. `js/dashboard-partner.js`'s `scrollToSection()`
intercepts every `a[href^="#"]` click, reads the topbar's *actual* current height (not a guessed
constant — same function works at every breakpoint without a media query), and scrolls to
`target top − topbar height − 16px`. It also re-applies on direct/bookmarked hash loads
(`DOMContentLoaded` and `load`) for the same reason, though that entry point is a best-effort
secondary fix, not the primary click interaction — an unusually late layout shift after `load`
(e.g. a slow font swap) could still occasionally let the browser's native jump win that race.

### Reused as-is

`.profile-summary` (partner identity header — the partner's name stands in for the org name
`/universal-profile` uses it for; `.profile-summary__stats` now also carries Partner Since/Renewal
Date, the same `.stat-block`s `/universal-profile` uses for Net Worth/Premium), `.quick-stats`/
`.stat-card` (Partnership Performance, Match Quality, Inbound stat rows — the Inbound row uses the
`.quick-stats--relaxed` gap modifier documented with `.funnel` below, since "Matched to Existing
Organizations" is long enough to wrap and needs more breathing room than the shorter labels
elsewhere), `.feed` (Recent Activity), `.rec-owner__avatar` (agent initials in
`.record-row__agent`), and `.empty-state`'s dashed-border pattern are all otherwise unmodified —
reused directly rather than re-styled, per "build on primitives, not one-offs."

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
something to flag as a problem. Used under "Matched Organizations" (immediately followed by a
`.shep-note` — see below — surfacing *why* the matching system is prioritizing what it's showing,
so the governance boundary and the reasoning behind what's inside it sit next to each other) and
again (in a slightly different sentence) under "Inbound from Highpoint."

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
<div class="record-row" data-org="grace-fellowship" data-stage="recommended">
  <div class="record-row__identity">
    <p class="record-row__name">Grace Fellowship</p>
    <p class="record-row__meta">Large ministry · Midwest</p>
  </div>
  <span class="badge-pill badge-pill--neutral">Recommended</span>
  <div class="record-row__agent"><span class="rec-owner__avatar">AL</span> <span class="record-row__agent-name">Alan</span></div>
  <span class="badge-pill badge-pill--success">High match</span>
  <button class="btn btn--secondary btn--sm record-row__action" type="button" data-org-detail="grace-fellowship">View</button>
</div>
```

One shared row shape for both "Matched Organizations" (5 columns: identity, funnel-stage badge,
agent, match-quality badge, a "View" action) and "Inbound from Highpoint" (`.record-row--lead`, a
4-column variant — identity, consent badge, resolution badge, a relationship tag — since inbound
leads don't have an agent or match score yet). Badge color mapping is deliberate, not arbitrary:
`--neutral` for Matched/Recommended (early, no signal yet), `--info` (new — see below) for
Introduced/Session booked/Engaged (in progress, not yet a confirmed outcome), `--success` reserved
for Converted only, matching `DESIGN.md`'s "success = confirmations/completed states" rule rather
than using it for every positive-sounding stage. Match quality reuses the same success/neutral
pairing (High/Medium). An org's incompleteness — no premium, no risk detail, sometimes no agent yet
("Pending assignment", `.rec-owner__avatar` showing "?") — is intentional per the design brief, not
a missing-data bug.

The `.record-row--lead` relationship tag (`.badge-pill--neutral`: "Highpoint owned" / "Organic
overlap" / "Referral from Brotherhood", one per inbound lead) is deliberately neutral-colored rather
than success/warning — it's a descriptive attribute of how the lead relates to the ecosystem, not a
status, so it follows the same "don't borrow a semantic color for a plain tag" rule
`badge-pill--neutral` already exists for.

Collapses to a single stacked column below `1024px`, same responsive strategy as `.rec-row`.
`.record-row` no longer carries a `data-stalled` attribute or `.record-row__stalled-flag` child — an
earlier revision removed the "stalled" concept from this page entirely (see the "second partner"
note in `DESIGN.md`), so don't reintroduce either without checking that note first.

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
facts (Highpoint opportunity / match quality / agent), a "Why this organization was matched" callout
(`.org-detail__why`), and a 6-step `.org-detail__timeline` (Matched → Recommended to agent → Agent
engaged → Introduction made → Session booked → Conversion) with the first `doneSteps` marked
`.is-done`. **The "why matched" copy is a hard product-governance rule, not just tone**: every
reason is organizational context Brotherhood is permitted to use (building/roof age, storm exposure,
facilities investment, region) — never an inference about a named individual's health, mental
health, or private circumstances. Don't add a "why" string to `ORG_DETAILS` that violates this. (An
earlier revision, when this partner was a coaching company rather than a roofer, used
leadership-transition/staff-growth signals instead — the governance rule is what's load-bearing
here, not those particular signals; rewrite the reasoning to fit whatever the partner actually does,
same as this page already did once.) There is no more `stalledDays` field or stalled-note
paragraph — removed along with the rest of the "stalled" concept.

### Reciprocal flow schematic — `.flow-diagram`

```html
<div class="flow-diagram" role="img" aria-label="…">
  <span class="flow-diagram__unit">
    <span class="flow-diagram__step"><svg>…</svg> Highpoint site</span>
    <svg class="flow-diagram__arrow">…</svg>
  </span>
  <!-- …Consent → Brotherhood match → Existing / net-new (each its own __unit)… -->
  <span class="flow-diagram__step"><svg>…</svg> Agent routing</span>
</div>
```

Under "Inbound from Highpoint" — a static chain of pill-shaped steps, visually distinct from the
interactive, count-driven `.funnel` above it (no numbers, not clickable) so the outbound
(Brotherhood → Highpoint) and inbound (Highpoint → Brotherhood) halves of the loop read as two
different mechanisms, per the design brief. `role="img"` + a descriptive `aria-label` on the
container, same pattern as `.bar-chart__plot`, since the steps carry no other accessible grouping
text.

Each step (except the last, which has no trailing arrow) is wrapped with its arrow in a
`.flow-diagram__unit` — a `flex-wrap` container without this would let a step end one wrapped line
while its arrow started the next, reading as a stray disconnected glyph rather than a connector.
`row-gap` is larger than `column-gap` for the same reason: a wrapped second line needs more
separation from the line above it than two chips need from each other on the same line.

### Digest list — `.digest-list`

A plain icon+text bullet list for "Latest Partner Digest" — deliberately not an activity feed
(reuses `.feed` for that, in "Recent Activity" instead). Kept intentionally small/quiet: the design
brief frames the email digest as the primary interface and this dashboard as the secondary
drill-down, so this section should read as a summary, not compete with the funnel/matched-orgs
sections above it for attention.

### Financial Trends — `.chart-stat-grid` + segmented period filter

Reuses `/universal-profile`'s chart+stat-highlight layout verbatim (`.chart-stat-grid`, `.bar-chart`,
`.stat-highlight`) rather than a new chart component — same "deliberately simple, illustrative CSS
bar chart, not a BI library" rationale applies here. Two new bar/legend color modifiers,
`--revenue`/`--bonus`, are aliases for the exact same `brand-500`/`success-500` recipe as
`--premium`/`--savings` (kept as separate classes so the markup reads correctly for this chart's
actual series, rather than reusing premium/savings out of context).

The chart is data-driven, not static markup: `js/dashboard-partner.js`'s `renderFinancialTrends()`
rebuilds `#financial-chart-plot`/`#financial-chart-axis`/the two stat-highlight totals from a
`FINANCIAL_PERIODS` map keyed by period (`daily`/`weekly`/`monthly`/`quarterly`/`yearly`), each with
its own label/revenue/bonus arrays at a bucket count sized for readability (7 days, 6 weeks, 6
months, 3 months, 4 quarters) rather than one fixed window stretched thin or compressed. Quarterly
is the default per the design brief ("current quarter, 3 months"); its monthly figures intentionally
sum to match Yearly's most recent quarter, so the two views don't silently disagree.

### Segmented control — `.segmented-control`

```html
<div class="segmented-control" role="group" aria-label="Financial trend period">
  <button class="segmented-control__option is-active" type="button" data-period="quarterly" aria-pressed="true">Quarterly</button>
  <!-- …Daily/Weekly/Monthly/Yearly siblings… -->
</div>
```

A new primitive — a real, recurring need (a period filter) rather than a one-off. `min-width: 0` on
both `.segmented-control` and its `.panel-card__actions` parent, plus `overflow-x: auto` on the
control itself, matter more than they look: without them, 5 non-wrapping button labels forced the
whole `.panel-card__header` wider than the viewport on narrow screens instead of scrolling
internally within the control (the same contained-overflow pattern `.app-nav` and `.bar-chart`
already use elsewhere on this page). `min-height: 36px` per option matches the `.btn--sm` precedent
already used throughout this page for compact secondary actions.

### Digest list — `.digest-list`

A plain icon+text bullet list for "Latest Partner Digest" — deliberately not an activity feed
(reuses `.feed` for that, in "Recent Activity" instead). Kept intentionally small/quiet: the design
brief frames the email digest as the primary interface and this dashboard as the secondary
drill-down, so this section should read as a summary, not compete with the funnel/matched-orgs
sections above it for attention.

### Partner Integration page — `/partner-integration/`

A seventh page, reached from a new sidebar link (`target="_blank"`, with a small external-link icon
and visually-hidden "(opens in a new tab)" text so the new-tab behavior is announced before the
click, not just after). Deliberately **not** another `.app-shell` dashboard view — no
topbar/sidebar — since its one job is a focused, copy-and-go reference, not a workspace: just a
`.integration-page` container (max-width 720px, centered) with two `.panel-card`s.

`.code-block` (dark `--color-neutral-900` body, `--color-neutral-800` toolbar, `--font-family-mono`)
holds an API request snippet and a sample JSON response, each with a `.code-block__copy` button.
`js/partner-integration.js` copies the `<code>` element's text via the Clipboard API, swaps the
button's label to "Copied" plus a `.is-copied` border/color change (text label changes too, not just
color, per the accessibility rule that color is never the only signal) for 2 seconds, and falls back
to a "Press Ctrl+C to copy" label if `navigator.clipboard` throws (denied permission, insecure
context, unsupported browser) rather than failing silently. The snippet's line length exceeds its
container at most widths on purpose — `.code-block__pre`'s `overflow-x: auto` scrolls it internally
rather than wrapping code mid-token, the same contained-overflow approach as `.bar-chart`.

### Shep contextual note — `.shep-note`

```html
<div class="shep-note">
  <span class="shep-note__avatar"><svg>…</svg></span>
  <p class="shep-note__text"><strong>Shep:</strong> 3 organizations changed stage since your last digest.</p>
</div>
```

One-line, non-modal Shep callouts (under the partner header, again under the Matched Organizations
governance note, and again under Match Quality). Three on the whole page, by design: the brief is
explicit that Shep should stay a small, contextual presence here, not the center of the dashboard the way the
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

## OneHope CRM Dashboard — `/ExploreGod-CRM-Dashboard`

An eighth page, and the first that isn't Brotherhood Mutual-branded — see DESIGN.md's "Eighth
page" note for why its palette lives entirely in a new `design-system/explore-god-dashboard.css`
under a `.egd` root class instead of the shared brand tokens. Layout: a fixed 84px icon rail
(`.egd-rail`, a light surface with a hairline border — an earlier revision used a dark navy rail,
which read as too bold next to the rest of the page) + a scrollable main column (`.egd-topbar`
sticky header, then `.egd-scroll`), not the `.app-shell`/`.app-sidebar` pattern the Brotherhood
Mutual dashboards use — deliberately different chrome for a page that isn't part of that product
family. All content below the KPI row is data-driven, rendered by `js/explore-god-dashboard.js`
from small in-file arrays (there is no backend) rather than hand-written per-row markup, since
every panel needed either filtering (the queue) or a count large enough (20 reps) that hardcoding
each row would drift from its data.

The rail logotype (`.egd-rail__mark`, "OH") and the AI panel's badge (`.egd-ai-badge`) are bare
type/icon on the surface — no gradient rounded box behind either, so they read as part of the
surface rather than a separate chip. Every native `<button>` on the page (assign
menu options, the AI card CTA, the header avatars) sets its own `background`/`border` explicitly;
leaving either unset falls back to the browser's default beveled, grey button chrome, which is what
made the assign menu and CTAs look broken before this was fixed.

### Stage color system

Four pipeline stages — New Contact, Active Conversation, Christian Formation, Discipleship
Journey — share one fixed color per stage across every surface that shows them (KPI sparkline,
funnel bar, roster caseload-mix bar). `js/explore-god-dashboard.js`'s `stageVar()` is the single
place that maps a stage id to its CSS custom property (`var(--egd-stage-new)`, etc.) so a color is
never hardcoded as a hex string in JS — components read the color, they don't own it. See
DESIGN.md for the validated ordering rationale and the separate "-text" variants used wherever a
stage/status hue sits on real text instead of a fill.

### KPI stat tiles — `.egd-stat`

```html
<article class="egd-stat">
  <div class="egd-stat__head">
    <span class="egd-stat__label">New requests today</span>
    <span class="egd-stat__delta egd-stat__delta--up">↗ 18%</span>
  </div>
  <p class="egd-stat__value">24</p>
  <svg class="egd-sparkline" data-stage="new" data-points="4,6,5,9,…" viewBox="0 0 220 46"></svg>
</article>
```

`renderSparkline()` turns the `data-points` list into a line + a ~28%-opacity area wash (dataviz
skill's area-fill spec) plus an end-dot, entirely in the stage's own color via `style="stroke: var(--egd-stage-…)"` —
never a duplicated hex. Each sparkline also gets a hover layer: a single shared tooltip positioned
at the nearest sample to the pointer, per the skill's "line charts ship a hover layer by default"
rule.

### Live Intake Queue — `.egd-queue`

Tabs (`.egd-tab[role="tab"]`, All/Unassigned/Waiting &gt;10m/Mine) drive `renderQueue(filter)`,
which re-renders `#queue-list` from the same `QUEUE_ROWS` array rather than hiding/showing
pre-rendered rows — simplest correct option at six rows. Each row's wait chip
(`.egd-wait--good|warning|critical`) is colored by `waitLevel()` (&lt;5m / 5–10m / &gt;=10m), always
paired with the "waiting Nm" text and a clock icon — color is never the only signal. `.egd-assign`
is a lightweight popover (not a native `<select>`, since one option needs the "AI pick" tag) built
and torn down on click; picking a name sets `row.assignedTo` and re-renders, which is also what
keeps the panel's "N unassigned" eyebrow count live. The menu is appended to `<body>` and
positioned with `position: fixed` from the trigger's bounding rect rather than living inside
`.egd-assign` — the queue panel needs `overflow: hidden` to keep its own rounded corners, which
clipped the menu before it was moved out to a body-level portal; it closes on outside click and on
scroll, since a fixed-position menu doesn't track its trigger as the page scrolls.

### Regional Journey Funnel — `.egd-funnel`

```js
const FUNNEL_STAGES = [
  { stageId: "new", label: "New Contact", count: 312 },
  // …
];
```

Bar **width** encodes volume relative to the top stage (`count / max`, the standard funnel taper);
the **badge inside each bar** shows the conversion rate relative to the *immediately previous*
stage — two different percentages by design, so don't conflate them when editing the data. Bars
render at `width: 0` and grow to their target width one animation frame after paint
(`requestAnimationFrame` x2, staggered per row) — a one-time reveal, not a loading skeleton, so it
isn't gated behind any loading state.

### AI Opportunities — `.egd-ai-panel`

A light surface like every other panel, not a dark glass card (an earlier revision used one and it
read as too bold/heavy) — the one visual tell that it's a distinct "assistant" surface is a single
whisper-soft teal wash in one corner (`--egd-ai-soft`) and the sparkle badge icon, not a dedicated
dark treatment. Each `.egd-ai-card__cta` swaps to a
checked "is-done" state (`Applied`/`Notified`/`Reassigned`/`Viewed`) on click rather than
navigating anywhere — this page has no backend to apply a recommendation against, so the click
gives honest local feedback instead of a fake success toast that implies a server round-trip that
didn't happen.

### Team Roster — `.egd-roster`

20 reps rendered from `ROSTER` into a fixed-height (`max-height: 480px`) internally-scrolling list
rather than letting the page grow to fit all of them — keeps every panel in the two-column grid
roughly the same height. Each row's `.egd-mix` is a 4-segment composition bar (2px gaps, per the
dataviz skill's "surface gap separates touching marks" spec) showing that rep's caseload split
across the four stages; the split is decorative sample data, generated deterministically from a
hash of the rep's name (`caseloadMix()`) so it's stable across reloads instead of reshuffling. The
stage legend at the bottom of the panel is the one place identity is spelled out in text for the
whole list, rather than repeating a label on every row.

## Global Engagement Command Center — `/ExploreGod-Global`

Replaces the earlier "Global Overview" cross-region rollup outright — see DESIGN.md's "Ninth page,
replaced" note for why this is a different product for a different role (Bronwyn, a global
engagement intelligence lead), not a bigger/filtered copy of either sibling dashboard. Reached from
the shared rail's globe icon, now labeled "Global Engagement Command Center" on all three pages. It
loads `design-system/explore-god-dashboard.css` unchanged for the shell and every shared component
(`.egd-panel`, `.egd-stat`, `.egd-tabs`/`.egd-tab`, `.egd-avatar`, `.egd-ai-panel`), and
`design-system/explore-god-global.css` for everything unique to this lens. `js/explore-god-global.js`
follows the same one-file-per-page convention as the other two pages' JS — small helpers
(`escapeHtml`, `hashString`, `initials`, `renderSparkline`, `CTA_ARROW`) are duplicated rather than
imported, and the CSS file duplicates `.egd-btn-cta` and the `.egd-attn-row*` disclosure shell from
`explore-god-dashboard-2.css` for the same reason — this page never loads a sibling page's
stylesheet, only the shared base plus its own file.

The page follows the product brief's own hierarchy top to bottom: page-head controls (date range,
scope, **Generate Global Briefing**) → **Needs Attention** → a **Global Engagement Health** AI
summary → the 7-metric Global Health KPI row → a two-column area (**Regional Health**, **Campaign
Intelligence**, **Conversation Quality**, **Outcome Integrity**, **Discipleship Intelligence** in the
main column; **AI Insights & Coaching**, **Recent Investigations**, **Reports** in the sidebar) →
**Ask Engagement Intelligence** full-width at the bottom. An in-page `.egd-section-nav` under the
greeting anchors to each of these (same topbar-offset scroll technique `js/dashboard-partner.js` and
`js/explore-god-dashboard-2.js` established, reimplemented as this page's own `scrollToSection()`).
The brief's fuller navigation list (Conversations/Resources/Admin as top-level destinations) is
intentionally not built as separate sections here — this is a single-page prototype like its
siblings, and those three don't correspond to any content this page actually has (conversation
investigation lives inside Needs Attention/Quality/Outcome Integrity instead, and there's no
permissions or training-content data to back a real Admin/Resources section) — a deliberate scope
cut, not an oversight. The date-range and scope `<select>`s in the page-head controls are decorative
for the same reason every `.egd` page's topbar search/notification buttons already are — re-deriving
every panel's data per filter combination is out of scope for a static prototype with no real data
source behind it.

Regions are real, named regions this time (Africa, India, Indonesia, Philippines — matching the
brief's own example table) rather than the old page's `#Region 1`–`8` placeholders, since the brief
gives explicit data for them.

### Needs Attention — single-finding insight cards

Reuses `/ExploreGod-CRM-Dashboard-2`'s `.egd-attn-row`/`.egd-attn-row__summary`/`__dot`/`__body`/
`__title`/`__desc`/`__toggle` disclosure shell verbatim (duplicated into this page's CSS — see
above), but the expanded *content* is new: one AI-reasoned finding per tier (a `.egd-insight-why`
bullet list, a row of `.egd-insight-stat` comparison chips, one `.egd-btn-cta`) instead of a list of
individual people — at the global level, each severity tier in `ATTENTION_ITEMS` **is** one finding,
not a queue of many rows. The three tiers match the brief's own examples: Africa's quality decline
(critical, expanded by default), the "Hope for Families" campaign investigation (warning), and the
outcome-integrity data-quality flag (caution). Each finding's CTA does one of three things via a
single dispatcher, `handleActionButton()` (reused by every other panel's CTAs too, rather than each
panel wiring its own copy of the same three behaviors): open the Conversation Review Workspace
(`data-open-conversation`), scroll to another section (`data-scroll-to`), or expand a specific
campaign row before scrolling to it (`data-expand-campaign` — Hope for Families' "Investigate
campaign" button sets both, so clicking it lands on the campaign already expanded).

### Global Engagement Health — `.egd-global-summary` + `.egd-global-kpis`

The AI-generated global summary (`.egd-global-summary`, reusing `.egd-ai-panel`'s corner-wash
treatment) sits directly above the KPI row per the brief's own layout, not folded into the sidebar
AI panel — this is a page-level headline, not one more insight card. Its findings render as a
wrapping row of cards (`.egd-global-summary__list`), not a plain vertical bullet list: at this
panel's full page width (unlike the narrower sidebar `.egd-ai-panel` the visual language borrows
from), a single-column list left most of the card empty.

The 7-metric KPI row (`.egd-global-kpis`, reusing `.egd-stat` verbatim) is where an up-trending
number isn't always good news — Unanswered conversations rose 18%, which is bad, unlike every other
metric's rise. `.egd-stat__delta--up`/`--down` couple arrow direction and color together (up=good,
down=critical) everywhere else in the product; this page's `GLOBAL_KPIS` data carries a `sentiment`
field independent of `direction` so the render step can pick `.egd-stat__delta--up-critical` (a new
modifier added to the *shared* `explore-god-dashboard.css`, since any future page could hit the same
"up isn't good" case) for the one metric where they disagree, while Response Rate's decline just
uses the existing `--down` as-is (down and bad already agree there).

### Regional Health matrix — `.egd-rmatrix-*`

```js
const REGIONS = [
  { id: "africa", name: "Africa", volume: 8420, response: 79, quality: 76, engagement: 21,
    tier: "critical", countries: [ /* South Africa · English, Nigeria · English, Kenya · … */ ] },
  // …
];
```

A matrix, not a leaderboard, per the brief's explicit caution against making "best region" the
primary interaction: region / volume / response / quality / engagement / a colored `.egd-attn-dot`
(good/warning/critical) in one row, expandable per region. Expanding reveals the brief's
Global→Region→Country/Language drill-down (`.egd-country-row`s: country, language, conversation
count, count requiring review, the driving campaign, and a "View flagged conversation" button) —
without ever leaving the dashboard or exporting a spreadsheet, per the brief's stated goal. Reuses
the exact disclosure/`[hidden]`-specificity-fix pattern every other expandable list on these three
pages already established (flagged again in the CSS since it's an easy bug to reintroduce). "Export
all regions" builds a real CSV client-side (same `toCSV()`/`downloadCSV()` technique the old Global
Overview page used) rather than a fake success state.

### Campaign Intelligence — `.egd-campaign-row`

```js
{ id: "hope-for-families", name: "Hope for Families", leads: 1482, engagement: 22, quality: 84,
  traffic: [{ source: "Facebook", count: 582 }, /* … */],
  topics: [{ name: "Parenting", seekers: 392, quality: 74, flagged: true }, /* … */] }
```

Directly answers the brief's stated gap — "her current system can't distinguish Campaign A/B/C when
they all point to the same landing page" — by giving each campaign its own traffic-source breakdown
(`.egd-traffic-item` bars) and per-topic quality (`.egd-topic-row`, each topic's own `flagged`
field switching its quality bar to a warning fill and adding `⚠️` next to the number, rather than a
computed threshold) when expanded, using the exact Hope for Families numbers from the brief's own
worked example (Family 91% vs. Parenting 74%) so the page's data agrees with the brief that inspired
it.

### Conversation Quality Center — `.egd-quality`

A single global quality score (87/100) breaks down into six buckets (`QUALITY_BREAKDOWN`: Active &
engaging → Unmarked) as a segmented `.egd-quality-bar` (2px gaps between segments, same "surface gap
separates touching marks" spec `.egd-mix`/`.egd-roster` already use elsewhere in this product) with
a legend below, followed by a "Why quality changed" callout naming the specific contributors (Africa
−7%, India −5%, Parenting campaign −9%) and an `Investigate` CTA that scrolls back to Needs
Attention — the quality score and the Needs Attention finding are the same underlying fact seen from
two altitudes, so the panel points back to where the actual investigation happens rather than
duplicating it.

### Outcome Integrity — `.egd-outcome-row`

The brief's "Accepted Christ vs. Faith conversation" audit, turned into a reviewable queue rather
than something Bronwyn hunts for manually: each row shows the recorded outcome, an arrow, the AI's
assessed outcome, a confidence badge, a "View conversation" link into the Review Workspace, and
**Confirm**/**Keep classification** actions. Resolving a row (either button) replaces the action
pair with a plain resolved state — local-only feedback, the same honest "no backend to actually
apply this" pattern the AI cards' `is-done` state already uses elsewhere in this product, not a fake
network round-trip.

### Discipleship Intelligence — `.egd-disc-region` / `.egd-disc-focus`

Per-region notes (Africa/India/Philippines, using the brief's own wording almost verbatim) plus one
`.egd-disc-focus` recommended-coaching card for Africa (open-ended questioning, sustained relational
engagement, an invitation-based close, responding to seekers who identify as Christian but show
uncertainty) — a single card rather than one per region, since the brief only worked through Africa's
recommendation in detail; adding invented coaching text for India/Philippines wasn't asked for.

### AI Insights & Coaching, Recent Investigations, Reports (sidebar)

`.egd-ai-panel`/`.egd-ai-list`/`.egd-ai-card` reused verbatim from the sibling pages (down to the
local `is-done` click feedback), repurposed for this page's Coaching Insights content (the "OM
provides information → seeker closes" taper-off pattern, discipleship opportunities, the two
low-engagement campaigns, the outcome-mismatch nudge) — several cards also carry a `scrollTarget` so
"View evidence"/"Review classifications" actually lands on the section being referenced, not just a
local checkmark. **Recent Investigations** (`.egd-investigation-row`) is a plain status list, not
interactive — a log of what's already in motion, matching the brief's "Recent Investigations"
sidebar entry. **Reports** (`.egd-report-row`, `.egd-tabs` for Weekly/Monthly/Custom) exports a real,
data-driven CSV of the page's current Global Health + Regional Health figures per report row (not a
static canned file) — "Build report" and "Ask AI to summarize" give honest local feedback instead
(the former queues with a status message, the latter jumps to and runs a canned Ask Engagement
Intelligence query), since neither has a backend to actually act on.

### Ask Engagement Intelligence — `.egd-ask`

A natural-language input plus five example-question chips lifted directly from the brief
(`ASK_ANSWERS`, keyed by the exact question text). Every answer — canned, not a real model call, this
is a static site — follows the brief's required shape: Summary → Evidence → Metrics → Conversations
→ Recommended action, never a bare chatbot reply. Typing anything else falls back to one honest,
scoped message (`FALLBACK_ANSWER`) rather than an improvised answer — the same principle Shep's
free-text fallback already established on the marketing site (see the Shep section above): admit
the limits of a prototype instead of faking a capability that isn't there.

### Conversation Review Workspace — `.egd-review` (native `<dialog>`)

A single reusable dialog (`openReviewDialog(conversationId)`), populated from a small `CONVERSATIONS`
map — same governing pattern as `/dashboard-partner`'s `.org-detail` (native `<dialog>` +
`showModal()` for a free focus trap/Esc/`::backdrop`, reimplemented under `.egd` tokens rather than
shared across design systems, since the two pages share no stylesheet). Left column: seeker id, OM,
timeline, previous interactions. Right column: the brief's AI Quality Assessment fields (Listening/
Empathy/Follow-through/Discipleship/Conflict handling/Outcome classification, each ✓/⚠️/🔴), an AI
explanation callout, suggested coaching, the recorded vs. AI-assessed outcome, and a **Flag for
review** button (local `is-done` feedback, same reasoning as Outcome Integrity's Confirm/Keep). Three
representative conversations (`18392` Africa quality, `24601` an outcome mismatch, `31170` the
Parenting-campaign quality flag) are reused across every "View conversation"/"Review conversations"
entry point on the page (Needs Attention, the Regional Health drill-down, Outcome Integrity) rather
than one conversation per entry point — the same "a handful of representative rows, not one per
button" precedent the rest of this product already follows.

### Global Briefing dialog — `.egd-briefing`

"Generate Global Briefing" (page-head, always visible) opens a second dialog with the brief's own
worked example verbatim — seeker/conversation totals, the three flagged areas, a recommended action
— something Bronwyn could genuinely take into a leadership meeting per the brief's framing. "View
evidence" closes the dialog and scrolls to Needs Attention rather than just closing it inertly.

### Two shared-file fixes this page's layout surfaced

Documented in full in DESIGN.md's "Ninth page, replaced" note (both are general fixes in
`explore-god-dashboard.css`, not page-specific overrides): `.egd-shell`'s grid template was a bare
`1fr` (base rule and its `≤640px` override) instead of `minmax(0, 1fr)`, which let the Regional
Health matrix's `min-width: 560px` table force the whole page body to scroll horizontally at narrow
widths — the first panel on any of these three pages to put such wide, internally-scrolling content
inside `.egd-main`. `.egd-panel` also picked up an explicit `min-width: 0` for the same reason. And
the rail's `≤640px` "icons become a horizontal row" treatment never wrapped, which was invisible
until the rail grew to 8 links across the three sibling pages — `.egd-rail__nav` now wraps.

## Engagement Command Center — `/ExploreGod-CRM-Dashboard-2`

A tenth page: a second, triage-first lens on the same OneHope CRM, built for a program coordinator
overseeing a roster of missionaries rather than the regional coordinator's assignment queue on
`/ExploreGod-CRM-Dashboard` — see DESIGN.md's "Tenth page" note for the role distinction and why it
ships as a sibling page. It loads `explore-god-dashboard.css` unchanged for the shell and every
shared component, and `design-system/explore-god-dashboard-2.css` for the components unique to this
lens. `js/explore-god-dashboard-2.js` renders every panel from small in-file arrays, following the
same convention as the other two pages' JS files.

### Shared CTA button — `.egd-btn-cta`

```html
<button class="egd-attn-item__action egd-btn-cta" type="button">
  View conversation
  <svg>…</svg> <!-- CTA_ARROW -->
</button>
```

The one treatment every real action button on this page shares: a solid `--egd-accent` fill, white
text, and a trailing arrow — modeled on Ready for Handoff's "Begin handoff" button. It exists because
several buttons (Needs Attention's row actions, Team Health's "Check in with…") were originally
styled as softly-tinted pills, the same visual weight as the status/tag chip sitting right next to
them (`.egd-attn-item__chip`'s time-ago chip, `.egd-load`'s workload chip) — a reader couldn't tell
which one was clickable. Every component-specific class that used to carry its own button styling
(`.egd-attn-item__action`, `.egd-team-row__checkin`, `.egd-followup-row__action`,
`.egd-handoff-card__cta`) now carries none of its own — `.egd-btn-cta` does the actual styling, and
the specific class is kept only as a bare hook where a responsive rule needs to target that one
button by context. `js/explore-god-dashboard-2.js`'s `CTA_ARROW` constant is the one copy of the
arrow glyph every button interpolates, so it can't quietly drift into slightly different icons across
call sites. `.egd-btn-cta--muted` is the one deliberate variant — the Follow-Up Queue's "Schedule"
action is a real button too, just a lower-urgency one than "Message now," so it keeps the same shape
and arrow but drops to a neutral fill. Quick Actions (`.egd-quick-action`) and the AI Copilot's
`.egd-ai-card__cta` intentionally don't use this class — neither sits beside a status chip it could be
mistaken for, so the ambiguity this class solves doesn't apply to them, and forcing five stacked
Quick Actions to a solid-blue fill would just compete with this page's actual CTAs for visual weight.

### Needs Attention — `.egd-attention`

```js
const ATTENTION_ITEMS = [
  { id: "heavy", tier: "critical", title: "Heavy conversations", count: 3, items: [...] },
  // …
];
```

Three severity tiers (critical/warning/caution — see DESIGN.md for why a third tier, `--egd-caution`,
was added rather than reusing warning for both "overdue" and "gone quiet"). Each row is a disclosure
button (`aria-expanded`/`aria-controls`, not a tab — there's no shared single-open-at-a-time
constraint) that expands to the actual flagged seekers, not just the count, so the panel is an
operational worklist rather than a metrics tile. The heaviest tier renders expanded by default — the
thing most worth a coordinator's attention shouldn't require a click to see. `tier.count` (the true
total) and `tier.items` (a handful of representative rows) are deliberately separate fields; where
`count` exceeds `items.length` the detail panel says "+N more — view all" rather than silently
implying the shown rows are the whole list. Reuses the same `[hidden]`-specificity fix
`.egd-region-row__detail` documents on `/ExploreGod-Global` — flagged again in this file's own
comments since it's an easy bug to reintroduce wherever this expand/collapse pattern gets copied
next.

### Ministry Today — `.egd-ministry` / `.egd-stat--ministry`

Five stat tiles reusing `.egd-stat`'s full KPI-card anatomy verbatim — `.egd-stat__head` (label +
colored `.egd-stat__delta` badge), the big value, then a gradient-filled `.egd-sparkline` — the same
premium treatment `/ExploreGod-CRM-Dashboard`'s own KPI row uses, not a simplified variant of it. The
flag naming the sub-metric that needs attention (`12 need follow-up`, `Emotionally heavy or
escalated`) sits below the sparkline rather than replacing it, so the row carries both a trend at a
glance and which sub-metric still needs a look — as a colored dot + plain-weight text now, not the
filled pill it launched with, since it's a pure status (never a click target) and the solid capsule
read as loud and button-like next to the rest of the card; see this page's "Shared CTA button" entry
above for the button-vs-tag distinction this is the other half of. `sparklineColorVar()` extends the shared
`renderSparkline()` (duplicated into this page's JS per the one-file-per-page convention) to resolve
either a pipeline-stage color or a bare `--egd-good`/`--egd-critical` token — two of these five cards
(Missionaries Online, High-priority Conversations) aren't pipeline stages, so forcing them through
the four-stage palette would have been the wrong fit. Wiring up real delta badges here (the first
place this component carries longer label text than the original page's uniformly short "18%"/"6%")
surfaced a genuine flex-shrink bug in the shared `.egd-stat__delta svg` rule — see DESIGN.md's
"Ministry Today premium pass" note for the fix, made at the shared-component level since it's a
latent issue for any future badge, not specific to this page.

### Seeker Journey — `.egd-journey`

```js
const JOURNEY = [
  { stageId: "new", count: 18, seekers: [{ id: "#512", days: "1 day", last: "Today", next: "…" }] },
  // …
];
```

Four stage tiles in a row (a stepper, not a descending funnel bar — this page's stage counts aren't
monotonically decreasing, so a funnel taper would misrepresent the data) connected by a chevron
pseudo-element between tiles. Clicking a tile is an accordion, not four independent toggles — only
one stage's seekers show at a time in the shared `#journey-detail` region below the tiles, keyed by
`activeJourneyStage` — this is "click into each stage" from the product brief, not a data dump of
every seeker in every stage at once. Handoff opens by default (the smallest, most actionable stage).
Each seeker card shows Last interaction and Next step exactly as the brief specifies, not just a
count — the same "operational tool, not analytics" principle as Needs Attention.

### Team Health — `.egd-team`

```js
const TEAM = [
  { name: "Daniel Kurniawan", online: false, seekers: 9, load: "heavy",
    note: 'Requested support — "Had several difficult conversations this week."',
    checkin: "Check in with Daniel" },
  // …
];
```

Workload is a `.egd-load` chip (Light/Moderate/Heavy, colored good/warning/critical) paired with
seeker/active-chat counts — never a single blended "score." Missionary health is a plain-text `note`
field (a quoted, human reason — "requested support," "one-on-one due") rendered only for rows that
have one, next to a `.egd-team-row__checkin` button, rather than any numeric wellness metric — this
is a direct response to the brief's own warning against turning spiritual/emotional health into "a
creepy score" (its literal example: don't build "Maria Spiritual Health: 72%"). A row with nothing to
flag shows neither the note nor the button.

### Follow-Up Queue — `.egd-followup`

Same tabbed-filter interaction as the Live Intake Queue on `/ExploreGod-CRM-Dashboard` (`.egd-tabs`/
`.egd-tab` driving a `renderFollowups(filter)` re-render from one `FOLLOWUPS` array) — reused
verbatim rather than a new filter component, since it's the same interaction: filter a list of rows
by a computed property. Urgency reuses `.egd-wait--good/warning/critical` (the exact chip the intake
queue's wait time already uses) since "follow up today / overdue / unscheduled" is the same category
of threshold-against-time signal, just a different threshold than intake wait time.

### AI Copilot — `.egd-ai-panel`

The same AI panel component as the other two pages (`.egd-ai-panel`/`.egd-ai-list`/`.egd-ai-card`,
down to the "is-done" local-feedback click behavior), repurposed in copy for this page's two AI
features from the product brief: a Conversation Brief ("what's happening, how long, what's already
been asked, prefers Bahasa Indonesia") and stuck-conversation help for a missionary who flagged a
conversation as too difficult. Every card's copy is framed as *assistance offered to* a missionary
(“Help Daniel”, “Suggest messages”), never as the AI acting or replying on anyone's behalf — the
brief's explicit "AI copilot, not AI missionary" distinction.

### Ready for Handoff — `.egd-handoff`

```js
const HANDOFFS = [
  { id: "#384", checklist: [{ label: "Trust established", done: true }, /* … */,
      { label: "Handoff completed", done: false }], cta: "Begin handoff" },
];
```

Each card is the exact checklist the product brief specifies (Trust established → Seeker interested
→ Safety reviewed → Appropriate timing → Local church identified → Handoff initiated → Handoff
completed) as a plain done/pending list — a controlled, auditable sequence, not a single "ready"
toggle. The panel's standing footer note (a seeker never sees a missionary's personal contact
details; handoffs route through the program admin) is this page's one safety-system touchpoint from
the brief's larger safety-controls feature — deliberately a single, always-visible sentence here
rather than a separate safety dashboard, since nothing else on this page exchanges contact
information.

### Stories & Testimonies — `.egd-testimony`

A compact count-plus-pipeline card (`Potential → Reviewed → Approved → Shared`, matching the four
statuses in the product brief) standing in for the Google Doc workaround the brief describes — kept
deliberately small (a sidebar card, not a full panel) since the brief itself frames this as a
secondary, real-but-smaller feature next to triage/workload/journey/follow-up.

### Quick Actions — `.egd-quick`

Five buttons matching the product brief's list (Find a seeker / Review conversations / Check on a
missionary / Review handoffs / Add a testimony), each a real in-page anchor to the relevant panel's
heading rather than an inert button — reuses the exact "land the target heading just below the
sticky topbar" offset technique `js/dashboard-partner.js` established for `/dashboard-partner`'s
section navigation, adapted here for `window` scroll (this page's `.egd-scroll` has no `overflow` of
its own, unlike that page's internally-scrolling container).

## Team Engagement Operations — `/ExploreGod-team`

An eleventh page: a fourth lens on the same OneHope CRM, built for Siji — a team lead who runs the
India engagement team's day-to-day operations. See DESIGN.md's "Eleventh page" note for the role
distinction from the other three pages and why it ships as a sibling page. It loads
`explore-god-dashboard.css` unchanged for the shell and every shared component, and
`design-system/explore-god-team.css` for the components unique to this lens.
`js/explore-god-team.js` renders every panel from small in-file arrays, following the same
one-file-per-page convention as the other three pages' JS.

### Today / Team Pulse — `.egd-pulse-kpis`

Eight `.egd-stat` cards (reused verbatim from the shared file) giving a once-a-glance read on the
day — New/Active/Unclaimed/Seekers Responded/Expiring Soon/Follow-ups Due/Escalations/Closed
Today. Deliberately without the shared `.egd-stat__delta` trend badges the other three pages'
KPI rows use — a pulse check doesn't need a trend arrow on "18 seekers responded," it needs the
number and a sparkline, and adding a delta here would just be decoration competing with the
Needs Attention panel immediately below it for the same information.

### Needs Attention — `.egd-alert-row`

```js
{ tier: "critical", title: "Seeker Responded", count: 18, desc: "…",
  action: "Respond now", target: { type: "queue", filter: "responded" } }
```

A different shape from the disclosure-based Needs Attention on `/ExploreGod-CRM-Dashboard-2` and
`/ExploreGod-Global` on purpose: every row here is a single whole-row action, not an
expand/collapse — Siji's brief is explicit that each item should be "clickable directly into the
conversations," so clicking a row either sets the Conversation Queue's tab filter and scrolls to it
(`{ type: "queue", filter }`) or scrolls straight to a dedicated section (`{ type: "scroll",
selector }` — used for Expiring Conversations and Team QA, since those are richer destinations than
a queue filter can express). `handleActionButton()`-style dispatch lives inline in the click
handler rather than as a separate function, since this page only has the one caller (unlike
`/ExploreGod-Global`, which reuses its dispatcher from several panels).

The seven tiers intentionally share color across pairs that the brief itself groups at the same
severity (🔴 Seeker Responded/Expiring Soon both `critical`; 🟠 No Response-Follow-up/Unclaimed/
Stalled all `warning`; 🟡 Escalations/Needs Team Lead Review both `caution`) — this mirrors the
brief's own tiering rather than inventing a finer-grained palette the brief doesn't ask for.

### Conversation Queue — `.egd-cq-row`

Nine tabs (All/New/Unclaimed/Responded/Active/Expiring/Follow-up/Escalated/Stalled — one more than
the brief's own example list; "Stalled" was added since Needs Attention already surfaces it as its
own severity and a queue with no way to actually filter to it would be a dead end). Each row: a
bulk-select checkbox, seeker + channel/language, topic, assigned OM (or an "Unclaimed" badge), a
status pill, a wait/expiry chip, a priority dot, a contextual primary action (Claim/Respond/View/
Follow up/Review, from `PRIMARY_ACTION`), and a kebab "more actions" menu. Reuses `.egd-avatar`/
`.egd-channel`/`.egd-wait`/`.egd-assign` verbatim from the shared file rather than inventing
row-level primitives from scratch.

The kebab menu is the same `.egd-assign__menu` body-portal popover `/ExploreGod-CRM-Dashboard`
introduced (`openRowMenu()`/`applyRowMenuAction()` are this page's generalization of that file's
`renderQueue`-scoped assign logic to a shared record lookup, `findQueueRow()`, since the same
popover is now reused across three different lists — the Conversation Queue, Expiring
Conversations, and Follow-Up — against the same underlying record shape). Choosing "Assign"/
"Reassign" swaps the menu's own contents for the OM picker rather than opening a second popover.

Every column but Topic is a fixed pixel width (not an `fr` share) in both `.egd-cq-head` and
`.egd-cq-row` — see DESIGN.md's "table alignment pass" note for why: the head and each row are
independent grid containers, so a proportional split resolves to a different pixel width in each
one depending on what that particular container holds, which both misaligns columns and can
truncate a long OM name. Topic alone stays `minmax(0, 1fr)` and absorbs the leftover space, since
truncating a topic phrase is expected. This pushed the panel's minimum width past its ~854px share
of the two-column layout at a common desktop viewport, so the table now scrolls horizontally within
its own container there by default — a deliberate trade (legible, correctly aligned columns) over
the alternative (columns narrow enough to avoid scrolling but too cramped to read).

### Bulk actions — `.egd-cq-bulkbar`

Checking any row reveals a bulk bar ("N selected · Close as: No Response / Resolved / Follow-up ·
Clear") — this is Siji's most explicit feature request in the brief, made because closing dozens of
conversations one at a time was consuming significant time. Choosing an outcome removes every
selected row from `QUEUE` and shows a brief toast (`.egd-bulk-toast`, appended to `<body>` so it
survives the list re-render that just emptied it) confirming what happened and how many — honest
local feedback, not a real backend write, same as the AI cards' `is-done` state elsewhere in this
product, just phrased as a toast since "close N conversations" is an action on many rows at once
rather than a single card's own state changing.

### Team Workload — `.egd-workload-row`

```js
{ name: "Divya Krishnan", status: "online", active: 157, new: 8, waiting: 7, needsAction: 8,
  avgResponse: "11m", workload: "high" }
```

A table, not a chart, per the brief's own "standard component of operational dashboards" framing —
active/new/waiting/needs-action/avg. response/a `.egd-load`-colored workload badge (reused from
`/ExploreGod-CRM-Dashboard-2`'s Team Health), and online/break/offline status via `.egd-status`
(duplicated from that same page — see file header). "Reassign" doesn't open a per-conversation
picker from this row — it scrolls to the Conversation Queue, where the actual per-conversation
Assign/Reassign action already lives, rather than building a second, competing reassignment surface.

Same fixed-column-widths fix as the Conversation Queue above, for the same reason — see DESIGN.md's
"table alignment pass" note. Team Member is the one flexible column here (it had enough headroom
that it never actually misaligned or truncated a name, unlike the Conversation Queue's narrower
Assigned column).

### Shift & Coverage — `.egd-shift-card`

Two static cards (Current Shift / Next Shift) rather than a live scheduling system — this is a
prototype with no real shift-scheduling backend. Current Shift lists who's working, who's running
triage, who's handling existing conversations, incoming volume, and a `.egd-coverage-meter` bar;
Next Shift lists who's scheduled and what will be waiting for them (follow-ups due, conversations
expiring before the shift begins) plus a handoff note — directly modeling the brief's own "Next
Shift: 2 OMs scheduled, 18 conversations requiring follow-up, 4 conversations expiring before shift
begins" example.

### Triage Management — `.egd-triage-body`

Incoming/unclaimed/claimed counts, current and next triage owner, and a "Reassign triage" button
that opens the same `.egd-assign__menu` popover pattern (a fresh instance built inline in
`js/explore-god-team.js` rather than routed through `openRowMenu()`, since triage reassignment has
no underlying conversation record — it's reassigning a *role*, not a row). `triageState` is a tiny
local object so reassigning re-renders the "current owner" line without a full page reload.

### Expiring Conversations — `.egd-expiring-buckets`

Its own feature, per the brief, rather than folded into the Conversation Queue's "Expiring" tab —
WhatsApp's 24-hour session window doesn't distinguish "expiring in an hour" from "expiring this
weekend," and a team lead needs to see those very differently. Five buckets (Within 1 hour/Today/
Tomorrow/Weekend/Already expired) as `.egd-tabs`-style buttons with a live count per bucket
(`.egd-tab__count`), each showing the compact row variant described below. "Already expired" is
included deliberately, not hidden — Siji still needs to know what was missed, even if nothing can
be done about the expiry itself.

### Compact row variant — `.egd-cq-row--compact`

Expiring Conversations and Follow-Up both reuse a lighter version of the Conversation Queue row
(`renderCompactRow()`): no checkbox, no status badge (the section/bucket the row is already inside
of *is* the status), just who/topic/assigned/wait-or-expiry/priority/actions. Both lists share the
row renderer and the same kebab-menu wiring (`openRowMenu`/`applyRowMenuAction`) as the full queue,
parameterized by which render function to call afterward — one row anatomy, reused three times,
not three near-duplicate row components.

### Follow-Up — `.egd-followup` (panel), reusing `.egd-cq-row--compact`

Seven tabs (Due Today/Overdue/No Response/Waiting on Seeker/Waiting on OM/Long-running/
High-priority) filtering one `FOLLOWUPS` array by a single `category` field. This is the page's
answer to the brief's own framing — protecting "having deeper conversations with seekers" from
being crowded out by administrative cleanup — so unlike Expiring Conversations (which is about a
hard deadline), nothing here has a countdown chip; the wait chip is a plain elapsed-time signal.

### Team QA / Conversation Review — `.egd-qa-row` + `.egd-qadialog`

A review queue (`QA_QUEUE`) tagging each entry with why it's there (New team member/Escalated/
Random QA sample/Needs coaching) — directly modeling the brief's description of senior OMs
monitoring new team members' conversations for their first 2–3 months. "Review" opens a dedicated
QA dialog (`.egd-qadialog`, a second native `<dialog>` alongside the conversation quick-view, not a
repurposed version of it — a coaching review is Siji's own assessment, not an AI-generated one, so
its content is a short excerpt plus a real feedback form, not an AI quality breakdown) with an
"Overall assessment" select and a coaching-notes textarea; submitting shows a brief "Feedback saved"
confirmation (local-only, same honesty convention as everywhere else in this product) before
closing.

The tag column (`.egd-qa-row__tag`) is a fixed 150px, not `auto` — each row is its own grid
container, so an `auto` tag column sized to that row's own tag text ("Escalated" vs. the much wider
"Random QA sample"), pushing the conversation title after it to a different starting x per row. A
fixed width, with `justify-self: start` on the tag itself so its pill doesn't stretch to fill the
now-wider column, gives every row's title the same left edge — see DESIGN.md's "table alignment
pass" note.

### Onboarding & Training — `.egd-onboard-row`

Two new team members (`ONBOARDING`), each showing week-of-N progress, two training checkmarks
(ECHO/Conversation training, styled via `.egd-onboard-check.is-done` — a plain colored pill, not
reusing `.egd-checklist` from `/ExploreGod-CRM-Dashboard-2` since there's no ordered sequence here,
just two independent facts), ready-for-shift status, remaining QA monitoring weeks, and an open
coaching-task count.

### Alerts — `.egd-alertfeed-row`

A short, proactive, dismissible list (`ALERTS`) — genuinely different from Needs Attention's
per-conversation triage: these are team/operations-level signals (a specific OM's workload, a
resource gap in a specific language) that don't map to a single queue filter. Dismissing an alert
just removes it from the DOM (`element.remove()`) — there's no backend to persist the dismissal,
consistent with this being a prototype.

### Conversation Analytics — `.egd-analytics-body`

Deliberately secondary and compact, per the brief's own instruction to keep this layer secondary to
the operational queue above it: a handful of rows (avg. response time, no-response rate, today's
outcome breakdown) plus a small volume-by-language bar list (`.egd-lang-volume`). No sparkline-heavy
KPI treatment here — that visual weight is reserved for the Today/Team Pulse row, not repeated here.

### Resource Library — `.egd-resource-card`

```js
{ id: "r1", title: "Understanding Fear", type: "video", language: "Hindi", topic: "Fear",
  duration: "4:12", sent: 42, opened: 31, watched: 18 }
```

Much more prominent than on any other page, per the brief — a full-width panel, not a sidebar
card. Filterable by language (`.egd-lang-chips`, a quick-filter row — Hindi/Malayalam/Tamil/Telugu/
Bengali/English/Other — directly answering the brief's specific pain point about finding resources
in Indian languages), topic, and type, plus a Most Used/Recently Added sort toggle. Each card shows
a compact engagement funnel (`engagementLine()`: Sent → Opened → Watched for video/testimony, Sent
→ Opened → Downloaded for PDFs, Sent → Opened for scripture text) — the brief specifically wants to
know whether seekers engage with what's sent, not just that it was sent. "Send to conversation"
opens the same `.egd-assign__menu` popover pattern used elsewhere (listing a handful of recent
conversations, since this page has no single "currently open" conversation the way the quick-view
dialog does), then shows a temporary "Sent to Seeker #…" confirmation on the button itself before
reverting — repeatable, unlike the AI cards' one-time `is-done` state, since sending a resource is
something you'd do again for a different seeker.

### Conversation quick view — `.egd-convo` (native `<dialog>`)

A single reusable dialog (`openConversationDialog()`), the same governing pattern as
`/dashboard-partner`'s `.org-detail` and `/ExploreGod-Global`'s `.egd-review` — populated per
conversation, native focus trap/Esc/`::backdrop` for free. Shows the seeker's quote/topic, key
facts (assigned OM, waiting time, priority, expiry if relevant), a **Recommended Resources** list
matched to the conversation's topic by simple keyword rules (`RESOURCES_BY_TOPIC_KEYWORD`) each with
its own "Send" button, and a contextual action row (Claim only if unclaimed, Respond always,
Escalate/Follow up/Close). This is the page's answer to the brief's resource-recommendation
intelligence (section 14 of the brief) — recommendations only ever appear in the context of an
actual conversation, never as a standalone "browse recommendations" feature, since a recommendation
without a seeker to send it to isn't actionable.

### Shared "click outside closes the menu" fix

Three different triggers on this page open the same body-portal `.egd-assign__menu` (the Queue's
kebab, Triage's "Reassign triage," and the Resource Library's "Send to conversation"). The single
document-level listener that closes an open menu on an outside click originally only recognized the
Queue's kebab (`.egd-cq-more`) as a valid opener — so opening the menu from either of the other two
triggers immediately closed it again, because that trigger's own click bubbles up to the same
document listener, which didn't recognize it and closed what had just opened. Fixed by listing every
valid trigger (`.egd-cq-more`, `#triage-reassign-btn`, `[data-send-id]`) in the one guard condition —
see DESIGN.md's "Eleventh page" note.

## Online Missionary Dashboard — `/ExploreGod-OM-Dashboard`

Joseph's homepage — see DESIGN.md's "Twelfth page" note for why this lens is task-focused rather
than metrics-driven, and for the mapping from the originating brief's ten design principles to this
page's modules vs. `/ExploreGod-OM-Chat`'s. Loads `explore-god-dashboard.css` unchanged for the
shell/tokens/`.egd-panel`/`.egd-avatar`/`.egd-tabs`/`.egd-wait`, and
`design-system/explore-god-om-dashboard.css` for everything unique to this lens;
`js/explore-god-om-dashboard.js` follows the one-file-per-page convention (helpers, `.egd-btn-cta`,
`.egd-status`/`.egd-status--online`, `.egd-quick-action*`, and the bulk-close bar are duplicated,
not cross-loaded).

### Motivational header — `.egd-motivate`

A single warm sentence under the greeting ("You've helped 14 people take a next step this week —
keep going"), styled as a soft AI-tinted callout, not a stat tile — no count badge, no delta arrow.
Deliberately not built as a metric: the brief is explicit that this dashboard should never feel like
a productivity score, and a number sitting in prose reads differently than the same number in a
`.egd-stat__value`.

### My Shift — `.egd-shift-row`

Four rows (`SHIFT_REASONS`), one per category the brief calls out — a seeker who replied and is
waiting, a conversation expiring inside its window, a follow-up due today, something escalated back
by Vero — each a direct link into `/ExploreGod-OM-Chat/?seeker=NNNN`. The panel header's
`.egd-shift-badge` is the *only* count badge anywhere on this page, on purpose (design principle
#1: "the only module that should ever carry a count badge") — every other list here (My
Conversations, My Team, Formation) shows plain rows instead.

### My Conversations — `.egd-myqueue-row`

Joseph's full assigned queue (`QUEUE`), personal-scope version of `/ExploreGod-team`'s Conversation
Queue: search by keyword/seeker number/date (`.egd-myqueue-search`, a plain substring match across
id/message/date — no separate search index), tab filters mirroring My Shift's four categories,
row-level "Resume chat" links into the chat workspace, and a checkbox + bulk-close bar
(`.egd-myqueue-bulkbar`, same No Response/Resolved/Follow-up outcomes and toast pattern as Team's
queue) for clearing several conversations at once. Columns are fixed pixel widths except "Last
message" (`minmax(0, 1fr)`, the one column meant to truncate) — the same head/row grid-alignment
fix DESIGN.md's "table alignment pass" note documents for `/ExploreGod-team`, applied from the start
here rather than re-discovered; the table's 980px min-width is wider than its ~854px panel share at
a 1440px viewport, so it scrolls horizontally within `.egd-myqueue-scroll` by default — the same
accepted trade-off as Team's Conversation Queue, not a bug.

### Team Feed — `.egd-feed-post`

A composer (`#feed-composer`) plus a list (`FEED`) of posts with inline reply threads
(`.egd-feed-comments`/`.egd-feed-reply`, toggled open per post). Vero's and Siji's posts get
`.egd-feed-post--lead` — an AI-soft tint, an accent left border, and (when present) a recommended-
material chip (`.egd-feed-post__attachment`) — so a coordinator's directional note never blends into
a peer's question; every other post shares one plain treatment regardless of author. My Team's
message icon (below) jumps here and pre-addresses the composer with `@Name` rather than opening a
second messaging surface — this product already has a rule against a second chat/assistant surface
(the Shep widget), and the same logic applies to teammate-to-teammate messaging.

### My Team — `.egd-myteam-row`

The "module on the homepage that reflects a team" the brief asked for, separate from Team Feed:
Vero plus a handful of fellow OMs, online/offline status (`.egd-status--online`), and a message
icon into Team Feed. Deliberately not a caseload/workload roster like `/ExploreGod-CRM-Dashboard-2`'s
Team Health — that's Vero's tool for managing Joseph, not Joseph's tool for seeing his peers, so no
numbers are shown here at all.

### Formation & Training — `.egd-onboard-task`

Joseph's own view of the same onboarding/training concept `/ExploreGod-team`'s "Onboarding &
Training" panel manages from Siji's side (`ONBOARD_STATE`): week X of Y, QA monitoring weeks left,
a task checklist with a "Mark done" toggle, and one coaching note. This is design principle #5
("Formation of the missionary... the same signal, shown to the person being scored") — the same
underlying data Siji's roster view would show for Joseph specifically, reframed as his own progress
view rather than a manager's monitoring list.

### How I'm Doing — `.egd-wellbeing-row`

Design principle #10, built to its two stated constraints: Joseph's own view first (no manager
content-visibility here at all — the copy says so explicitly), and never a productivity score — load
is shown as plain sentences ("6 active · 2 heavy," "3h 40m today"), not a percentage, bar, or badge.
"Flag that I need support" posts a plain note into Team Feed rather than opening a second, hidden
channel to Vero — the same one-feed-not-two-surfaces reasoning as My Team's message icon.

## Online Missionary Conversation Workspace — `/ExploreGod-OM-Chat`

Where Joseph actually chats with a seeker — reached only from a "Resume chat"/"Start chat" link
elsewhere in the product (never a rail destination of its own), with an optional `?seeker=NNNN`
query param that opens and activates that seeker's tab on load. See DESIGN.md's "Thirteenth page"
note. Loads `explore-god-dashboard.css` for the shell/tokens and
`design-system/explore-god-om-chat.css` for everything else; `js/explore-god-om-chat.js` follows the
one-file-per-page convention. Unlike every sibling page, this one is a fixed-height app workspace
(`.egd-main`/`.egd-chat-page` are given an explicit `height: 100vh` in this page's own CSS) rather
than a long scrolling page, since the tab strip, AI panel, and Vero panel all need to stay visible
while the conversation itself scrolls independently.

### Conversation tabs — `.egd-chat-tab`

Several conversations can stay open at once (`openTabs`), each a pill showing a priority-colored
status dot (`PRIORITY_META` — waiting/expiring/followup/escalated/none, the same colored-dot
language `.egd-wait`/`.egd-priority` use elsewhere on this CRM), the seeker's anonymized id, and a
close control. Each tab item is a plain `<div>` wrapping two sibling `<button>`s (select, close) —
not the strict ARIA tabs pattern (`role="tab"` inside `role="tablist"`), because a tab that also
needs an independent close button can't validly nest one interactive control inside another; an
automated accessibility pass (axe-core) is what caught the first version of this doing exactly that.
Closing the active tab activates its neighbor; closing the last tab shows `.egd-chat-empty` with a
link back into My Conversations. Sending a reply from an open tab whose priority was "Waiting for
you" flips it to "You replied" immediately (`renderTabs()` re-runs on send) — the chip reflects who
actually owes the next message, not a static label.

### AI Recommendations — `.egd-chat-ai-card`

Three cards per active conversation (`aiNextTopic`, `aiGuidance`, `aiExamples`) — design principle
#4's three pieces: a suggested next topic, in-the-moment composing guidance, and 2–3 anonymized
"what good looked like" examples from experienced missionaries. Capped at three cards and 2–3
examples on purpose, per the brief's own constraint ("nine-out-of-ten on simplicity... a nudge, not
a curriculum") — this is not a scrollable feed of tips.

### Learn at the point of need — `.egd-chat-ai__search`

A small search box at the top of the AI panel (`LEARN_LIBRARY`, a plain substring filter) —
design principle #6, deliberately placed inside the conversation workspace rather than as a separate
help page or LMS, per the brief's own framing that a separate course is exactly the split this
module should end.

### Inline translation — `.egd-chat-header__translate-btn` / `.egd-chat-bubble__translation`

"Show original language" reveals each seeker bubble's message in an approximation of their own
language/dialect below the default (already-in-English) text; "Translate before sending" previews
what Joseph's own reply would look like once translated, shown under his own bubble after sending.
Both directions share one mock word-substitution function (`mockLocalize` — no real translation
service exists anywhere in this product, same honesty-about-mocking standard as every other page's
data), and both controls are hidden entirely for an English-speaking seeker (`needsTranslation()`),
since there's nothing to translate. A `.egd-chat-translate-bar` dialect `<select>`
(`CHAT_DIALECTS`) covers "language conversion and dialects" specifically for Bahasa Indonesia's
formal/Javanese-dialect split.

### Composer — `.egd-chat-composer`

Text (auto-growing `<textarea>`, Enter to send/Shift+Enter for a newline), attachments (a hidden
file input triggered by a paperclip button, rendered as removable name chips — no real upload,
consistent with this being a prototype), and emoji (`.egd-emoji-picker`, a fixed 12-emoji grid
inserted at the cursor). The attach button's hidden file input has its own visually-hidden
`<label>` — another axe-caught gap the first version shipped without.

### Message from Vero / Ask AI — `.egd-vero-card`

The brief's "Message from Vero: so Vero can actively send a message to Joseph because she has a
lens into the conversation" — a per-conversation note (`vero.text`) plus a reply field and a
separate "Ask AI a question" mini-form beneath it. Both are distinct asks (replying to Vero vs.
asking the AI) so they get visually separate rows rather than one shared input trying to do both
jobs; this whole card is unique per conversation, not a single fixed panel, per the brief's explicit
"the right panel needs to be unique to every conversation."

### Seeker Journey flag — `.egd-journey-flag`

The same four-stage New/Active/Growing/Handoff identity and color mapping used everywhere else on
this CRM (see `/ExploreGod-CRM-Dashboard-2`'s stage-mapping note) — automated per conversation
(`conversation.stage`), with a one-line blurb (`JOURNEY_BLURB`) on what that stage means for what
to do next, not just a bare label.

### Get help with this one — `.egd-help-btn`

Design principle #8 (Vero's "flagged a conversation as too difficult to handle alone," Brittany's
transfer problem): an "Escalate to Vero" button and an "Ask a teammate" picker
(`.egd-help-picker`, the same lightweight inline-list pattern as other body-portal-free pickers on
this CRM), both reachable without leaving the conversation. Confirmation is a plain inline sentence
(`.egd-help-confirm`), not a dialog or a page navigation — escalating shouldn't interrupt the chat
Joseph is still in.

### Capture what happened — `.egd-outcome-chip`

Deliberately minimal, per the brief's own caution that this module exists to become unnecessary once
a proper capture flow (its "D2") ships, and that anything built here in the meantime shouldn't
harden the wrong model: four one-tap outcome chips, no history log, no multi-field form. "Other"
reveals a single optional one-line note (`.egd-outcome-note`) — the brief's own described escape
hatch ("put the truth in a note") — rather than a second decision tree.
