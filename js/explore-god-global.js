/**
 * OneHope CRM — Global Engagement Command Center — data + rendering for
 * /ExploreGod-Global.
 *
 * This file replaces the earlier "Global Overview" cross-region rollup with
 * a different product entirely — an AI-assisted intelligence center for a
 * global engagement lead (Bronwyn), not a bigger/filtered copy of the
 * regional coordinator's or program coordinator's dashboards. See
 * DESIGN.md's "Ninth page" note for the full rationale and COMPONENTS.md's
 * "Global Engagement Command Center" entry for the component/data breakdown.
 *
 * Same one-file-per-page convention as explore-god-dashboard.js and
 * explore-god-dashboard-2.js: small helpers (escapeHtml/hashString/initials/
 * renderSparkline/CTA_ARROW) are duplicated rather than imported, and every
 * panel is rendered from small in-file arrays standing in for a real
 * analytics/CRM feed — there is no backend here.
 */

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Purely decorative avatar coloring (conversation OM initials) — cycles
// through the same four pipeline-stage hues used elsewhere in the product,
// not a second palette, even though this page doesn't track pipeline stage.
const AVATAR_VARS = ["--egd-stage-new", "--egd-stage-chatting", "--egd-stage-formation", "--egd-stage-discipleship"];

function avatarColorVar(name) {
  return `var(${AVATAR_VARS[hashString(name) % AVATAR_VARS.length]})`;
}

const CTA_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>';

// ---------- Sparklines (identical technique to the other two pages, see
// their files for the full rationale) — colored by sentiment rather than
// pipeline stage, since this page's KPIs aren't staged data. ----------

let sparklineSeq = 0;

function renderSparkline(svg) {
  const points = svg.dataset.points.split(",").map(Number);
  const color = `var(--egd-${svg.dataset.sentiment})`;
  const width = 220;
  const height = 46;
  const padding = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  sparklineSeq += 1;
  const gradientId = `egd-global-spark-fill-${sparklineSeq}`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style="stop-color: ${color}; stop-opacity: 0.28" />
        <stop offset="100%" style="stop-color: ${color}; stop-opacity: 0" />
      </linearGradient>
    </defs>
    <path class="egd-sparkline__area" d="${areaPath}" style="fill: url(#${gradientId})" />
    <path class="egd-sparkline__line" d="${linePath}" style="stroke: ${color}" />
  `;

  const [lastX, lastY] = coords[coords.length - 1];
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("class", "egd-sparkline__dot");
  dot.setAttribute("cx", lastX.toFixed(1));
  dot.setAttribute("cy", lastY.toFixed(1));
  dot.setAttribute("r", "4");
  dot.style.fill = color;
  svg.appendChild(dot);

  const tooltip = document.createElement("div");
  tooltip.className = "egd-sparkline-tooltip";
  svg.parentElement.style.position = "relative";
  svg.parentElement.appendChild(tooltip);

  svg.addEventListener("mousemove", (event) => {
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let nearestDist = Infinity;
    coords.forEach(([x], index) => {
      const dist = Math.abs(x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });
    const [px, py] = coords[nearest];
    tooltip.textContent = points[nearest].toLocaleString();
    tooltip.style.left = `${(px / width) * rect.width}px`;
    tooltip.style.top = `${(py / height) * rect.height}px`;
    tooltip.classList.add("is-visible");
  });

  svg.addEventListener("mouseleave", () => tooltip.classList.remove("is-visible"));
}

// ---------- CSV export (real files, no backend — same technique the
// earlier Global Overview page used) ----------

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCSV(headers, rows) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ============================================================
// Needs Attention — the centerpiece. Three severities, each a single
// investigated finding (not a list of many rows) since at the global level
// each tier IS one finding worth Bronwyn's attention, with its own AI
// reasoning and a single next action — a different shape from the
// per-seeker Needs Attention list on /ExploreGod-CRM-Dashboard-2, reused
// only for the expand/collapse mechanics, not the item shape.
// ============================================================

const ATTENTION_ITEMS = [
  {
    id: "africa-quality",
    tier: "critical",
    title: "Africa — Conversation quality declining",
    desc: "Quality dropped from 91% → 76% over the last 30 days.",
    why: [
      "Conversations ending prematurely",
      "Low follow-through after the first reply",
      "OMs providing generic, less personalized responses",
      "Increased disagreement between seekers and OMs before disengaging",
    ],
    stats: [
      { label: "Quality", value: "76%", sentiment: "critical" },
      { label: "Response rate", value: "79%", sentiment: "critical" },
      { label: "Unanswered", value: "+18%", sentiment: "critical" },
    ],
    action: "Review conversations",
    conversationId: "18392",
  },
  {
    id: "hope-for-families",
    tier: "warning",
    title: "Campaign: “Hope for Families”",
    desc: "1,248 leads this period, ↑32% volume — but engagement hasn't kept pace.",
    why: [
      "Engaged lead rate is 18%, against an expected 31% for a campaign this size",
      "The Parenting topic is driving most of the added volume",
      "Parenting-topic conversation quality (74%) trails the campaign's Family topic (91%)",
    ],
    stats: [
      { label: "Leads", value: "1,248", sentiment: "accent" },
      { label: "Engaged rate", value: "18%", sentiment: "warning" },
      { label: "Expected", value: "31%", sentiment: "accent" },
    ],
    action: "Investigate campaign",
    scrollTarget: "#campaigns-title",
    expandCampaign: "hope-for-families",
  },
  {
    id: "outcome-integrity",
    tier: "caution",
    title: "Data Quality — possible outcome mismatches",
    desc: "47 outcomes may be incorrectly classified.",
    why: [
      'AI identified conversations marked "Accepted Christ" where the transcript reads more like a "Faith conversation"',
      "The pattern concentrates in a handful of campaigns and regions, not evenly across all conversations",
    ],
    stats: [
      { label: "Flagged", value: "47", sentiment: "caution" },
      { label: "Top-pattern confidence", value: "94%", sentiment: "caution" },
    ],
    action: "Review classifications",
    scrollTarget: "#outcomes-title",
  },
];

const attentionList = document.getElementById("attention-list");

attentionList.innerHTML = ATTENTION_ITEMS.map((tier, index) => {
  const detailId = `attn-detail-${tier.id}`;
  const expanded = index === 0; // heaviest tier open by default, same rationale as the other pages.
  const tierText = tier.tier === "critical" ? "critical" : `${tier.tier}-text`;
  return `
    <li class="egd-attn-row">
      <button
        class="egd-attn-row__summary"
        type="button"
        aria-expanded="${expanded}"
        aria-controls="${detailId}"
        style="--tier-color: var(--egd-${tier.tier}); --tier-soft: var(--egd-${tier.tier}-soft); --tier-text: var(--egd-${tierText})"
      >
        <span class="egd-attn-row__dot" aria-hidden="true"></span>
        <span class="egd-attn-row__body">
          <span class="egd-attn-row__title">${escapeHtml(tier.title)}</span>
          <span class="egd-attn-row__desc">${escapeHtml(tier.desc)}</span>
        </span>
        <span class="egd-attn-row__toggle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </button>
      <div class="egd-attn-row__detail" id="${detailId}" ${expanded ? "" : "hidden"}>
        <ul class="egd-insight-why">
          ${tier.why.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ul>
        <div class="egd-insight-stats">
          ${tier.stats
            .map(
              (stat) => `
            <span class="egd-insight-stat egd-insight-stat--${stat.sentiment}">
              <strong>${escapeHtml(stat.value)}</strong>
              <span>${escapeHtml(stat.label)}</span>
            </span>
          `
            )
            .join("")}
        </div>
        <button
          class="egd-btn-cta"
          type="button"
          data-action="${escapeHtml(tier.action)}"
          ${tier.conversationId ? `data-open-conversation="${tier.conversationId}"` : ""}
          ${tier.scrollTarget ? `data-scroll-to="${tier.scrollTarget}"` : ""}
          ${tier.expandCampaign ? `data-expand-campaign="${tier.expandCampaign}"` : ""}
        >
          ${escapeHtml(tier.action)} ${CTA_ARROW}
        </button>
      </div>
    </li>
  `;
}).join("");

attentionList.addEventListener("click", (event) => {
  const summary = event.target.closest(".egd-attn-row__summary");
  if (summary) {
    const expanded = summary.getAttribute("aria-expanded") === "true";
    summary.setAttribute("aria-expanded", String(!expanded));
    document.getElementById(summary.getAttribute("aria-controls")).hidden = expanded;
    return;
  }
  handleActionButton(event.target.closest("[data-open-conversation], [data-scroll-to], [data-expand-campaign]"));
});

// A single dispatcher for the small set of things a "Needs Attention"/AI-card
// CTA can do on this page (open the conversation review workspace, scroll to
// another section, or expand a specific campaign row there first) — reused
// by every panel below rather than each wiring its own click handler for the
// same three behaviors.
function handleActionButton(button) {
  if (!button) return;
  if (button.dataset.expandCampaign) {
    expandedCampaignIds.add(button.dataset.expandCampaign);
    renderCampaigns();
  }
  if (button.dataset.openConversation) {
    openReviewDialog(button.dataset.openConversation);
  }
  if (button.dataset.scrollTo) {
    scrollToSection(button.dataset.scrollTo);
  }
}

// ============================================================
// Global Health — AI summary + 7-metric KPI row
// ============================================================

const GLOBAL_SUMMARY = [
  "Africa has a 14% increase in unanswered conversations.",
  "India has a decline in active/engaging conversations.",
  "Two campaigns are generating high lead volume but unusually low engagement.",
];

document.getElementById("summary-list").innerHTML = GLOBAL_SUMMARY.map((line) => `<li>${escapeHtml(line)}</li>`).join("");

// `sentiment` decides delta color independent of arrow direction — a metric
// can go up and still be bad (Unanswered) or go down and still be bad
// (Response rate). `up`/`down` only picks the arrow glyph.
const GLOBAL_KPIS = [
  { label: "Unique seekers", value: "12,482", direction: "up", delta: "8%", sentiment: "good", points: "10200,10450,10680,10900,11150,11400,11700,11950,12100,12250,12350,12420,12482" },
  { label: "Conversations", value: "28,491", direction: "up", delta: "12%", sentiment: "good", points: "23800,24300,24900,25400,26000,26500,27000,27400,27800,28100,28300,28420,28491" },
  { label: "Response rate", value: "84%", direction: "down", delta: "3%", sentiment: "critical", points: "89,88,88,87,87,86,86,85,85,84,84,84,84" },
  { label: "Engaged leads", value: "7,284", direction: "up", delta: "6%", sentiment: "good", points: "6600,6680,6750,6820,6900,6980,7050,7120,7180,7220,7250,7270,7284" },
  { label: "Chat quality", value: "87%", direction: "up", delta: "4%", sentiment: "good", points: "82,83,83,84,84,85,85,86,86,86,87,87,87" },
  { label: "Unanswered", value: "1,284", direction: "up", delta: "18%", sentiment: "critical", points: "980,1010,1040,1070,1100,1130,1160,1190,1220,1245,1260,1272,1284" },
  { label: "Outcome accuracy", value: "93%", direction: "up", delta: "2%", sentiment: "good", points: "90,90,91,91,91,92,92,92,92,93,93,93,93" },
];

document.getElementById("global-kpis").innerHTML = GLOBAL_KPIS.map((stat) => {
  // Only the sentiment-mismatched case (an "up" delta that's actually bad
  // news) needs the extra modifier — a plain --up/--down already covers
  // every case where direction and sentiment agree.
  const deltaClass = stat.direction === "up" && stat.sentiment === "critical" ? "egd-stat__delta--up-critical" : `egd-stat__delta--${stat.direction}`;
  const arrow =
    stat.direction === "up"
      ? '<path d="M7 17 17 7" /><path d="M8 7h9v9" />'
      : '<path d="M7 7 17 17" /><path d="M8 17h9v-9" />';
  return `
    <article class="egd-stat">
      <div class="egd-stat__head">
        <span class="egd-stat__label">${escapeHtml(stat.label)}</span>
        <span class="egd-stat__delta ${deltaClass}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${arrow}</svg>
          ${escapeHtml(stat.delta)}
        </span>
      </div>
      <p class="egd-stat__value">${escapeHtml(stat.value)}</p>
      <svg class="egd-sparkline" data-sentiment="${stat.sentiment}" data-points="${stat.points}" viewBox="0 0 220 46" preserveAspectRatio="none" aria-hidden="true"></svg>
    </article>
  `;
}).join("");

document.querySelectorAll(".egd-sparkline").forEach(renderSparkline);

// ============================================================
// Regional Health matrix — Global → Region → Country/Language drill-down
// ============================================================

const REGIONS = [
  {
    id: "africa",
    name: "Africa",
    volume: 8420,
    response: 79,
    quality: 76,
    engagement: 21,
    tier: "critical",
    countries: [
      { name: "South Africa", language: "English", conversations: 1240, needingReview: 156, campaign: "Hope Campaign — “Finding Hope”", conversationId: "18392" },
      { name: "Nigeria", language: "English", conversations: 2180, needingReview: 210, campaign: "Hope for Families", conversationId: "31170" },
      { name: "Kenya", language: "Swahili / English", conversations: 1890, needingReview: 240, campaign: "Finding Hope", conversationId: "18392" },
    ],
  },
  {
    id: "india",
    name: "India",
    volume: 5210,
    response: 91,
    quality: 82,
    engagement: 26,
    tier: "warning",
    countries: [
      { name: "India", language: "Hindi", conversations: 3120, needingReview: 380, campaign: "New Beginnings", conversationId: "24601" },
      { name: "India", language: "English", conversations: 2090, needingReview: 210, campaign: "Hope for Families", conversationId: "24601" },
    ],
  },
  {
    id: "indonesia",
    name: "Indonesia",
    volume: 4820,
    response: 96,
    quality: 94,
    engagement: 39,
    tier: "good",
    countries: [{ name: "Indonesia", language: "Bahasa Indonesia", conversations: 4820, needingReview: 92, campaign: "Finding Hope", conversationId: "18392" }],
  },
  {
    id: "philippines",
    name: "Philippines",
    volume: 3210,
    response: 94,
    quality: 89,
    engagement: 34,
    tier: "good",
    countries: [
      { name: "Philippines", language: "English", conversations: 2010, needingReview: 58, campaign: "Where Are You?", conversationId: "31170" },
      { name: "Philippines", language: "Tagalog", conversations: 1200, needingReview: 41, campaign: "Finding Hope", conversationId: "18392" },
    ],
  },
];

const regionMatrixList = document.getElementById("region-matrix-list");
const expandedRegionIds = new Set();

function renderRegionMatrix() {
  regionMatrixList.innerHTML = REGIONS.map((region) => {
    const isExpanded = expandedRegionIds.has(region.id);
    return `
      <li class="egd-rmatrix-row" data-id="${region.id}">
        <button class="egd-rmatrix-row__summary" type="button" aria-expanded="${isExpanded}" aria-controls="region-detail-${region.id}">
          <span class="egd-rmatrix-row__toggle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </span>
          <span class="egd-rmatrix-row__name">${escapeHtml(region.name)}</span>
          <span class="egd-rmatrix-row__cell">${region.volume.toLocaleString()}</span>
          <span class="egd-rmatrix-row__cell">${region.response}%</span>
          <span class="egd-rmatrix-row__cell">${region.quality}%</span>
          <span class="egd-rmatrix-row__cell">${region.engagement}%</span>
          <span class="egd-attn-dot egd-attn-dot--${region.tier}" aria-hidden="true"></span>
          <span class="visually-hidden">${region.tier === "good" ? "On track" : region.tier === "warning" ? "Needs investigation" : "Needs attention"}</span>
        </button>
        <div class="egd-rmatrix-row__detail" id="region-detail-${region.id}" ${isExpanded ? "" : "hidden"}>
          <p class="egd-rmatrix-row__hint">Country / language breakdown — drill into a conversation without exporting a spreadsheet.</p>
          <ul class="egd-country-list">
            ${region.countries
              .map(
                (country) => `
              <li class="egd-country-row">
                <div class="egd-country-row__body">
                  <p class="egd-country-row__name">${escapeHtml(country.name)} · ${escapeHtml(country.language)}</p>
                  <p class="egd-country-row__meta">${country.conversations.toLocaleString()} conversations · ${country.needingReview} requiring review · ${escapeHtml(country.campaign)}</p>
                </div>
                <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-open-conversation="${country.conversationId}">
                  View flagged conversation ${CTA_ARROW}
                </button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      </li>
    `;
  }).join("");
}

regionMatrixList.addEventListener("click", (event) => {
  const summary = event.target.closest(".egd-rmatrix-row__summary");
  if (summary) {
    const id = summary.closest(".egd-rmatrix-row").dataset.id;
    if (expandedRegionIds.has(id)) {
      expandedRegionIds.delete(id);
    } else {
      expandedRegionIds.add(id);
    }
    renderRegionMatrix();
    return;
  }
  handleActionButton(event.target.closest("[data-open-conversation]"));
});

renderRegionMatrix();

document.getElementById("export-regions-btn").addEventListener("click", () => {
  const headers = ["Region", "Volume", "Response Rate (%)", "Quality (%)", "Engagement (%)"];
  const rows = REGIONS.map((r) => [r.name, r.volume, r.response, r.quality, r.engagement]);
  downloadCSV("onehope-global-regional-health.csv", toCSV(headers, rows));
});

// ============================================================
// Campaign Intelligence
// ============================================================

const CAMPAIGNS = [
  {
    id: "hope-for-families",
    name: "Hope for Families",
    leads: 1482,
    engagement: 22,
    quality: 84,
    traffic: [
      { source: "Facebook", count: 582 },
      { source: "Instagram", count: 421 },
      { source: "WhatsApp", count: 218 },
      { source: "Email", count: 261 },
    ],
    topics: [
      { name: "Family", seekers: 428, quality: 91 },
      { name: "Parenting", seekers: 392, quality: 74, flagged: true },
      { name: "Marriage", seekers: 311, quality: 88 },
      { name: "Other", seekers: 351, quality: 86 },
    ],
  },
  {
    id: "finding-hope",
    name: "Finding Hope",
    leads: 982,
    engagement: 37,
    quality: 91,
    traffic: [
      { source: "Instagram", count: 402 },
      { source: "Facebook", count: 318 },
      { source: "Email", count: 262 },
    ],
    topics: [
      { name: "Faith questions", seekers: 512, quality: 93 },
      { name: "Community", seekers: 280, quality: 89 },
      { name: "Other", seekers: 190, quality: 90 },
    ],
  },
  {
    id: "new-beginnings",
    name: "New Beginnings",
    leads: 640,
    engagement: 41,
    quality: 88,
    traffic: [
      { source: "WhatsApp", count: 340 },
      { source: "Facebook", count: 300 },
    ],
    topics: [
      { name: "Life change", seekers: 350, quality: 90 },
      { name: "Grief", seekers: 290, quality: 85 },
    ],
  },
  {
    id: "where-are-you",
    name: "Where Are You?",
    leads: 512,
    engagement: 29,
    quality: 79,
    traffic: [
      { source: "Instagram", count: 280 },
      { source: "Email", count: 232 },
    ],
    topics: [
      { name: "Doubt", seekers: 300, quality: 76, flagged: true },
      { name: "Belonging", seekers: 212, quality: 83 },
    ],
  },
];

const campaignList = document.getElementById("campaign-list");
const expandedCampaignIds = new Set();

function renderCampaigns() {
  campaignList.innerHTML = CAMPAIGNS.map((campaign) => {
    const isExpanded = expandedCampaignIds.has(campaign.id);
    const totalTraffic = campaign.traffic.reduce((sum, t) => sum + t.count, 0);
    return `
      <li class="egd-campaign-row" data-id="${campaign.id}">
        <button class="egd-campaign-row__summary" type="button" aria-expanded="${isExpanded}" aria-controls="campaign-detail-${campaign.id}">
          <span class="egd-rmatrix-row__toggle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </span>
          <span class="egd-campaign-row__name">${escapeHtml(campaign.name)}</span>
          <span class="egd-campaign-row__cell">${campaign.leads.toLocaleString()}</span>
          <span class="egd-campaign-row__cell">${campaign.engagement}%</span>
          <span class="egd-campaign-row__cell">${campaign.quality}%</span>
        </button>
        <div class="egd-campaign-row__detail" id="campaign-detail-${campaign.id}" ${isExpanded ? "" : "hidden"}>
          <p class="egd-campaign-row__subhead">${campaign.leads.toLocaleString()} unique seekers · traffic</p>
          <div class="egd-traffic-list">
            ${campaign.traffic
              .map(
                (t) => `
              <div class="egd-traffic-item">
                <span class="egd-traffic-item__bar"><span class="egd-traffic-item__fill" style="width: ${Math.round((t.count / totalTraffic) * 100)}%"></span></span>
                <span class="egd-traffic-item__label">${escapeHtml(t.source)}</span>
                <span class="egd-traffic-item__count">${t.count}</span>
              </div>
            `
              )
              .join("")}
          </div>
          <p class="egd-campaign-row__subhead">Topics &amp; conversation quality</p>
          <div class="egd-topic-list">
            ${campaign.topics
              .map(
                (topic) => `
              <div class="egd-topic-row">
                <span class="egd-topic-row__name">${escapeHtml(topic.name)}</span>
                <span class="egd-topic-row__seekers">${topic.seekers} seekers</span>
                <span class="egd-topic-row__bar"><span class="egd-topic-row__fill egd-topic-row__fill--${topic.flagged ? "warning" : "good"}" style="width: ${topic.quality}%"></span></span>
                <span class="egd-topic-row__quality${topic.flagged ? " egd-topic-row__quality--flagged" : ""}">${topic.quality}%${topic.flagged ? " ⚠️" : ""}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </li>
    `;
  }).join("");
}

renderCampaigns();

campaignList.addEventListener("click", (event) => {
  const summary = event.target.closest(".egd-campaign-row__summary");
  if (!summary) return;
  const id = summary.closest(".egd-campaign-row").dataset.id;
  if (expandedCampaignIds.has(id)) {
    expandedCampaignIds.delete(id);
  } else {
    expandedCampaignIds.add(id);
  }
  renderCampaigns();
});

// ============================================================
// Conversation Quality Center
// ============================================================

const QUALITY_BREAKDOWN = [
  { label: "Active & engaging", pct: 61, color: "--egd-good" },
  { label: "Active & ongoing", pct: 22, color: "--egd-stage-new" },
  { label: "Tapers off quickly", pct: 8, color: "--egd-caution" },
  { label: "No follow-through", pct: 5, color: "--egd-warning" },
  { label: "No response / spam", pct: 3, color: "--egd-critical" },
  { label: "Unmarked", pct: 1, color: "--egd-ink-muted" },
];

document.getElementById("quality-bar").innerHTML = QUALITY_BREAKDOWN.map(
  (seg) => `<span class="egd-quality-bar__seg" style="width: ${seg.pct}%; background: var(${seg.color})" title="${escapeHtml(seg.label)} — ${seg.pct}%"></span>`
).join("");

document.getElementById("quality-legend").innerHTML = QUALITY_BREAKDOWN.map(
  (seg) => `
    <li class="egd-quality-legend__item">
      <span class="egd-quality-legend__dot" style="background: var(${seg.color})" aria-hidden="true"></span>
      ${escapeHtml(seg.label)}
      <strong>${seg.pct}%</strong>
    </li>
  `
).join("");

document.getElementById("quality-panel").addEventListener("click", (event) => {
  handleActionButton(event.target.closest("[data-scroll-to], [data-open-conversation]"));
});

// ============================================================
// Outcome Integrity
// ============================================================

const OUTCOME_MISMATCHES = [
  { id: "om-1", recorded: "Accepted Christ", assessed: "Faith conversation", confidence: 94, conversationId: "18392" },
  { id: "om-2", recorded: "Connected to community", assessed: "Faith conversation", confidence: 89, conversationId: "24601" },
  { id: "om-3", recorded: "Faith conversation", assessed: "Initial engagement", confidence: 82, conversationId: "31170" },
];

const outcomeList = document.getElementById("outcome-list");

outcomeList.innerHTML = OUTCOME_MISMATCHES.map(
  (row) => `
    <li class="egd-outcome-row" data-id="${row.id}">
      <div class="egd-outcome-row__labels">
        <span class="egd-outcome-row__recorded">${escapeHtml(row.recorded)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
        <span class="egd-outcome-row__assessed">${escapeHtml(row.assessed)}</span>
      </div>
      <span class="egd-outcome-row__confidence">${row.confidence}% confidence</span>
      <button class="egd-outcome-row__view" type="button" data-open-conversation="${row.conversationId}">View conversation</button>
      <div class="egd-outcome-row__actions" data-resolved="false">
        <button class="egd-btn-cta" type="button" data-resolve="confirm">Confirm ${CTA_ARROW}</button>
        <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-resolve="keep">Keep classification</button>
      </div>
    </li>
  `
).join("");

outcomeList.addEventListener("click", (event) => {
  const openBtn = event.target.closest("[data-open-conversation]");
  if (openBtn) {
    openReviewDialog(openBtn.dataset.openConversation);
    return;
  }
  const resolveBtn = event.target.closest("[data-resolve]");
  if (!resolveBtn) return;
  const actions = resolveBtn.closest(".egd-outcome-row__actions");
  if (actions.dataset.resolved === "true") return;
  actions.dataset.resolved = "true";
  const label = resolveBtn.dataset.resolve === "confirm" ? "Reclassified as Faith conversation" : "Classification kept";
  actions.innerHTML = `
    <span class="egd-outcome-row__resolved">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      ${escapeHtml(label)}
    </span>
  `;
});

document.getElementById("export-outcomes-btn").addEventListener("click", () => {
  const headers = ["Recorded Outcome", "AI Assessment", "Confidence (%)"];
  const rows = OUTCOME_MISMATCHES.map((r) => [r.recorded, r.assessed, r.confidence]);
  downloadCSV("onehope-outcome-integrity.csv", toCSV(headers, rows));
});

// ============================================================
// Discipleship Intelligence
// ============================================================

const DISCIPLESHIP_REGIONS = [
  { region: "Africa", note: "Conversations frequently end after initial faith acknowledgment.", trend: "up" },
  { region: "India", note: "High initial engagement, low sustained follow-up.", trend: "up" },
  { region: "Philippines", note: "Strong response rate, moderate relational depth.", trend: "steady" },
];

document.getElementById("discipleship-regions").innerHTML = DISCIPLESHIP_REGIONS.map(
  (row) => `
    <div class="egd-disc-region">
      <p class="egd-disc-region__name">${escapeHtml(row.region)}</p>
      <p class="egd-disc-region__note">${escapeHtml(row.note)}</p>
    </div>
  `
).join("");

// ============================================================
// AI Insights & Coaching (sidebar)
// ============================================================

const AI_ITEMS = [
  {
    icon: "insight",
    text: "31% of conversations that taper off quickly share a common pattern: <strong>OM provides information → seeker responds → OM closes conversation.</strong>",
    meta: "Recommended coaching: train OMs to use an invitation-based close instead.",
    cta: "View 12 examples",
    doneLabel: "Examples opened",
  },
  {
    icon: "trend",
    text: "Discipleship opportunities increased in <strong>Africa</strong> and <strong>India</strong> this month.",
    meta: "Driven by more seekers acknowledging faith without a follow-up conversation.",
    cta: "View evidence",
    doneLabel: "Evidence viewed",
    scrollTarget: "#discipleship-title",
  },
  {
    icon: "bell",
    text: "Two campaigns are generating high lead volume but unusually low engagement.",
    meta: "Hope for Families and Where Are You? — both below their expected engaged-lead range.",
    cta: "Compare campaigns",
    doneLabel: "Compared",
    scrollTarget: "#campaigns-title",
  },
  {
    icon: "check",
    text: "47 conversations may have an outcome classification that doesn't match what was actually said.",
    meta: "Concentrated in Accepted Christ → Faith conversation mismatches.",
    cta: "Review classifications",
    doneLabel: "Opened",
    scrollTarget: "#outcomes-title",
  },
];

const AI_ICONS = {
  check: '<path d="M20 6 9 17l-5-5" />',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" />',
  trend: '<path d="M7 17 17 7" /><path d="M8 7h9v9" />',
  insight: '<circle cx="12" cy="12" r="9" /><path d="m14.5 9.5-2 5-5 2 2-5z" />',
};

document.getElementById("ai-list").innerHTML = AI_ITEMS.map(
  (item, index) => `
    <li class="egd-ai-card" data-index="${index}">
      <p class="egd-ai-card__text">${item.text}</p>
      <p class="egd-ai-card__meta">${escapeHtml(item.meta)}</p>
      <button class="egd-ai-card__cta" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AI_ICONS[item.icon]}</svg>
        <span>${escapeHtml(item.cta)}</span>
      </button>
    </li>
  `
).join("");

document.getElementById("ai-list").addEventListener("click", (event) => {
  const button = event.target.closest(".egd-ai-card__cta");
  if (!button || button.classList.contains("is-done")) return;
  const item = AI_ITEMS[Number(button.closest(".egd-ai-card").dataset.index)];
  button.classList.add("is-done");
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
    <span>${escapeHtml(item.doneLabel)}</span>
  `;
  if (item.scrollTarget) scrollToSection(item.scrollTarget);
});

// ============================================================
// Recent Investigations (sidebar)
// ============================================================

const INVESTIGATIONS = [
  { title: "Outcome mismatch review", meta: "Accepted Christ vs. Faith conversation", time: "Started 2 days ago", status: "In progress" },
  { title: "Campaign anomaly", meta: "Hope for Families engagement drop", time: "Started 5 days ago", status: "Awaiting response" },
  { title: "Quality decline", meta: "Africa region", time: "Started 1 week ago", status: "Coaching plan sent" },
  { title: "Unanswered conversations", meta: "Africa, +18%", time: "Opened yesterday", status: "New" },
];

document.getElementById("investigations-list").innerHTML = INVESTIGATIONS.map(
  (row) => `
    <li class="egd-investigation-row">
      <div class="egd-investigation-row__body">
        <p class="egd-investigation-row__title">${escapeHtml(row.title)}</p>
        <p class="egd-investigation-row__meta">${escapeHtml(row.meta)} · ${escapeHtml(row.time)}</p>
      </div>
      <span class="egd-investigation-row__status">${escapeHtml(row.status)}</span>
    </li>
  `
).join("");

// ============================================================
// Reporting Center (sidebar)
// ============================================================

const REPORTS = {
  weekly: [
    { name: "Lead volume & response rate" },
    { name: "Engagement & quality" },
    { name: "Campaign performance" },
    { name: "Regional exceptions" },
  ],
  monthly: [
    { name: "Global engagement report" },
    { name: "Regional performance" },
    { name: "Conversation quality" },
    { name: "Outcome integrity" },
    { name: "Discipleship trends" },
  ],
};

const reportList = document.getElementById("report-list");
const reportCustom = document.getElementById("report-custom");

function renderReports(filter) {
  if (filter === "custom") {
    reportList.hidden = true;
    reportCustom.hidden = false;
    return;
  }
  reportList.hidden = false;
  reportCustom.hidden = true;
  reportList.innerHTML = REPORTS[filter]
    .map(
      (report) => `
    <li class="egd-report-row">
      <span class="egd-report-row__name">${escapeHtml(report.name)}</span>
      <button class="egd-report-row__export" type="button" data-report="${escapeHtml(report.name)}" aria-label="Export ${escapeHtml(report.name)} as CSV">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
      </button>
    </li>
  `
    )
    .join("");
}

document.getElementById("report-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#report-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  renderReports(tab.dataset.filter);
});

reportList.addEventListener("click", (event) => {
  const button = event.target.closest(".egd-report-row__export");
  if (!button) return;
  // Every report is real, data-driven: whatever the Global Health / Regional
  // Health data currently is, not a canned static file — same "a static site
  // can genuinely produce a download" principle the earlier Global Overview
  // page established for its region export.
  const kpiRows = GLOBAL_KPIS.map((k) => [k.label, k.value, `${k.direction === "up" ? "+" : "-"}${k.delta}`]);
  const regionRows = REGIONS.map((r) => [r.name, r.volume, `${r.response}%`, `${r.quality}%`, `${r.engagement}%`]);
  const csv = [
    "Global Health", "", "",
    ...toCSV(["Metric", "Value", "Change"], kpiRows).split("\r\n"),
    "", "Regional Health", "", "",
    ...toCSV(["Region", "Volume", "Response", "Quality", "Engagement"], regionRows).split("\r\n"),
  ].join("\r\n");
  downloadCSV(`onehope-${button.dataset.report.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`, csv);
});

document.getElementById("report-build-btn").addEventListener("click", (event) => {
  const button = event.target;
  if (button.classList.contains("is-done")) return;
  button.classList.add("is-done");
  button.textContent = "Report queued — you'll be notified when it's ready";
});

document.getElementById("report-ask-ai-btn").addEventListener("click", () => {
  scrollToSection("#ask-title");
  askEngagementIntelligence("Why did engagement drop in Africa?");
});

renderReports("weekly");

// ============================================================
// Ask Engagement Intelligence
// ============================================================

const ASK_ANSWERS = {
  "Summarize Philippines English conversations from the last 30 days.": {
    summary: "Philippines · English conversations are healthy — a strong response rate and steady relational depth, with a small quality dip worth a light touch.",
    evidence: "Response rate held at 94%; conversation quality is 89%, slightly below the regional average; most conversations reach the “active & ongoing” stage rather than tapering off.",
    metrics: "2,010 conversations · 94% response rate · 89% quality · 34% engagement.",
    conversations: "12 conversations flagged for a quality review.",
    action: "No urgent coaching needed — spot-check the 12 flagged conversations and continue current OM practices.",
  },
  "Why did engagement drop in Africa?": {
    summary: "Africa's engagement decline traces to conversations ending prematurely and a rise in generic OM responses, compounded by a sharp increase in unanswered conversations.",
    evidence: "Conversation quality fell from 91% to 76% over 30 days; OMs are giving shorter, less personalized replies; unanswered conversations rose 18%; seekers are disagreeing with OMs more often before disengaging.",
    metrics: "Quality 76% (↓15pts) · Response rate 79% (↓8%) · Unanswered +18% · Engagement 21%.",
    conversations: "24 conversations flagged for review.",
    action: "Coordinate with Africa regional leadership on OM coaching around follow-through and invitation-based closes; review the 24 flagged conversations this week.",
    scrollTarget: "#attention-title",
  },
  "Which campaigns have high volume but low engagement?": {
    summary: "Two campaigns are generating strong lead volume without a matching rise in engaged leads — Hope for Families most notably.",
    evidence: "Hope for Families' lead volume is up 32%, but its engaged-lead rate (18%) is well below its expected range (31%); the Parenting topic within that campaign is the main driver, at 74% conversation quality against a 91% baseline for Family.",
    metrics: "Hope for Families — 1,482 leads, 22% engagement, 84% quality · Where Are You? — 512 leads, 29% engagement.",
    conversations: "View the Parenting topic's flagged conversations in Campaign Intelligence.",
    action: "Investigate why Parenting-topic conversations convert less often — review OM responses for that topic before increasing ad spend on either campaign.",
    scrollTarget: "#campaigns-title",
  },
  "Show me conversations where the outcome may be incorrect.": {
    summary: "47 conversations may be classified with an outcome that doesn't match what the seeker actually said.",
    evidence: 'The most common pattern is conversations marked "Accepted Christ" where the transcript reads more like a "Faith conversation" — the seeker expressed interest or uncertainty without a clear decision.',
    metrics: "47 flagged · 94% average confidence on the top mismatch pattern.",
    conversations: "3 representative conversations shown in Outcome Integrity, out of 47.",
    action: "Review the Outcome Integrity queue and confirm or keep each classification — start with the highest-confidence mismatches.",
    scrollTarget: "#outcomes-title",
  },
  "What are the biggest discipleship gaps globally?": {
    summary: "The largest gap is the drop-off between an initial faith acknowledgment and any sustained discipleship conversation, most visible in Africa and India.",
    evidence: "Africa's conversations frequently end right after initial faith acknowledgment; India shows high initial engagement but low sustained follow-up; the Philippines holds moderate relational depth despite a strong response rate.",
    metrics: "Discipleship opportunities identified in Africa and India, both trending up this month.",
    conversations: "See the Discipleship Intelligence panel for region-by-region detail.",
    action: "Train OMs in Africa and India on open-ended questioning, sustained relational engagement, and inviting seekers to continue the conversation rather than closing it after an initial acknowledgment.",
    scrollTarget: "#discipleship-title",
  },
};

const FALLBACK_ANSWER = {
  summary: "This prototype answers a fixed set of example questions for now.",
  evidence: "Try one of the example questions above, or ask about a specific region, campaign, or outcome classification using similar wording.",
  metrics: "—",
  conversations: "—",
  action: "Pick an example question to see the full Summary → Evidence → Metrics → Conversations → Recommended action answer.",
};

const askAnswerEl = document.getElementById("ask-answer");
const askInput = document.getElementById("ask-input");

function askEngagementIntelligence(question) {
  const answer = ASK_ANSWERS[question] || FALLBACK_ANSWER;
  askInput.value = question;
  askAnswerEl.hidden = false;
  askAnswerEl.innerHTML = `
    <p class="egd-ask-answer__question">“${escapeHtml(question)}”</p>
    <div class="egd-ask-answer__section"><span class="egd-ask-answer__label">Summary</span><p>${escapeHtml(answer.summary)}</p></div>
    <div class="egd-ask-answer__section"><span class="egd-ask-answer__label">Evidence</span><p>${escapeHtml(answer.evidence)}</p></div>
    <div class="egd-ask-answer__section"><span class="egd-ask-answer__label">Metrics</span><p>${escapeHtml(answer.metrics)}</p></div>
    <div class="egd-ask-answer__section"><span class="egd-ask-answer__label">Conversations</span><p>${escapeHtml(answer.conversations)}</p></div>
    <div class="egd-ask-answer__section egd-ask-answer__section--action"><span class="egd-ask-answer__label">Recommended action</span><p>${escapeHtml(answer.action)}</p></div>
  `;
  askAnswerEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.getElementById("ask-examples").addEventListener("click", (event) => {
  const chip = event.target.closest(".egd-ask-example");
  if (!chip) return;
  askEngagementIntelligence(chip.textContent.trim());
});

document.getElementById("ask-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = askInput.value.trim();
  if (!question) return;
  askEngagementIntelligence(question);
});

// ============================================================
// Conversation Review Workspace (shared <dialog>)
// ============================================================

const CONVERSATIONS = {
  18392: {
    seekerId: "#18392",
    om: "Grace M.",
    context: "South Africa · English · Hope Campaign — “Finding Hope”",
    timeline: "3 messages over 2 days",
    previous: "1 prior conversation (initial contact, 6 weeks ago)",
    overall: "Needs improvement",
    assessment: [
      { label: "Listening", value: "Moderate", tier: "warning" },
      { label: "Empathy", value: "Strong", tier: "good" },
      { label: "Follow-through", value: "Weak", tier: "warning" },
      { label: "Discipleship", value: "Opportunity", tier: "critical" },
      { label: "Conflict handling", value: "Appropriate", tier: "good" },
      { label: "Outcome classification", value: "Potential mismatch", tier: "warning" },
    ],
    explanation: "The seeker expressed uncertainty about faith, but the conversation moved quickly toward a conclusion without exploring their questions.",
    coaching: "Consider asking an open-ended question about what is creating uncertainty before introducing additional resources.",
    recorded: "Accepted Christ",
    aiAssessment: "Faith conversation",
  },
  24601: {
    seekerId: "#24601",
    om: "Priya N.",
    context: "India · Hindi · New Beginnings",
    timeline: "6 messages over 9 days",
    previous: "No prior conversations",
    overall: "Good, with one flag",
    assessment: [
      { label: "Listening", value: "Strong", tier: "good" },
      { label: "Empathy", value: "Strong", tier: "good" },
      { label: "Follow-through", value: "Moderate", tier: "warning" },
      { label: "Discipleship", value: "Opportunity", tier: "critical" },
      { label: "Conflict handling", value: "Appropriate", tier: "good" },
      { label: "Outcome classification", value: "Potential mismatch", tier: "warning" },
    ],
    explanation: "The seeker described a clear decision to follow Christ during the conversation, which wasn't reflected in the recorded outcome.",
    coaching: "When a seeker expresses a clear decision, record it as a faith conversation even if the discussion continues toward community connection.",
    recorded: "Connected to community",
    aiAssessment: "Faith conversation",
  },
  31170: {
    seekerId: "#31170",
    om: "Marco V.",
    context: "Hope for Families campaign · Parenting topic",
    timeline: "4 messages over 3 days",
    previous: "No prior conversations",
    overall: "Needs improvement",
    assessment: [
      { label: "Listening", value: "Weak", tier: "critical" },
      { label: "Empathy", value: "Moderate", tier: "warning" },
      { label: "Follow-through", value: "Weak", tier: "warning" },
      { label: "Discipleship", value: "Opportunity", tier: "critical" },
      { label: "Conflict handling", value: "Appropriate", tier: "good" },
      { label: "Outcome classification", value: "Accurate", tier: "good" },
    ],
    explanation: "The OM responded with general encouragement rather than engaging with the specific parenting challenge the seeker described.",
    coaching: "Reflect the seeker's specific situation back to them before offering encouragement or resources.",
    recorded: "Faith conversation",
    aiAssessment: "Faith conversation",
  },
};

const reviewDialog = document.getElementById("review-dialog");
let reviewLastTrigger = null;

function openReviewDialog(conversationId, trigger) {
  const record = CONVERSATIONS[conversationId];
  if (!record) return;
  reviewLastTrigger = trigger || document.activeElement;

  document.getElementById("review-seeker-id").textContent = `Seeker ${record.seekerId}`;
  document.getElementById("review-context").textContent = record.context;
  document.getElementById("review-om").innerHTML = `<span class="egd-avatar" style="width:32px;height:32px;font-size:11px;background:${avatarColorVar(record.om)}">${initials(record.om)}</span> ${escapeHtml(record.om)}`;
  document.getElementById("review-timeline").textContent = record.timeline;
  document.getElementById("review-previous").textContent = record.previous;
  document.getElementById("review-overall").textContent = record.overall;

  document.getElementById("review-assessment").innerHTML = record.assessment
    .map(
      (row) => `
    <li class="egd-review-assess__row">
      <span class="egd-review-assess__label">${escapeHtml(row.label)}</span>
      <span class="egd-review-assess__value egd-review-assess__value--${row.tier}">
        ${row.tier === "good" ? "✓" : row.tier === "warning" ? "⚠️" : "🔴"} ${escapeHtml(row.value)}
      </span>
    </li>
  `
    )
    .join("");

  document.getElementById("review-explanation").textContent = record.explanation;
  document.getElementById("review-coaching").textContent = record.coaching;
  document.getElementById("review-recorded").textContent = record.recorded;
  document.getElementById("review-ai-assessment").textContent = record.aiAssessment;

  const flagBtn = document.getElementById("review-flag-btn");
  flagBtn.classList.remove("is-done");
  flagBtn.textContent = "Flag for review";

  reviewDialog.showModal();
}

document.getElementById("review-flag-btn").addEventListener("click", (event) => {
  event.target.classList.add("is-done");
  event.target.textContent = "Flagged for review";
});

document.getElementById("review-close").addEventListener("click", () => reviewDialog.close());
reviewDialog.addEventListener("close", () => {
  reviewLastTrigger?.focus();
  reviewLastTrigger = null;
});
reviewDialog.addEventListener("click", (event) => {
  if (event.target === reviewDialog) reviewDialog.close();
});

// ============================================================
// Global Briefing dialog
// ============================================================

const briefingDialog = document.getElementById("briefing-dialog");
let briefingLastTrigger = null;

document.getElementById("generate-briefing-btn").addEventListener("click", (event) => {
  briefingLastTrigger = event.currentTarget;
  briefingDialog.showModal();
});

document.getElementById("briefing-close").addEventListener("click", () => briefingDialog.close());
briefingDialog.addEventListener("close", () => {
  briefingLastTrigger?.focus();
  briefingLastTrigger = null;
});
briefingDialog.addEventListener("click", (event) => {
  if (event.target === briefingDialog) briefingDialog.close();
});
document.getElementById("briefing-view-evidence").addEventListener("click", () => {
  briefingDialog.close();
  scrollToSection("#attention-title");
});

// ============================================================
// In-page section navigation — same "land the target heading just below the
// sticky topbar" technique dashboard-partner.js and
// explore-god-dashboard-2.js established, adapted for this page's window
// scroll (`.egd-scroll` has no overflow of its own here).
// ============================================================

const topbar = document.querySelector(".egd-topbar");
const SCROLL_OFFSET_GAP = 16;

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const topbarHeight = topbar?.getBoundingClientRect().height ?? 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: targetTop - topbarHeight - SCROLL_OFFSET_GAP, behavior: "smooth" });
}

document.querySelectorAll(".egd-section-nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToSection(link.getAttribute("href"));
  });
});
