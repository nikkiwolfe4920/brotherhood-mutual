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

  let visibleCount = 0;
  orgRows.forEach((row) => {
    const matches = !stage || row.dataset.stage === stage;
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

filterClearButton?.addEventListener("click", () => applyFilter(null));

// ---------- Partner Opportunity Detail dialog ----------
const ORG_DETAILS = {
  "mercy-gate-fellowship": {
    name: "Mercy Gate Fellowship",
    meta: "Small ministry · Northeast",
    stage: "Matched",
    match: "Medium match",
    agent: "Pending assignment",
    why: "This ministry's building age and Northeast storm-exposure profile match Highpoint's typical service area for roof assessment and restoration work.",
    doneSteps: 1,
  },
  "willow-creek-ministries": {
    name: "Willow Creek Ministries",
    meta: "Mid-size ministry · Midwest",
    stage: "Recommended",
    match: "High match",
    agent: "Sarah",
    why: "A recent property expansion and the ministry's building age align with organizations that have responded well to Highpoint's roofing assessments.",
    doneSteps: 2,
  },
  "grace-fellowship": {
    name: "Grace Fellowship",
    meta: "Large ministry · Midwest",
    stage: "Recommended",
    match: "High match",
    agent: "Alan",
    why: "Building age and recent storm activity in the Midwest region indicate a strong fit for a Highpoint roof assessment.",
    doneSteps: 2,
  },
  "riverside-community-church": {
    name: "Riverside Community Church",
    meta: "Mid-size ministry · Midwest",
    stage: "Recommended",
    match: "Medium match",
    agent: "Sarah",
    why: "Multiple recent facility maintenance requests and a mid-size property profile align with organizations that have responded well to Highpoint.",
    doneSteps: 2,
  },
  "trinity-baptist-fellowship": {
    name: "Trinity Baptist Fellowship",
    meta: "Mid-size ministry · West",
    stage: "Recommended",
    match: "Medium match",
    agent: "Alan",
    why: "Building size and a recent facilities expansion are associated with higher interest in roof and exterior restoration services.",
    doneSteps: 2,
  },
  "calvary-ridge-church": {
    name: "Calvary Ridge Church",
    meta: "Mid-size ministry · West",
    stage: "Introduced",
    match: "High match",
    agent: "Sarah",
    why: "Recent property investment and steady facility upkeep match the profile of organizations that respond well to Highpoint.",
    doneSteps: 4,
  },
  "first-community-church": {
    name: "First Community Church",
    meta: "Mid-size ministry · Southeast",
    stage: "Session booked",
    match: "High match",
    agent: "Sarah",
    why: "Building age and regional storm exposure place this account in Highpoint's highest-converting cohort.",
    doneSteps: 5,
  },
  "neighborhood-fellowship": {
    name: "Neighborhood Fellowship",
    meta: "Mid-size ministry · Southeast",
    stage: "Engaged",
    match: "High match",
    agent: "Alan",
    why: "Consistent facility investment and building size indicate a strong fit for ongoing roof and restoration services.",
    doneSteps: 5,
  },
  "new-hope-ministries": {
    name: "New Hope Ministries",
    meta: "Large ministry · Southeast",
    stage: "Converted",
    match: "High match",
    agent: "Alan",
    why: "Building size, region, and recent storm exposure matched Highpoint's highest-converting cohort profile.",
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

// ---------- Financial Trends chart ----------
// Mock data at 5 bucket resolutions rather than one fixed window — the
// period filter swaps which of these renders. Quarterly (the current
// trailing quarter) is the default per the design brief; its 3 monthly
// figures reconcile with yearly's Q3 '26 total (16,100 / 3,220) so the two
// views don't silently disagree with each other.
const FINANCIAL_PERIODS = {
  daily: {
    caption: "Last 7 days",
    trend: "8% vs. prior period",
    labels: ["Aug 5", "Aug 6", "Aug 7", "Aug 8", "Aug 9", "Aug 10", "Aug 11"],
    revenue: [280, 310, 295, 340, 360, 410, 450],
    bonus: [56, 62, 59, 68, 72, 82, 90],
  },
  weekly: {
    caption: "Last 6 weeks",
    trend: "15% vs. prior period",
    labels: ["Jun 29", "Jul 6", "Jul 13", "Jul 20", "Jul 27", "Aug 3"],
    revenue: [1200, 1400, 1550, 1700, 1900, 2100],
    bonus: [240, 280, 310, 340, 380, 420],
  },
  monthly: {
    caption: "Last 6 months",
    trend: "28% vs. prior period",
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    revenue: [2600, 3100, 3800, 4200, 5100, 6800],
    bonus: [520, 620, 760, 840, 1020, 1360],
  },
  quarterly: {
    caption: "Current quarter (Jun–Aug 2026)",
    trend: "62% vs. prior period",
    labels: ["Jun", "Jul", "Aug"],
    revenue: [4200, 5100, 6800],
    bonus: [840, 1020, 1360],
  },
  yearly: {
    caption: "Last 4 quarters",
    trend: "64% vs. prior period",
    labels: ["Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"],
    revenue: [9800, 11200, 13400, 16100],
    bonus: [1960, 2240, 2680, 3220],
  },
};

const financialPeriodFilter = document.getElementById("financial-period-filter");
const financialChartCaption = document.getElementById("financial-chart-caption");
const financialChartPlot = document.getElementById("financial-chart-plot");
const financialChartAxis = document.getElementById("financial-chart-axis");
const financialTotalRevenue = document.getElementById("financial-total-revenue");
const financialTotalBonus = document.getElementById("financial-total-bonus");
const financialRevenueTrend = document.getElementById("financial-revenue-trend");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function renderFinancialTrends(period) {
  const data = FINANCIAL_PERIODS[period];
  if (!data || !financialChartPlot || !financialChartAxis) return;

  const maxValue = Math.max(...data.revenue, ...data.bonus);
  financialChartPlot.innerHTML = data.labels
    .map((_, index) => {
      const revenueHeight = (data.revenue[index] / maxValue) * 100;
      const bonusHeight = (data.bonus[index] / maxValue) * 100;
      return `<div class="bar-chart__col"><span class="bar-chart__bar bar-chart__bar--revenue" style="--bar-height: ${revenueHeight}%"></span><span class="bar-chart__bar bar-chart__bar--bonus" style="--bar-height: ${bonusHeight}%"></span></div>`;
    })
    .join("");
  financialChartPlot.setAttribute(
    "aria-label",
    `Bar chart comparing referral revenue and referral bonus across ${data.labels.join(", ")}; revenue ranges from ${currencyFormatter.format(Math.min(...data.revenue))} to ${currencyFormatter.format(Math.max(...data.revenue))}.`,
  );

  financialChartAxis.innerHTML = data.labels.map((label) => `<span>${label}</span>`).join("");

  const totalRevenue = data.revenue.reduce((sum, value) => sum + value, 0);
  const totalBonus = data.bonus.reduce((sum, value) => sum + value, 0);
  if (financialChartCaption) financialChartCaption.textContent = data.caption;
  if (financialTotalRevenue) financialTotalRevenue.textContent = currencyFormatter.format(totalRevenue);
  if (financialTotalBonus) financialTotalBonus.textContent = currencyFormatter.format(totalBonus);
  if (financialRevenueTrend) financialRevenueTrend.textContent = data.trend;
}

financialPeriodFilter?.addEventListener("click", (event) => {
  const button = event.target.closest(".segmented-control__option");
  if (!button) return;

  financialPeriodFilter.querySelectorAll(".segmented-control__option").forEach((option) => {
    const isActive = option === button;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  renderFinancialTrends(button.dataset.period);
});

renderFinancialTrends("quarterly");
