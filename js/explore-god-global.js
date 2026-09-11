/**
 * OneHope CRM — Global Overview — data + rendering for /ExploreGod-Global.
 *
 * Mirrors the small-helper conventions already established in
 * explore-god-dashboard.js (escapeHtml/hashString/initials/renderSparkline
 * duplicated rather than shared — this codebase keeps one JS file per page,
 * see js/dashboard.js vs js/explore-god-dashboard.js) rather than factoring
 * out a shared utils module for what would only be a second use.
 *
 * Regions are intentionally placeholders ("#Region 1"…"#Region 8") — this is
 * a prototype and real region names haven't been defined yet. Region 6's
 * pipeline counts (312/248/126/58) intentionally match the Southeast Region
 * funnel on /ExploreGod-CRM-Dashboard, so the two pages tell one consistent
 * story rather than disagreeing about the same underlying data.
 */

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

// ---------- Stage identity (fixed order — see explore-god-dashboard.css) ----------

const STAGES = [
  { id: "new", label: "New Contact", var: "--egd-stage-new" },
  { id: "chatting", label: "Active Conversation", var: "--egd-stage-chatting" },
  { id: "formation", label: "Christian Formation", var: "--egd-stage-formation" },
  { id: "discipleship", label: "Discipleship Journey", var: "--egd-stage-discipleship" },
];

function stageVar(stageId) {
  const stage = STAGES.find((s) => s.id === stageId);
  return stage ? `var(${stage.var})` : "var(--egd-ink-muted)";
}

// A small deterministic hash so the same name always produces the same
// decorative values (lead avatar color) across reloads.
function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function avatarStage(name) {
  return STAGES[hashString(name) % STAGES.length];
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---------- Sparklines (KPI row — identical to explore-god-dashboard.js) ----------

let sparklineSeq = 0;

function renderSparkline(svg) {
  const points = svg.dataset.points.split(",").map(Number);
  const color = stageVar(svg.dataset.stage);
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
  const gradientId = `egd-spark-fill-${sparklineSeq}`;

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

document.querySelectorAll(".egd-sparkline").forEach(renderSparkline);

// ---------- Region data ----------

const GOAL_PCT = 60;

const REGIONS = [
  { id: "region-1", name: "#Region 1", lead: "Grace Adeyemi", missionaries: 38, stages: { new: 480, chatting: 360, formation: 240, discipleship: 168 } },
  { id: "region-2", name: "#Region 2", lead: "Wei Chen", missionaries: 22, stages: { new: 290, chatting: 210, formation: 150, discipleship: 80 } },
  { id: "region-3", name: "#Region 3", lead: "Priya Nair", missionaries: 45, stages: { new: 520, chatting: 402, formation: 288, discipleship: 190 } },
  { id: "region-4", name: "#Region 4", lead: "Lucas Silva", missionaries: 16, stages: { new: 210, chatting: 165, formation: 110, discipleship: 58 } },
  { id: "region-5", name: "#Region 5", lead: "Fatima Al-Sayed", missionaries: 29, stages: { new: 340, chatting: 260, formation: 175, discipleship: 96 } },
  { id: "region-6", name: "#Region 6", lead: "Noah Whitfield", missionaries: 33, stages: { new: 312, chatting: 248, formation: 126, discipleship: 58 } },
  { id: "region-7", name: "#Region 7", lead: "Mei Tanaka", missionaries: 51, stages: { new: 610, chatting: 470, formation: 320, discipleship: 224 } },
  { id: "region-8", name: "#Region 8", lead: "Samuel Otieno", missionaries: 19, stages: { new: 260, chatting: 198, formation: 132, discipleship: 61 } },
];

function conversionRate(region) {
  return (region.stages.discipleship / region.stages.formation) * 100;
}

function performanceTier(rate) {
  if (rate >= GOAL_PCT) return "good";
  if (rate >= 50) return "warning";
  return "critical";
}

function tierColorVar(tier) {
  if (tier === "good") return "var(--egd-good)";
  if (tier === "warning") return "var(--egd-warning)";
  return "var(--egd-critical)";
}

// ---------- Formation → Discipleship by region (ranked bar chart) ----------

const regionPerfBody = document.getElementById("region-perf-body");

regionPerfBody.innerHTML = [...REGIONS]
  .sort((a, b) => conversionRate(b) - conversionRate(a))
  .map((region) => {
    const rate = conversionRate(region);
    const tier = performanceTier(rate);
    return `
      <div class="egd-region-bar">
        <span class="egd-region-bar__label">${escapeHtml(region.name)}</span>
        <div class="egd-region-bar__track">
          <span class="egd-region-bar__goal" style="left: ${GOAL_PCT}%"></span>
          <div class="egd-region-bar__fill" style="width: ${rate.toFixed(1)}%; background: ${tierColorVar(tier)}">
            <span class="egd-region-bar__pct">${Math.round(rate)}%</span>
          </div>
        </div>
      </div>
    `;
  })
  .join("");

// ---------- AI recommendations ----------

const AI_ITEMS = [
  {
    icon: "bell",
    text: '<strong>#Region 6</strong> and <strong>#Region 8</strong> are both below the 50% conversion floor (46%).',
    meta: "Recommend a missionary follow-up cadence review in both regions.",
    cta: "Notify Regional Leads",
    doneLabel: "Notified",
  },
  {
    icon: "insight",
    text: '<strong>#Region 1</strong> and <strong>#Region 7</strong> lead all regions at 70% conversion.',
    meta: "Their formation-to-discipleship handoff process may be worth replicating elsewhere.",
    cta: "View Playbook",
    doneLabel: "Viewed",
  },
  {
    icon: "swap",
    text: '<strong>#Region 3</strong> has the highest missionary load relative to contacts in formation.',
    meta: "Consider redistributing online missionaries to under-staffed regions.",
    cta: "Reassign",
    doneLabel: "Reassigned",
  },
  {
    icon: "trend",
    text: 'Global formation → discipleship rate is 61%, just above the 60% goal.',
    meta: '<strong>#Region 2</strong>, <strong>#Region 4</strong>, and <strong>#Region 5</strong> dipped over the last 30 days.',
    cta: "Review Trend",
    doneLabel: "Reviewed",
  },
];

const AI_ICONS = {
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" />',
  swap: '<path d="m17 2 4 4-4 4" /><path d="M3 12v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v1a4 4 0 0 1-4 4H3" />',
  insight: '<circle cx="12" cy="12" r="9" /><path d="m14.5 9.5-2 5-5 2 2-5z" />',
  trend: '<path d="M7 17 17 7" /><path d="M8 7h9v9" />',
};

document.getElementById("ai-list").innerHTML = AI_ITEMS.map(
  (item, index) => `
    <li class="egd-ai-card" data-index="${index}">
      <p class="egd-ai-card__text">${item.text}</p>
      <p class="egd-ai-card__meta">${item.meta}</p>
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
});

// ---------- CSV export ----------

const CSV_HEADERS = [
  "Region",
  "Regional Lead",
  "Online Missionaries",
  "New Contacts",
  "Active Conversations",
  "In Formation",
  "In Discipleship Journey",
  "Formation → Discipleship Rate (%)",
];

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function regionToRow(region) {
  return [
    region.name,
    region.lead,
    region.missionaries,
    region.stages.new,
    region.stages.chatting,
    region.stages.formation,
    region.stages.discipleship,
    conversionRate(region).toFixed(1),
  ];
}

function toCSV(rows) {
  return [CSV_HEADERS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
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

document.getElementById("export-all-btn").addEventListener("click", () => {
  downloadCSV("onehope-global-regions.csv", toCSV(REGIONS.map(regionToRow)));
});

// ---------- Regions list (filter + sort + expand/export drill-down) ----------

const regionsList = document.getElementById("regions-list");
const sortBtn = document.getElementById("regions-sort-btn");

// Which rows are expanded survives a re-render (filter/sort change) so
// drilling into a region doesn't collapse it back out from under you.
const expandedIds = new Set();

function renderRegionsList() {
  const filter = document.querySelector('#regions-tabs [aria-selected="true"]').dataset.filter;
  const dir = sortBtn.dataset.dir;

  const rows = REGIONS.filter((region) => {
    const tier = performanceTier(conversionRate(region));
    if (filter === "good") return tier === "good";
    if (filter === "below") return tier !== "good";
    return true;
  }).sort((a, b) => (dir === "asc" ? 1 : -1) * (conversionRate(a) - conversionRate(b)));

  regionsList.innerHTML = rows
    .map((region) => {
      const rate = conversionRate(region);
      const tier = performanceTier(rate);
      const stage = avatarStage(region.lead);
      const isExpanded = expandedIds.has(region.id);
      return `
        <li class="egd-region-row" data-id="${region.id}">
          <div class="egd-region-row__summary">
            <button class="egd-region-row__toggle" type="button" aria-expanded="${isExpanded}" aria-controls="detail-${region.id}" aria-label="${isExpanded ? "Collapse" : "Expand"} ${escapeHtml(region.name)} details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
            <span class="egd-region-row__name">${escapeHtml(region.name)}</span>
            <span class="egd-region-row__lead">
              <span class="egd-avatar egd-avatar--sm" style="background: var(${stage.var})">${initials(region.lead)}</span>
              <span>${escapeHtml(region.lead)}</span>
            </span>
            <span class="egd-region-row__missionaries"><span class="visually-hidden">Online Missionaries: </span>${region.missionaries}</span>
            <span class="egd-region-row__conversion">
              <span class="egd-region-row__bar"><span class="egd-region-row__bar-fill" style="width: ${rate.toFixed(1)}%; background: ${tierColorVar(tier)}"></span></span>
              <span class="egd-region-row__pct egd-region-row__pct--${tier}"><span class="visually-hidden">Formation → Discipleship: </span>${Math.round(rate)}%</span>
            </span>
          </div>
          <div class="egd-region-row__detail" id="detail-${region.id}" ${isExpanded ? "" : "hidden"}>
            <div class="egd-region-detail__funnel">
              ${STAGES.map(
                (s) => `
                  <div class="egd-region-detail__stage">
                    <span class="egd-region-detail__stage-label" style="--stage-color: var(${s.var})">${s.label}</span>
                    <span class="egd-region-detail__stage-value">${region.stages[s.id].toLocaleString()}</span>
                  </div>
                `
              ).join("")}
            </div>
            <div class="egd-region-detail__meta">
              <div class="egd-region-detail__lead">
                <span class="egd-avatar" style="background: var(${stage.var})">${initials(region.lead)}</span>
                <div>
                  <strong>${escapeHtml(region.lead)}</strong>
                  <span>Regional Lead</span>
                </div>
              </div>
              <div class="egd-region-detail__missionaries"><strong>${region.missionaries}</strong> Online Missionaries</div>
              <button class="egd-export-btn egd-export-btn--region egd-region-detail__export" type="button" data-region="${region.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
                Export regional metrics
              </button>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
}

document.getElementById("regions-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#regions-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  renderRegionsList();
});

sortBtn.addEventListener("click", () => {
  const nextDir = sortBtn.dataset.dir === "asc" ? "desc" : "asc";
  sortBtn.dataset.dir = nextDir;
  sortBtn.setAttribute(
    "aria-label",
    `Sort by Formation → Discipleship rate, ${nextDir === "asc" ? "ascending" : "descending"}`
  );
  renderRegionsList();
});

regionsList.addEventListener("click", (event) => {
  const exportBtn = event.target.closest(".egd-export-btn--region");
  if (exportBtn) {
    const region = REGIONS.find((r) => r.id === exportBtn.dataset.region);
    downloadCSV(`onehope-${region.id}-metrics.csv`, toCSV([regionToRow(region)]));
    return;
  }

  const toggle = event.target.closest(".egd-region-row__toggle");
  if (!toggle) return;
  const id = toggle.closest(".egd-region-row").dataset.id;
  if (expandedIds.has(id)) {
    expandedIds.delete(id);
  } else {
    expandedIds.add(id);
  }
  renderRegionsList();
});

renderRegionsList();
