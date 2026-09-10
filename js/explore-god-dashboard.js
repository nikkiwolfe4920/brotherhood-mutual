/**
 * ExploreGod CRM Dashboard — data + rendering for /ExploreGod-CRM-Dashboard.
 *
 * All colors are referenced by CSS custom property name (`var(--egd-stage-*)`,
 * defined in explore-god-dashboard.css) rather than duplicated as hex here, so
 * the palette stays single-sourced in the stylesheet. The sample data below
 * stands in for a real intake/CRM feed — see DESIGN.md for the page's scope.
 */

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

// ---------- Stage identity (fixed order — see explore-god-dashboard.css) ----------

const STAGES = [
  { id: "new", label: "New", var: "--egd-stage-new" },
  { id: "chatting", label: "Chatting", var: "--egd-stage-chatting" },
  { id: "formation", label: "Formation", var: "--egd-stage-formation" },
  { id: "discipleship", label: "Discipleship", var: "--egd-stage-discipleship" },
];

function stageVar(stageId) {
  const stage = STAGES.find((s) => s.id === stageId);
  return stage ? `var(${stage.var})` : "var(--egd-ink-muted)";
}

// A small deterministic hash so the same name always produces the same
// decorative values (roster caseload mix, avatar color) across reloads.
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

// ---------- Sparklines ----------

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

  // Hover layer: a single shared tooltip per sparkline, positioned at the
  // nearest sample to the pointer (dataviz skill — line charts ship a
  // crosshair/tooltip by default).
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

// ---------- Live intake queue ----------

const QUEUE_ROWS = [
  { name: "Maria Velasquez", quote: "I've been feeling empty lately and I don't know why.", waitMinutes: 3, aiSuggest: "Steven Cole" },
  { name: "James Okafor", quote: "My friend told me about Haven. I'm curious to learn more.", waitMinutes: 1, aiSuggest: "John Mwangi" },
  { name: "Ana Reyes", quote: "Going through a divorce. I used to go to church as a kid.", waitMinutes: 12, aiSuggest: "Josiah Bell" },
  { name: "Tomás Herrera", quote: "Just lost my job. Wondering if God actually cares.", waitMinutes: 5, aiSuggest: "David Osei" },
  { name: "Lina Santos", quote: "Hi, I saw your post about finding hope. I'd really like to talk.", waitMinutes: 2, aiSuggest: "Daniel Park" },
  { name: "Ravi Nair", quote: "I grew up Hindu and I'm open to understanding this more.", waitMinutes: 7, aiSuggest: "Ethan Brooks" },
].map((row, index) => ({
  ...row,
  id: `queue-${index}`,
  unassigned: true,
  mine: true,
}));

const ASSIGN_OPTIONS = ["Steven Cole", "John Mwangi", "David Osei", "Daniel Park", "Josiah Bell"];

function waitLevel(minutes) {
  if (minutes >= 10) return "critical";
  if (minutes >= 5) return "warning";
  return "good";
}

const queueList = document.getElementById("queue-list");
const unassignedCount = document.getElementById("unassigned-count");

function renderQueue(filter = "all") {
  const rows = QUEUE_ROWS.filter((row) => {
    if (filter === "unassigned") return row.unassigned;
    if (filter === "waiting") return row.waitMinutes >= 10;
    if (filter === "mine") return row.mine;
    return true;
  });

  queueList.innerHTML = rows
    .map((row) => {
      const stage = avatarStage(row.name);
      const level = waitLevel(row.waitMinutes);
      const assignedLabel = row.assignedTo ? `Assigned to ${escapeHtml(row.assignedTo)}` : "Assign to…";
      return `
        <li class="egd-queue-row${row.assignedTo ? " is-assigned" : ""}" data-id="${row.id}">
          <span class="egd-avatar" style="background: var(${stage.var})">${initials(row.name)}</span>
          <div class="egd-queue-row__who">
            <div class="egd-queue-row__name-line">
              <span class="egd-queue-row__name">${escapeHtml(row.name)}</span>
              <span class="egd-channel">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" opacity=".18"/><path d="M17 14.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5C9.3 9 8.8 7.8 8.6 7.3c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"/></svg>
                WhatsApp
              </span>
            </div>
            <p class="egd-queue-row__quote">"${escapeHtml(row.quote)}"</p>
          </div>
          <span class="egd-wait egd-wait--${level}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            waiting ${row.waitMinutes}m
          </span>
          <span class="egd-queue-row__meta">${row.assignedTo ? assignedLabel : `AI suggests: <strong>${escapeHtml(row.aiSuggest)}</strong>`}</span>
          <div class="egd-assign">
            <button class="egd-assign__btn" type="button" aria-expanded="false" aria-haspopup="menu">
              ${assignedLabel}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </div>
        </li>
      `;
    })
    .join("");

  const openCount = QUEUE_ROWS.filter((row) => !row.assignedTo).length;
  unassignedCount.textContent = `${openCount} unassigned`;
}

document.getElementById("queue-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#queue-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  renderQueue(tab.dataset.filter);
});

queueList.addEventListener("click", (event) => {
  const menuOption = event.target.closest(".egd-assign__option");
  if (menuOption) {
    const row = QUEUE_ROWS.find((r) => r.id === menuOption.closest("li").dataset.id);
    row.assignedTo = menuOption.dataset.name;
    const activeTab = document.querySelector('#queue-tabs [aria-selected="true"]');
    renderQueue(activeTab ? activeTab.dataset.filter : "all");
    return;
  }

  const trigger = event.target.closest(".egd-assign__btn");
  if (!trigger) return;
  const wasOpen = trigger.getAttribute("aria-expanded") === "true";
  document.querySelectorAll(".egd-assign__btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  document.querySelectorAll(".egd-assign__menu").forEach((menu) => menu.remove());
  if (wasOpen) return;

  trigger.setAttribute("aria-expanded", "true");
  const row = QUEUE_ROWS.find((r) => r.id === trigger.closest("li").dataset.id);
  const menu = document.createElement("div");
  menu.className = "egd-assign__menu";
  menu.setAttribute("role", "menu");
  menu.innerHTML = ASSIGN_OPTIONS.map(
    (name) => `
      <button class="egd-assign__option" type="button" role="menuitem" data-name="${escapeHtml(name)}">
        ${escapeHtml(name)}
        ${name === row.aiSuggest ? '<span class="egd-assign__option-tag">AI pick</span>' : ""}
      </button>
    `
  ).join("");
  trigger.parentElement.appendChild(menu);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".egd-assign")) return;
  document.querySelectorAll(".egd-assign__btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  document.querySelectorAll(".egd-assign__menu").forEach((menu) => menu.remove());
});

renderQueue();

// ---------- Regional journey funnel ----------

const FUNNEL_STAGES = [
  { stageId: "new", label: "New Contact", count: 312 },
  { stageId: "chatting", label: "Active Conversation", count: 248 },
  { stageId: "formation", label: "Christian Formation", count: 126 },
  { stageId: "discipleship", label: "Discipleship Journey", count: 58 },
];

const funnelBody = document.getElementById("funnel-body");
const funnelMax = FUNNEL_STAGES[0].count;

funnelBody.innerHTML = FUNNEL_STAGES.map((stage, index) => {
  const widthPct = ((stage.count / funnelMax) * 100).toFixed(1);
  const conversionPct = index === 0 ? 100 : Math.round((stage.count / FUNNEL_STAGES[index - 1].count) * 100);
  return `
    <div class="egd-funnel-stage">
      <span class="egd-funnel-stage__label" style="--stage-color: ${stageVar(stage.stageId)}">${escapeHtml(stage.label)}</span>
      <div class="egd-funnel-stage__track">
        <div class="egd-funnel-stage__fill" style="--stage-color: ${stageVar(stage.stageId)}" data-target="${widthPct}">
          <span class="egd-funnel-stage__pct">${conversionPct}%</span>
          <span class="egd-funnel-stage__count">${stage.count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}).join("");

// Grow the bars in on first paint rather than rendering pre-filled — a
// deliberate reveal, not a loading state, so it only needs to run once.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.querySelectorAll(".egd-funnel-stage__fill").forEach((fill, index) => {
      fill.style.transitionDelay = `${index * 90}ms`;
      fill.style.width = `${fill.dataset.target}%`;
    });
  });
});

// ---------- AI opportunities ----------

const AI_ITEMS = [
  {
    icon: "check",
    text: '6 new requests just came in — we recommend assigning to <strong>Steven</strong> and <strong>John</strong>.',
    meta: "They're online and have the lowest active load.",
    cta: "Apply",
    doneLabel: "Applied",
  },
  {
    icon: "bell",
    text: '3 seekers with <strong>David</strong> have gone quiet for 48h+.',
    meta: "Suggest a re-engagement nudge now.",
    cta: "Notify",
    doneLabel: "Notified",
  },
  {
    icon: "swap",
    text: '<strong>Marcus</strong> is at 95% capacity.',
    meta: "Consider redistributing 2 of his seekers.",
    cta: "Reassign",
    doneLabel: "Reassigned",
  },
  {
    icon: "insight",
    text: "Formation-stage seekers respond best to <strong>Josiah</strong>'s follow-up style.",
    meta: "40% faster progression on his cases.",
    cta: "View Insight",
    doneLabel: "Viewed",
  },
];

const AI_ICONS = {
  check: '<path d="M20 6 9 17l-5-5" />',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" />',
  swap: '<path d="m17 2 4 4-4 4" /><path d="M3 12v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v1a4 4 0 0 1-4 4H3" />',
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
});

// ---------- Team roster ----------

const ROSTER = [
  { name: "Steven Cole", load: 8 },
  { name: "John Mwangi", load: 7 },
  { name: "Marcus Reyes", role: "Manager", load: 9 },
  { name: "David Osei", load: 10 },
  { name: "Daniel Park", load: 6 },
  { name: "Ethan Brooks", load: 4 },
  { name: "Caleb Nguyen", load: 5 },
  { name: "Jordan Blake", load: 3 },
  { name: "Nathan Price", load: 9 },
  { name: "Micah Foster", load: 7 },
  { name: "Isaac Bennett", load: 2 },
  { name: "Elijah Ward", load: 8 },
  { name: "Samuel Grant", load: 6 },
  { name: "Andrew Kim", load: 7 },
  { name: "Peter Adjei", load: 4 },
  { name: "Thomas Reid", load: 9 },
  { name: "Gabriel Ortiz", load: 5 },
  { name: "Aaron Whitfield", load: 6 },
  { name: "Josiah Bell", role: "Top performer", load: 8 },
  { name: "Levi Marsh", load: 3 },
];

// Decorative caseload mix per rep (share of their open seekers in each
// stage) — deterministic per name so it doesn't reshuffle on reload.
function caseloadMix(name) {
  const seed = hashString(name);
  const cuts = [0, 0, 0]
    .map((_, i) => (seed * (i + 3)) % 97)
    .sort((a, b) => a - b);
  const bounds = [0, cuts[0], cuts[1], cuts[2], 97];
  return STAGES.map((stage, i) => ((bounds[i + 1] - bounds[i]) / 97) * 100);
}

document.getElementById("roster-list").innerHTML = ROSTER.map((person) => {
  const stage = avatarStage(person.name);
  const mix = caseloadMix(person.name);
  return `
    <li class="egd-roster-row">
      <span class="egd-roster-row__avatar" style="background: var(${stage.var})">${initials(person.name)}</span>
      <div class="egd-roster-row__body">
        <div class="egd-roster-row__name-line">
          <span class="egd-roster-row__name">${escapeHtml(person.name)}</span>
          ${person.role ? `<span class="egd-roster-row__role">${escapeHtml(person.role)}</span>` : ""}
          ${person.role === "Top performer" ? '<span class="egd-roster-row__tag">Top performer</span>' : ""}
        </div>
        <div class="egd-mix" role="img" aria-label="${escapeHtml(person.name)}'s caseload mix across stages">
          ${STAGES.map((s, i) => `<span class="egd-mix__seg" style="width: ${mix[i].toFixed(1)}%; background: ${stageVar(s.id)}"></span>`).join("")}
        </div>
      </div>
      <div class="egd-roster-row__load">
        <div class="egd-roster-row__load-value">${person.load}</div>
        <div class="egd-roster-row__load-of">of 10</div>
      </div>
    </li>
  `;
}).join("");

document.getElementById("roster-legend").innerHTML = STAGES.map(
  (stage) => `
    <span class="egd-roster-legend__item">
      <span class="egd-roster-legend__dot" style="--dot-color: var(${stage.var})"></span>
      ${escapeHtml(stage.label)}
    </span>
  `
).join("");
