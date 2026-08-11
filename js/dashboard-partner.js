// ---------- In-page section navigation (top nav + sidebar) ----------
// Anchors scroll so a section's own heading lands just below the sticky
// topbar, instead of the browser's default jump — which puts the target
// element's top edge flush with the viewport top, hiding it behind the
// topbar entirely. Smoothness/reduced-motion is left to CSS `scroll-behavior`
// (see dashboard.css) by not passing an explicit `behavior` here.
const topbar = document.querySelector(".app-topbar");
const SCROLL_OFFSET_GAP = 16; // breathing room below the topbar, ~--space-4

function scrollToSection(hash, { updateHistory = true } = {}) {
  const target = document.querySelector(hash);
  if (!target) return;

  const topbarHeight = topbar?.getBoundingClientRect().height ?? 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: targetTop - topbarHeight - SCROLL_OFFSET_GAP });

  if (updateHistory) history.pushState(null, "", hash);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const hash = link.getAttribute("href");
  if (!hash || hash.length < 2 || !document.querySelector(hash)) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToSection(hash);
  });
});

// Landing directly on a section link (e.g. a bookmarked or shared URL) hits
// the same covered-heading problem the browser's default jump has — offset
// it the same way once the page has laid out. The browser's own jump-to-
// fragment isn't tied to DOMContentLoaded — it can land anywhere up through
// `load` — so correcting only on DOMContentLoaded risks getting silently
// overwritten by that later native jump. Re-applying on `load` covers the
// common case; an unusually slow, late layout shift (e.g. a font swap) after
// that point could still occasionally win the race — an accepted gap for
// this secondary entry point, not the primary nav-click interaction above.
if (location.hash) {
  const landOnHash = () => scrollToSection(location.hash, { updateHistory: false });
  document.addEventListener("DOMContentLoaded", landOnHash);
  window.addEventListener("load", landOnHash);
}

// ---------- Opportunity funnel → matched organization list filter ----------
const funnel = document.getElementById("funnel");
const stalledButton = document.querySelector(".funnel__stalled");
const orgRows = document.querySelectorAll("#org-list .record-row");
const filterStatus = document.getElementById("funnel-filter-status");
const filterStatusText = document.getElementById("funnel-filter-status-text");
const filterClearButton = document.getElementById("funnel-filter-clear");

const STAGE_LABELS = {
  matched: "Matched",
  recommended: "Recommended",
  introduced: "Introduced",
  session: "Session",
  engaged: "Engaged",
  converted: "Converted",
  stalled: "Stalled",
};

let activeStage = null;

function applyFilter(stage) {
  activeStage = stage;

  const stageButtons = funnel ? funnel.querySelectorAll(".funnel__stage") : [];
  stageButtons.forEach((button) => {
    const isActive = button.dataset.stage === stage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const stalledActive = stage === "stalled";
  stalledButton?.classList.toggle("is-active", stalledActive);
  stalledButton?.setAttribute("aria-pressed", String(stalledActive));

  let visibleCount = 0;
  orgRows.forEach((row) => {
    const matches =
      !stage ||
      (stage === "stalled" ? row.dataset.stalled === "true" : row.dataset.stage === stage);
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  if (!stage) {
    if (filterStatus) filterStatus.classList.remove("is-visible");
    return;
  }

  if (filterStatusText) {
    const noun = visibleCount === 1 ? "organization" : "organizations";
    filterStatusText.textContent = `Showing: ${STAGE_LABELS[stage]} · ${visibleCount} ${noun}`;
  }
  filterStatus?.classList.add("is-visible");
}

funnel?.addEventListener("click", (event) => {
  const button = event.target.closest(".funnel__stage");
  if (!button) return;
  const { stage } = button.dataset;
  applyFilter(activeStage === stage ? null : stage);
});

stalledButton?.addEventListener("click", () => {
  applyFilter(activeStage === "stalled" ? null : "stalled");
});

filterClearButton?.addEventListener("click", () => applyFilter(null));

// ---------- Partner Opportunity Detail dialog ----------
const ORG_DETAILS = {
  "mercy-gate-fellowship": {
    name: "Mercy Gate Fellowship",
    meta: "Small ministry · Northeast",
    stage: "Matched",
    match: "Medium match",
    agent: "Pending assignment",
    why: "A new lead pastor started this year, and the ministry's size band matches Forte's sweet spot for leadership coaching.",
    doneSteps: 1,
  },
  "willow-creek-ministries": {
    name: "Willow Creek Ministries",
    meta: "Mid-size ministry · Midwest",
    stage: "Recommended",
    match: "High match",
    agent: "Sarah",
    why: "Staff size has grown quickly over the past year — a pattern that has historically increased interest in ministry-leader coaching.",
    doneSteps: 2,
  },
  "grace-fellowship": {
    name: "Grace Fellowship",
    meta: "Large ministry · Midwest",
    stage: "Recommended",
    match: "High match",
    agent: "Alan",
    why: "Recent leadership transition and increased ministry size indicate a strong fit for ministry-leader coaching.",
    doneSteps: 2,
    stalledDays: 12,
  },
  "riverside-community-church": {
    name: "Riverside Community Church",
    meta: "Mid-size ministry · Midwest",
    stage: "Recommended",
    match: "Medium match",
    agent: "Sarah",
    why: "Multiple staff changes this year and a mid-size ministry profile align with organizations that have responded well to Forte.",
    doneSteps: 2,
    stalledDays: 9,
  },
  "trinity-baptist-fellowship": {
    name: "Trinity Baptist Fellowship",
    meta: "Mid-size ministry · West",
    stage: "Recommended",
    match: "Medium match",
    agent: "Alan",
    why: "Organization size and a recent facilities expansion are associated with higher interest in leadership support programs.",
    doneSteps: 2,
    stalledDays: 15,
  },
  "calvary-ridge-church": {
    name: "Calvary Ridge Church",
    meta: "Mid-size ministry · West",
    stage: "Introduced",
    match: "High match",
    agent: "Sarah",
    why: "A recent change in senior leadership and steady ministry growth match the profile of organizations that respond well to Forte.",
    doneSteps: 4,
  },
  "first-community-church": {
    name: "First Community Church",
    meta: "Mid-size ministry · Southeast",
    stage: "Session booked",
    match: "High match",
    agent: "Sarah",
    why: "Ministry size and recent organizational change place this account in Forte's highest-converting cohort.",
    doneSteps: 5,
  },
  "neighborhood-fellowship": {
    name: "Neighborhood Fellowship",
    meta: "Mid-size ministry · Southeast",
    stage: "Engaged",
    match: "High match",
    agent: "Alan",
    why: "Consistent ministry growth and staff size indicate a strong fit for ongoing leadership coaching.",
    doneSteps: 5,
  },
  "new-hope-ministries": {
    name: "New Hope Ministries",
    meta: "Large ministry · Southeast",
    stage: "Converted",
    match: "High match",
    agent: "Alan",
    why: "Ministry size, region, and recent leadership growth matched Forte's highest-converting cohort profile.",
    doneSteps: 6,
  },
};

const TIMELINE_STEPS = [
  "Matched",
  "Recommended to agent",
  "Agent engaged",
  "Introduction made",
  "Session booked",
  "Conversion",
];

const dialog = document.getElementById("org-detail");
const dialogName = document.getElementById("org-detail-name");
const dialogMeta = document.getElementById("org-detail-meta");
const dialogStage = document.getElementById("org-detail-stage");
const dialogMatch = document.getElementById("org-detail-match");
const dialogAgent = document.getElementById("org-detail-agent");
const dialogWhy = document.getElementById("org-detail-why");
const dialogTimeline = document.getElementById("org-detail-timeline");
const dialogStalled = document.getElementById("org-detail-stalled");
const dialogClose = document.getElementById("org-detail-close");

let lastTrigger = null;

function renderTimeline(doneSteps) {
  if (!dialogTimeline) return;
  dialogTimeline.innerHTML = TIMELINE_STEPS.map((step, index) => {
    const isDone = index < doneSteps;
    const icon = isDone
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 5-5" /></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><circle cx="12" cy="12" r="9" /></svg>';
    return `<li class="${isDone ? "is-done" : ""}">${icon}${step}</li>`;
  }).join("");
}

function openOrgDetail(orgId, trigger) {
  const org = ORG_DETAILS[orgId];
  if (!org || !dialog) return;

  lastTrigger = trigger;
  if (dialogName) dialogName.textContent = org.name;
  if (dialogMeta) dialogMeta.textContent = org.meta;
  if (dialogStage) dialogStage.textContent = org.stage;
  if (dialogMatch) dialogMatch.textContent = org.match;
  if (dialogAgent) dialogAgent.textContent = org.agent;
  if (dialogWhy) dialogWhy.textContent = org.why;
  renderTimeline(org.doneSteps);

  if (dialogStalled) {
    if (org.stalledDays) {
      dialogStalled.hidden = false;
      dialogStalled.textContent = `No new activity in ${org.stalledDays} days — this opportunity has stalled after recommendation.`;
    } else {
      dialogStalled.hidden = true;
    }
  }

  dialog.showModal();
}

document.querySelectorAll("[data-org-detail]").forEach((button) => {
  button.addEventListener("click", () => openOrgDetail(button.dataset.orgDetail, button));
});

dialogClose?.addEventListener("click", () => dialog?.close());

dialog?.addEventListener("close", () => {
  lastTrigger?.focus();
  lastTrigger = null;
});

dialog?.addEventListener("click", (event) => {
  // Clicking the ::backdrop dispatches the click on the <dialog> element
  // itself (not a descendant) — close, matching the Esc/close-button UX.
  if (event.target === dialog) dialog.close();
});
