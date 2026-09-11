/**
 * OneHope CRM — Team Engagement Operations — data + rendering for
 * /ExploreGod-team.
 *
 * A fourth lens on the same OneHope CRM, built for Siji — a team lead who
 * runs the India engagement team's day-to-day operations, not a regional
 * coordinator's assignment queue (/ExploreGod-CRM-Dashboard), a program
 * coordinator's per-missionary triage (/ExploreGod-CRM-Dashboard-2), or a
 * global intelligence lead's investigation queue (/ExploreGod-Global). Her
 * job is "run the team": claim/assign/close conversations, see who's
 * overloaded, cover shifts, and get resources into a conversation fast — see
 * DESIGN.md's "Eleventh page" note and COMPONENTS.md's "Team Engagement
 * Operations" entry for the full brief-to-component mapping.
 *
 * Same one-file-per-page convention as the other three pages: small helpers
 * (`escapeHtml`, `hashString`, `initials`, `renderSparkline`, `CTA_ARROW`) and
 * the shared `.egd-assign`/`.egd-btn-cta` interaction patterns are duplicated
 * rather than imported — this page never loads a sibling page's stylesheet,
 * only the shared `explore-god-dashboard.css` base plus its own file.
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

// Purely decorative avatar coloring — cycles through the same four
// pipeline-stage hues used elsewhere in the product, not a second palette.
const AVATAR_VARS = ["--egd-stage-new", "--egd-stage-chatting", "--egd-stage-formation", "--egd-stage-discipleship"];

function avatarColorVar(name) {
  return `var(${AVATAR_VARS[hashString(name) % AVATAR_VARS.length]})`;
}

const CTA_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>';

const CHANNEL_ICON = {
  WhatsApp:
    '<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" opacity=".18"/><path d="M17 14.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5C9.3 9 8.8 7.8 8.6 7.3c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"/>',
  Instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />',
  Facebook: '<path d="M14 9h3V6h-3a3 3 0 0 0-3 3v2H8v3h3v6h3v-6h3l1-3h-4V9a1 1 0 0 1 1-1z" />',
  SMS: '<path d="M4 5h16v10H8l-4 4z" />',
};

function channelIcon(channel) {
  const fillMode = channel === "WhatsApp" || channel === "Facebook" ? "currentColor" : "none";
  return `<svg viewBox="0 0 24 24" fill="${fillMode}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CHANNEL_ICON[channel] ?? CHANNEL_ICON.SMS}</svg>`;
}

// ---------- Sparklines (identical technique to the other three pages) ----------

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
  const gradientId = `egd-team-spark-fill-${sparklineSeq}`;

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
}

// ============================================================
// In-page section navigation — same topbar-offset scroll technique
// established by dashboard-partner.js/explore-god-dashboard-2.js/
// explore-god-global.js, reimplemented as this page's own function.
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

// ============================================================
// Today / Team Pulse
// ============================================================

const PULSE = [
  { label: "New conversations", value: "26", sentiment: "accent", points: "18,20,19,22,21,23,24,23,25,24,25,26,26" },
  { label: "Active conversations", value: "417", sentiment: "good", points: "380,384,388,392,395,398,402,405,408,410,413,415,417" },
  { label: "Unclaimed", value: "14", sentiment: "warning", points: "6,7,8,7,9,10,11,10,12,13,12,13,14" },
  { label: "Seekers responded", value: "18", sentiment: "critical", points: "4,5,6,8,9,10,12,13,14,15,16,17,18" },
  { label: "Expiring soon", value: "7", sentiment: "critical", points: "1,1,2,2,3,3,4,4,5,5,6,6,7" },
  { label: "Follow-ups due", value: "12", sentiment: "warning", points: "5,6,6,7,8,8,9,10,10,11,11,12,12" },
  { label: "Escalations", value: "3", sentiment: "caution", points: "0,0,1,1,1,2,2,2,2,3,3,3,3" },
  { label: "Closed today", value: "34", sentiment: "good", points: "2,4,7,10,13,15,18,21,24,27,29,32,34" },
];

document.getElementById("pulse-kpis").innerHTML = PULSE.map(
  (stat) => `
    <article class="egd-stat">
      <div class="egd-stat__head">
        <span class="egd-stat__label">${escapeHtml(stat.label)}</span>
      </div>
      <p class="egd-stat__value">${escapeHtml(stat.value)}</p>
      <svg class="egd-sparkline" data-sentiment="${stat.sentiment}" data-points="${stat.points}" viewBox="0 0 220 46" preserveAspectRatio="none" aria-hidden="true"></svg>
    </article>
  `
).join("");

document.querySelectorAll(".egd-sparkline").forEach(renderSparkline);

// ============================================================
// Needs Attention — clickable straight into the conversations
// ============================================================

const ATTENTION_ITEMS = [
  { tier: "critical", title: "Seeker Responded", count: 18, desc: "Seekers replied and are waiting on your team.", action: "Respond now", target: { type: "queue", filter: "responded" } },
  { tier: "critical", title: "Conversations Expiring", count: 7, desc: "WhatsApp's 24-hour window is closing on these.", action: "4 today →", target: { type: "scroll", selector: "#expiring-title" } },
  { tier: "warning", title: "No Response / Follow-up Needed", count: 9, desc: "Waiting on your team, and no reply has gone out yet.", action: "Follow up", target: { type: "scroll", selector: "#followup-title" } },
  { tier: "warning", title: "Unclaimed Conversations", count: 14, desc: "New conversations nobody has claimed yet.", action: "Assign", target: { type: "queue", filter: "unclaimed" } },
  { tier: "warning", title: "Stalled Conversations", count: 5, desc: "Active conversations that have gone quiet for days.", action: "Review", target: { type: "queue", filter: "stalled" } },
  { tier: "caution", title: "Escalations", count: 3, desc: "Flagged for a team lead's attention.", action: "Review", target: { type: "queue", filter: "escalated" } },
  { tier: "caution", title: "Needs Team Lead Review", count: 4, desc: "New-team-member conversations due for QA.", action: "Review →", target: { type: "scroll", selector: "#qa-title" } },
];

document.getElementById("attention-list").innerHTML = ATTENTION_ITEMS.map((item, index) => {
  const tierText = item.tier === "critical" ? "critical" : `${item.tier}-text`;
  return `
    <li class="egd-alert-row">
      <button
        class="egd-alert-row__btn"
        type="button"
        data-attn-index="${index}"
        style="--tier-color: var(--egd-${item.tier}); --tier-soft: var(--egd-${item.tier}-soft); --tier-text: var(--egd-${tierText})"
      >
        <span class="egd-alert-row__dot" aria-hidden="true"></span>
        <span class="egd-alert-row__body">
          <span class="egd-alert-row__title">${escapeHtml(item.title)}</span>
          <span class="egd-alert-row__desc">${escapeHtml(item.desc)}</span>
        </span>
        <span class="egd-alert-row__count">${item.count}</span>
        <span class="egd-alert-row__cta">
          ${escapeHtml(item.action)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </span>
      </button>
    </li>
  `;
}).join("");

document.getElementById("attention-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-attn-index]");
  if (!button) return;
  const item = ATTENTION_ITEMS[Number(button.dataset.attnIndex)];
  if (item.target.type === "queue") {
    setQueueFilter(item.target.filter);
    scrollToSection("#queue-title");
  } else {
    scrollToSection(item.target.selector);
  }
});

// ============================================================
// Conversation Queue
// ============================================================

const QUEUE = [
  { id: "2291", channel: "WhatsApp", language: "Hindi", topic: "Fear about the future", status: "new", assignedTo: null, waitMinutes: 22, priority: "high" },
  { id: "2288", channel: "WhatsApp", language: "Malayalam", topic: "Family conflict", status: "responded", assignedTo: "Priyanka Menon", waitMinutes: 4, priority: "high" },
  { id: "2277", channel: "Instagram", language: "English", topic: "Curious about Jesus", status: "active", assignedTo: "Arjun Nair", waitMinutes: 61, priority: "medium" },
  { id: "2265", channel: "WhatsApp", language: "Tamil", topic: "Grief after a loss", status: "expiring", assignedTo: "Divya Krishnan", waitMinutes: 95, expiresInMinutes: 40, priority: "high" },
  { id: "2240", channel: "WhatsApp", language: "Telugu", topic: "Marriage struggles", status: "new", assignedTo: null, waitMinutes: 55, priority: "medium" },
  { id: "2201", channel: "SMS", language: "Bengali", topic: "Asking about baptism", status: "follow-up", assignedTo: "Sarah Thomas", waitMinutes: 2880, priority: "medium" },
  { id: "2188", channel: "WhatsApp", language: "English", topic: "Job loss, feeling hopeless", status: "escalated", assignedTo: "Priyanka Menon", waitMinutes: 30, priority: "high" },
  { id: "2150", channel: "WhatsApp", language: "Hindi", topic: "Wants to know about salvation", status: "stalled", assignedTo: "Arjun Nair", waitMinutes: 8640, priority: "medium" },
  { id: "2129", channel: "Facebook", language: "Malayalam", topic: "Sharing a testimony", status: "active", assignedTo: "Divya Krishnan", waitMinutes: 180, priority: "low" },
  { id: "2098", channel: "WhatsApp", language: "Hindi", topic: "Depression, needs prayer", status: "new", assignedTo: null, waitMinutes: 70, priority: "high" },
  { id: "2077", channel: "WhatsApp", language: "Tamil", topic: "Expiring over the weekend", status: "expiring", assignedTo: "Sarah Thomas", waitMinutes: 200, expiresInMinutes: 2880, priority: "medium" },
  { id: "2050", channel: "WhatsApp", language: "English", topic: "First conversation — new team member", status: "active", assignedTo: "Daniel George", waitMinutes: 45, priority: "medium" },
  { id: "2033", channel: "WhatsApp", language: "Bengali", topic: "Responded again after silence", status: "responded", assignedTo: "Priyanka Menon", waitMinutes: 2, priority: "high" },
  { id: "1998", channel: "WhatsApp", language: "Hindi", topic: "Last reply was 9 days ago", status: "stalled", assignedTo: "Divya Krishnan", waitMinutes: 12960, priority: "low" },
];

const STATUS_LABEL = {
  new: "New",
  responded: "Responded",
  active: "Active",
  expiring: "Expiring",
  "follow-up": "Follow-up",
  escalated: "Escalated",
  stalled: "Stalled",
};

const STATUS_TIER = {
  new: "accent",
  responded: "critical",
  active: "good",
  expiring: "critical",
  "follow-up": "warning",
  escalated: "caution",
  stalled: "warning",
};

const PRIMARY_ACTION = {
  new: "Claim",
  responded: "Respond",
  active: "View",
  expiring: "Respond",
  "follow-up": "Follow up",
  escalated: "Review",
  stalled: "Review",
};

function formatWait(minutes) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

function waitLevel(minutes) {
  if (minutes >= 1440) return "critical";
  if (minutes >= 30) return "warning";
  return "good";
}

const ASSIGN_OPTIONS = ["Priyanka Menon", "Arjun Nair", "Divya Krishnan", "Sarah Thomas", "Daniel George"];

const queueList = document.getElementById("queue-list");
const selectedIds = new Set();
let activeQueueFilter = "all";

function setQueueFilter(filter) {
  activeQueueFilter = filter;
  document.querySelectorAll("#queue-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.filter === filter)));
  renderQueue();
}

function renderQueue() {
  const rows = QUEUE.filter((row) => {
    if (activeQueueFilter === "all") return true;
    if (activeQueueFilter === "unclaimed") return !row.assignedTo;
    return row.status === activeQueueFilter;
  });

  queueList.innerHTML = rows
    .map((row) => {
      const level = waitLevel(row.waitMinutes);
      const tier = STATUS_TIER[row.status] ?? "accent";
      const tierText = tier === "critical" ? "critical" : `${tier}-text`;
      return `
        <li class="egd-cq-row" data-id="${row.id}">
          <input class="egd-cq-row__check" type="checkbox" aria-label="Select conversation with Seeker #${row.id}" ${selectedIds.has(row.id) ? "checked" : ""} />
          <div class="egd-cq-row__who">
            <span class="egd-avatar" style="width:36px;height:36px;font-size:12px;background: ${avatarColorVar(row.id)}">S#</span>
            <div class="egd-cq-row__who-body">
              <span class="egd-cq-row__name">Seeker #${row.id}</span>
              <span class="egd-channel">${channelIcon(row.channel)} ${escapeHtml(row.channel)} · ${escapeHtml(row.language)}</span>
            </div>
          </div>
          <span class="egd-cq-row__topic">${escapeHtml(row.topic)}</span>
          <span class="egd-cq-row__assigned">${row.assignedTo ? escapeHtml(row.assignedTo) : '<span class="egd-cq-unclaimed">Unclaimed</span>'}</span>
          <span class="egd-cq-status" style="--tier-color: var(--egd-${tier}); --tier-soft: var(--egd-${tier}-soft); --tier-text: var(--egd-${tierText})">${escapeHtml(STATUS_LABEL[row.status] ?? row.status)}</span>
          <span class="egd-wait egd-wait--${level}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            ${row.status === "expiring" && row.expiresInMinutes != null ? `expires in ${formatWait(row.expiresInMinutes)}` : `waiting ${formatWait(row.waitMinutes)}`}
          </span>
          <span class="egd-priority egd-priority--${row.priority}">${row.priority}</span>
          <div class="egd-cq-row__actions">
            <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-primary-action="${row.id}">${PRIMARY_ACTION[row.status]}</button>
            <button class="egd-cq-more" type="button" aria-haspopup="menu" aria-expanded="false" data-more="${row.id}" aria-label="More actions for Seeker #${row.id}">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
            </button>
          </div>
        </li>
      `;
    })
    .join("");
}

document.getElementById("queue-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  setQueueFilter(tab.dataset.filter);
});

// ---------- Bulk select ----------

const bulkbar = document.getElementById("cq-bulkbar");
const bulkCount = document.getElementById("cq-bulk-count");

function updateBulkbar() {
  bulkbar.hidden = selectedIds.size === 0;
  bulkCount.textContent = `${selectedIds.size} selected`;
}

queueList.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".egd-cq-row__check");
  if (!checkbox) return;
  const id = checkbox.closest(".egd-cq-row").dataset.id;
  if (checkbox.checked) selectedIds.add(id);
  else selectedIds.delete(id);
  updateBulkbar();
});

document.getElementById("cq-bulk-clear").addEventListener("click", () => {
  selectedIds.clear();
  updateBulkbar();
  renderQueue();
});

bulkbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-bulk-outcome]");
  if (!button) return;
  const outcome = button.dataset.bulkOutcome;
  const closedIds = [...selectedIds];
  for (const id of closedIds) {
    const index = QUEUE.findIndex((row) => row.id === id);
    if (index !== -1) QUEUE.splice(index, 1);
  }
  selectedIds.clear();
  updateBulkbar();
  renderQueue();
  renderPulseClosedNote(closedIds.length, outcome);
});

// A brief, honest local confirmation (no backend to actually record the
// outcome) rather than a silent disappearance — Siji asked for exactly this
// bulk-close workflow because closing dozens of conversations one at a time
// was consuming significant time.
function renderPulseClosedNote(count, outcome) {
  if (count === 0) return;
  const note = document.createElement("div");
  note.className = "egd-bulk-toast";
  note.textContent = `Closed ${count} conversation${count === 1 ? "" : "s"} as “${outcome}.”`;
  document.body.appendChild(note);
  requestAnimationFrame(() => note.classList.add("is-visible"));
  setTimeout(() => {
    note.classList.remove("is-visible");
    setTimeout(() => note.remove(), 300);
  }, 2600);
}

// ---------- Row actions: primary button + "more" popover ----------

function closeRowMenus() {
  document.querySelectorAll(".egd-cq-more").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  document.querySelectorAll(".egd-assign__menu").forEach((menu) => menu.remove());
}

function findQueueRow(id) {
  return QUEUE.find((row) => row.id === id) || FOLLOWUPS.find((row) => row.id === id) || EXPIRING_ROWS.find((row) => row.id === id);
}

queueList.addEventListener("click", (event) => {
  const primary = event.target.closest("[data-primary-action]");
  if (primary) {
    openConversationDialog(primary.dataset.primaryAction, primary);
    return;
  }

  const more = event.target.closest(".egd-cq-more");
  if (more) {
    const wasOpen = more.getAttribute("aria-expanded") === "true";
    closeRowMenus();
    if (wasOpen) return;
    openRowMenu(more, more.dataset.more, () => renderQueue());
    return;
  }

  const menuOption = event.target.closest(".egd-assign__option");
  if (menuOption) {
    applyRowMenuAction(menuOption, () => renderQueue());
  }
});

// One shared "click outside closes the open popover" guard for every
// trigger that opens a body-portal `.egd-assign__menu` — the queue/expiring/
// follow-up row kebabs, the Triage "Reassign triage" button, and the
// Resource Library's "Send to conversation" picker all reuse the same
// popover mechanics (openRowMenu-style: append to <body>, position fixed).
// Without listing every trigger here, this same listener would immediately
// remove a menu a *different* trigger just opened, since it also receives
// that trigger's own click as it bubbles to `document`.
document.addEventListener("click", (event) => {
  if (event.target.closest(".egd-cq-more, .egd-assign__menu, #triage-reassign-btn, [data-send-id]")) return;
  closeRowMenus();
});
document.querySelector(".egd-scroll").addEventListener("scroll", closeRowMenus);

// Shared "more actions" popover — reused by the Conversation Queue, the
// Expiring Conversations list, and the Follow-Up list, since all three are
// the same interaction (Assign/Reassign/Escalate/Close/Follow up on a row)
// against the same underlying record shape.
function openRowMenu(trigger, id, rerender) {
  trigger.setAttribute("aria-expanded", "true");
  const row = findQueueRow(id);
  const menu = document.createElement("div");
  menu.className = "egd-assign__menu";
  menu.setAttribute("role", "menu");
  const actions = [
    ...(row.assignedTo ? ["Reassign"] : ["Assign"]),
    "Escalate",
    "Follow up",
    "Close",
  ];
  menu.innerHTML = actions
    .map((action) => `<button class="egd-assign__option" type="button" role="menuitem" data-row-id="${id}" data-row-action="${action}">${action}</button>`)
    .join("");
  document.body.appendChild(menu);
  const rect = trigger.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
  menu.dataset.rerenderOwner = "1";
  menu._rerender = rerender;
}

function applyRowMenuAction(optionButton, rerender) {
  const id = optionButton.dataset.rowId;
  const action = optionButton.dataset.rowAction;
  const row = findQueueRow(id);
  if (!row) return;

  if (action === "Assign" || action === "Reassign") {
    // A second-level picker: swap the menu for the OM list rather than a
    // native <select>, so "AI-free, just pick a name" stays one click.
    const menu = optionButton.closest(".egd-assign__menu");
    menu.innerHTML = ASSIGN_OPTIONS.map(
      (name) => `<button class="egd-assign__option" type="button" role="menuitem" data-row-id="${id}" data-om-name="${escapeHtml(name)}">${escapeHtml(name)}</button>`
    ).join("");
    menu.addEventListener("click", (event) => {
      const nameOption = event.target.closest("[data-om-name]");
      if (!nameOption) return;
      row.assignedTo = nameOption.dataset.omName;
      closeRowMenus();
      rerender();
    });
    return;
  }

  if (action === "Escalate") row.status = "escalated";
  if (action === "Close") {
    const index = QUEUE.findIndex((r) => r.id === id);
    if (index !== -1) QUEUE.splice(index, 1);
  }
  if (action === "Follow up") row.status = "follow-up";

  closeRowMenus();
  rerender();
}

// ============================================================
// Conversation quick view — single reusable dialog
// ============================================================

const RESOURCES_BY_TOPIC_KEYWORD = [
  { match: /fear/i, ids: ["r1", "r2", "r3"] },
  { match: /jesus|gospel|salvation/i, ids: ["r4", "r9"] },
  { match: /grief|loss/i, ids: ["r10"] },
  { match: /marriage/i, ids: ["r6"] },
  { match: /hope|hopeless|job/i, ids: ["r5"] },
  { match: /baptism|faith/i, ids: ["r8"] },
];

function recommendedResourcesFor(topic) {
  const match = RESOURCES_BY_TOPIC_KEYWORD.find((entry) => entry.match.test(topic));
  const ids = match ? match.ids : ["r4", "r8"];
  return ids.map((id) => RESOURCES.find((r) => r.id === id)).filter(Boolean);
}

const convoDialog = document.getElementById("convo-dialog");
let convoLastTrigger = null;

function openConversationDialog(action, trigger) {
  const id = trigger.dataset.primaryAction ?? action;
  const row = findQueueRow(id);
  if (!row) return;
  convoLastTrigger = trigger;

  document.getElementById("convo-seeker-id").textContent = `Seeker #${row.id}`;
  document.getElementById("convo-meta").textContent = `${row.channel} · ${row.language} · ${STATUS_LABEL[row.status] ?? row.status}`;
  document.getElementById("convo-quote").textContent = `“${row.topic}”`;

  document.getElementById("convo-facts").innerHTML = `
    <dt>Assigned OM</dt><dd>${row.assignedTo ? escapeHtml(row.assignedTo) : "Unclaimed"}</dd>
    <dt>Waiting</dt><dd>${formatWait(row.waitMinutes)}</dd>
    <dt>Priority</dt><dd class="egd-priority egd-priority--${row.priority}">${row.priority}</dd>
    ${row.expiresInMinutes != null ? `<dt>Expires in</dt><dd>${formatWait(row.expiresInMinutes)}</dd>` : ""}
  `;

  const recommended = recommendedResourcesFor(row.topic);
  document.getElementById("convo-resources").innerHTML = recommended
    .map(
      (res) => `
    <div class="egd-convo-resource" data-resource-id="${res.id}">
      <span class="egd-convo-resource__icon">${TYPE_ICON[res.type]}</span>
      <span class="egd-convo-resource__body">
        <span class="egd-convo-resource__title">${escapeHtml(res.title)}</span>
        <span class="egd-convo-resource__meta">${escapeHtml(res.language)}${res.duration ? ` · ${res.duration}` : ""}</span>
      </span>
      <button class="egd-convo-resource__send" type="button" data-send-resource="${res.id}">Send</button>
    </div>
  `
    )
    .join("");

  const actions = [];
  if (!row.assignedTo) actions.push({ label: "Claim", cta: true });
  if (row.assignedTo) actions.push({ label: "Respond", cta: true });
  actions.push({ label: "Escalate", cta: false });
  actions.push({ label: "Follow up", cta: false });
  actions.push({ label: "Close", cta: false });
  document.getElementById("convo-actions").innerHTML = actions
    .map(
      (a) =>
        `<button class="egd-btn-cta${a.cta ? "" : " egd-btn-cta--muted"}" type="button" data-convo-action="${a.label}">${escapeHtml(a.label)}${a.cta ? ` ${CTA_ARROW}` : ""}</button>`
    )
    .join("");
  document.getElementById("convo-actions").dataset.rowId = row.id;

  convoDialog.showModal();
}

document.getElementById("convo-resources").addEventListener("click", (event) => {
  const button = event.target.closest("[data-send-resource]");
  if (!button || button.classList.contains("is-sent")) return;
  button.classList.add("is-sent");
  button.textContent = "Sent ✓";
});

document.getElementById("convo-actions").addEventListener("click", (event) => {
  const button = event.target.closest("[data-convo-action]");
  if (!button) return;
  const id = document.getElementById("convo-actions").dataset.rowId;
  const row = findQueueRow(id);
  const action = button.dataset.convoAction;
  if (action === "Claim") row.assignedTo = "Priyanka Menon"; // claims to the logged-in OM's default pick
  if (action === "Escalate") row.status = "escalated";
  if (action === "Follow up") row.status = "follow-up";
  if (action === "Close") {
    const index = QUEUE.findIndex((r) => r.id === id);
    if (index !== -1) QUEUE.splice(index, 1);
  }
  convoDialog.close();
  renderQueue();
  renderExpiring();
  renderFollowups();
});

document.getElementById("convo-close").addEventListener("click", () => convoDialog.close());
convoDialog.addEventListener("close", () => {
  convoLastTrigger?.focus();
  convoLastTrigger = null;
});
convoDialog.addEventListener("click", (event) => {
  if (event.target === convoDialog) convoDialog.close();
});

renderQueue();

// ============================================================
// Team Workload
// ============================================================

const TEAM = [
  { name: "Priyanka Menon", status: "online", active: 142, new: 4, waiting: 8, needsAction: 6, avgResponse: "4m", workload: "healthy" },
  { name: "Arjun Nair", status: "online", active: 118, new: 2, waiting: 5, needsAction: 4, avgResponse: "6m", workload: "healthy" },
  { name: "Divya Krishnan", status: "online", active: 157, new: 8, waiting: 7, needsAction: 8, avgResponse: "11m", workload: "high" },
  { name: "Sarah Thomas", status: "break", active: 96, new: 3, waiting: 4, needsAction: 3, avgResponse: "5m", workload: "healthy" },
  { name: "Daniel George", status: "offline", active: 60, new: 1, waiting: 2, needsAction: 1, avgResponse: "3m", workload: "healthy" },
];

const WORKLOAD_LABEL = { healthy: "Healthy", elevated: "Elevated", high: "High" };

document.getElementById("workload-list").innerHTML = TEAM.map((person) => `
  <li class="egd-workload-row" data-name="${escapeHtml(person.name)}">
    <div class="egd-workload-row__who">
      <span class="egd-avatar" style="background: ${avatarColorVar(person.name)}">${initials(person.name)}</span>
      <span class="egd-workload-row__who-text">
        <span class="egd-workload-row__name">${escapeHtml(person.name)}</span>
        <span class="egd-status${person.status === "online" ? " egd-status--online" : ""}">${person.status === "online" ? "Online" : person.status === "break" ? "On break" : "Off shift"}</span>
      </span>
    </div>
    <span class="egd-workload-row__cell">${person.active}</span>
    <span class="egd-workload-row__cell">${person.new}</span>
    <span class="egd-workload-row__cell">${person.waiting}</span>
    <span class="egd-workload-row__cell">${person.needsAction}</span>
    <span class="egd-workload-row__cell">${person.avgResponse}</span>
    <span class="egd-load egd-load--${person.workload === "high" ? "heavy" : person.workload === "elevated" ? "moderate" : "light"}">${WORKLOAD_LABEL[person.workload]}</span>
    <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-reassign-om="${escapeHtml(person.name)}">Reassign</button>
  </li>
`).join("");

document.getElementById("workload-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-reassign-om]");
  if (!button) return;
  scrollToSection("#queue-title");
});

// ============================================================
// Shift & Coverage
// ============================================================

document.getElementById("shift-body").innerHTML = `
  <div class="egd-shift-card">
    <p class="egd-shift-card__label">Current Shift — Morning (7:00 AM–3:00 PM IST)</p>
    <p class="egd-shift-card__row"><strong>Working:</strong> Priyanka, Arjun, Divya, Sarah (triage)</p>
    <p class="egd-shift-card__row"><strong>Handling triage:</strong> Sarah Thomas</p>
    <p class="egd-shift-card__row"><strong>Handling existing conversations:</strong> Priyanka, Arjun, Divya</p>
    <p class="egd-shift-card__row"><strong>Incoming volume:</strong> Moderate — 4 new in the last hour</p>
    <div class="egd-coverage-meter" role="img" aria-label="Coverage level: good, 3 of 3 expected OMs online">
      <span class="egd-coverage-meter__fill" style="width: 100%"></span>
    </div>
    <p class="egd-shift-card__coverage">Coverage: <strong style="color: var(--egd-good-text)">Good</strong></p>
  </div>
  <div class="egd-shift-card egd-shift-card--next">
    <p class="egd-shift-card__label">Next Shift — Afternoon (3:00 PM–11:00 PM IST)</p>
    <p class="egd-shift-card__row"><strong>Scheduled:</strong> Daniel George, Meera Iyer</p>
    <p class="egd-shift-card__row"><strong>18</strong> conversations requiring follow-up</p>
    <p class="egd-shift-card__row"><strong>4</strong> conversations expiring before shift begins</p>
    <p class="egd-shift-card__handoff">Handoff: prioritize the 4 expiring conversations and Divya's overflow before starting new triage.</p>
  </div>
`;

// ============================================================
// Triage Management
// ============================================================

function renderTriage() {
  document.getElementById("triage-body").innerHTML = `
    <div class="egd-triage-stats">
      <div><strong>26</strong><span>New</span></div>
      <div><strong>14</strong><span>Unclaimed</span></div>
      <div><strong>12</strong><span>Claimed</span></div>
    </div>
    <p class="egd-triage-row"><strong>Current triage owner</strong><span id="triage-current">${escapeHtml(triageState.current)}</span></p>
    <p class="egd-triage-row"><strong>Next triage</strong><span>${escapeHtml(triageState.next)} · 2:00 PM</span></p>
    <button class="egd-btn-cta egd-btn-cta--muted" type="button" id="triage-reassign-btn">Reassign triage</button>
  `;
}

const triageState = { current: "Sarah Thomas", next: "Daniel George" };
renderTriage();

document.getElementById("triage-body").addEventListener("click", (event) => {
  const button = event.target.closest("#triage-reassign-btn");
  if (!button) return;
  const wasOpen = button.getAttribute("aria-expanded") === "true";
  closeRowMenus();
  if (wasOpen) return;
  button.setAttribute("aria-expanded", "true");
  const menu = document.createElement("div");
  menu.className = "egd-assign__menu";
  menu.setAttribute("role", "menu");
  menu.innerHTML = ASSIGN_OPTIONS.map(
    (name) => `<button class="egd-assign__option" type="button" role="menuitem" data-triage-om="${escapeHtml(name)}">${escapeHtml(name)}</button>`
  ).join("");
  document.body.appendChild(menu);
  const rect = button.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.left = `${rect.left}px`;
  menu.addEventListener("click", (event2) => {
    const option = event2.target.closest("[data-triage-om]");
    if (!option) return;
    triageState.current = option.dataset.triageOm;
    closeRowMenus();
    renderTriage();
  });
});

// ============================================================
// Expiring Conversations
// ============================================================

const EXPIRING_ROWS = [
  { id: "2265", bucket: "hour", channel: "WhatsApp", language: "Tamil", topic: "Grief after a loss", assignedTo: "Divya Krishnan", waitMinutes: 95, expiresInMinutes: 40, priority: "high", status: "expiring" },
  { id: "2310", bucket: "hour", channel: "WhatsApp", language: "Hindi", topic: "Anxious about an exam", assignedTo: "Arjun Nair", waitMinutes: 60, expiresInMinutes: 55, priority: "medium", status: "expiring" },
  { id: "2298", bucket: "today", channel: "WhatsApp", language: "Malayalam", topic: "Wants prayer for healing", assignedTo: null, waitMinutes: 300, expiresInMinutes: 340, priority: "high", status: "expiring" },
  { id: "2260", bucket: "today", channel: "WhatsApp", language: "English", topic: "Follow-up on last week's talk", assignedTo: "Priyanka Menon", waitMinutes: 420, expiresInMinutes: 500, priority: "medium", status: "expiring" },
  { id: "2077", bucket: "weekend", channel: "WhatsApp", language: "Tamil", topic: "Expiring over the weekend", assignedTo: "Sarah Thomas", waitMinutes: 200, expiresInMinutes: 2880, priority: "medium", status: "expiring" },
  { id: "2044", bucket: "weekend", channel: "WhatsApp", language: "Telugu", topic: "Marriage struggles, second reply", assignedTo: null, waitMinutes: 600, expiresInMinutes: 3600, priority: "high", status: "expiring" },
  { id: "1980", bucket: "tomorrow", channel: "WhatsApp", language: "Bengali", topic: "Asked for a Bible reading plan", assignedTo: "Divya Krishnan", waitMinutes: 700, expiresInMinutes: 1500, priority: "low", status: "expiring" },
  { id: "1955", bucket: "expired", channel: "WhatsApp", language: "Hindi", topic: "No reply reached in time", assignedTo: "Arjun Nair", waitMinutes: 1500, expiresInMinutes: -60, priority: "high", status: "expiring" },
];

const EXPIRING_BUCKETS = [
  { id: "hour", label: "Within 1 hour" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "weekend", label: "Weekend" },
  { id: "expired", label: "Already expired" },
];

let activeExpiringBucket = "hour";

function renderCompactRow(row) {
  const level = waitLevel(row.waitMinutes);
  return `
    <li class="egd-cq-row egd-cq-row--compact" data-id="${row.id}">
      <div class="egd-cq-row__who">
        <span class="egd-avatar" style="width:32px;height:32px;font-size:11px;background: ${avatarColorVar(row.id)}">S#</span>
        <div class="egd-cq-row__who-body">
          <span class="egd-cq-row__name">Seeker #${row.id}</span>
          <span class="egd-channel">${channelIcon(row.channel)} ${escapeHtml(row.channel)} · ${escapeHtml(row.language)}</span>
        </div>
      </div>
      <span class="egd-cq-row__topic">${escapeHtml(row.topic)}</span>
      <span class="egd-cq-row__assigned">${row.assignedTo ? escapeHtml(row.assignedTo) : '<span class="egd-cq-unclaimed">Unclaimed</span>'}</span>
      <span class="egd-wait egd-wait--${row.expiresInMinutes != null && row.expiresInMinutes < 0 ? "critical" : level}">
        ${row.expiresInMinutes != null ? (row.expiresInMinutes < 0 ? "expired" : `expires in ${formatWait(row.expiresInMinutes)}`) : `waiting ${formatWait(row.waitMinutes)}`}
      </span>
      <span class="egd-priority egd-priority--${row.priority}">${row.priority}</span>
      <div class="egd-cq-row__actions">
        <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-primary-action="${row.id}">Respond</button>
        <button class="egd-cq-more" type="button" aria-haspopup="menu" aria-expanded="false" data-more="${row.id}" aria-label="More actions for Seeker #${row.id}">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
        </button>
      </div>
    </li>
  `;
}

function renderExpiring() {
  document.getElementById("expiring-buckets").innerHTML = EXPIRING_BUCKETS.map((bucket) => {
    const count = EXPIRING_ROWS.filter((r) => r.bucket === bucket.id).length;
    return `
      <button class="egd-tab" type="button" role="tab" aria-selected="${bucket.id === activeExpiringBucket}" data-bucket="${bucket.id}">
        ${escapeHtml(bucket.label)} <span class="egd-tab__count">${count}</span>
      </button>
    `;
  }).join("");

  document.getElementById("expiring-list").innerHTML = EXPIRING_ROWS.filter((r) => r.bucket === activeExpiringBucket).map(renderCompactRow).join("")
    || `<li class="egd-empty-row">Nothing in this bucket right now.</li>`;
}

document.getElementById("expiring-buckets").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-bucket]");
  if (!tab) return;
  activeExpiringBucket = tab.dataset.bucket;
  renderExpiring();
});

document.getElementById("expiring-list").addEventListener("click", (event) => {
  const primary = event.target.closest("[data-primary-action]");
  if (primary) {
    openConversationDialog(primary.dataset.primaryAction, primary);
    return;
  }
  const more = event.target.closest(".egd-cq-more");
  if (more) {
    const wasOpen = more.getAttribute("aria-expanded") === "true";
    closeRowMenus();
    if (wasOpen) return;
    openRowMenu(more, more.dataset.more, renderExpiring);
    return;
  }
  const menuOption = event.target.closest(".egd-assign__option");
  if (menuOption) applyRowMenuAction(menuOption, renderExpiring);
});

renderExpiring();

// ============================================================
// Follow-Up
// ============================================================

const FOLLOWUPS = [
  { id: "2201", channel: "SMS", language: "Bengali", topic: "Asking about baptism", assignedTo: "Sarah Thomas", waitMinutes: 2880, priority: "medium", category: "waiting-om", status: "follow-up" },
  { id: "2410", channel: "WhatsApp", language: "Hindi", topic: "Due for a check-in today", assignedTo: "Priyanka Menon", waitMinutes: 600, priority: "medium", category: "due-today", status: "follow-up" },
  { id: "2388", channel: "WhatsApp", language: "Tamil", topic: "Overdue by two days", assignedTo: "Arjun Nair", waitMinutes: 2880, priority: "high", category: "overdue", status: "follow-up" },
  { id: "2372", channel: "WhatsApp", language: "Malayalam", topic: "No reply sent since claiming", assignedTo: "Divya Krishnan", waitMinutes: 1440, priority: "medium", category: "no-response", status: "follow-up" },
  { id: "2350", channel: "WhatsApp", language: "English", topic: "Seeker said they'd write back", assignedTo: "Priyanka Menon", waitMinutes: 4320, priority: "low", category: "waiting-seeker", status: "follow-up" },
  { id: "2318", channel: "WhatsApp", language: "Telugu", topic: "6-month relationship, high trust", assignedTo: "Divya Krishnan", waitMinutes: 720, priority: "high", category: "long-running", status: "follow-up" },
  { id: "2299", channel: "WhatsApp", language: "Hindi", topic: "Considering baptism — high priority", assignedTo: "Arjun Nair", waitMinutes: 300, priority: "high", category: "high-priority", status: "follow-up" },
  { id: "2287", channel: "WhatsApp", language: "Bengali", topic: "Waiting on a scripture reference", assignedTo: "Sarah Thomas", waitMinutes: 180, priority: "low", category: "waiting-om", status: "follow-up" },
];

let activeFollowupFilter = "all";

function renderFollowups() {
  const rows = FOLLOWUPS.filter((r) => activeFollowupFilter === "all" || r.category === activeFollowupFilter);
  document.getElementById("followup-list").innerHTML = rows.map(renderCompactRow).join("")
    || `<li class="egd-empty-row">Nothing in this filter right now.</li>`;
}

document.getElementById("followup-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#followup-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  activeFollowupFilter = tab.dataset.filter;
  renderFollowups();
});

document.getElementById("followup-list").addEventListener("click", (event) => {
  const primary = event.target.closest("[data-primary-action]");
  if (primary) {
    openConversationDialog(primary.dataset.primaryAction, primary);
    return;
  }
  const more = event.target.closest(".egd-cq-more");
  if (more) {
    const wasOpen = more.getAttribute("aria-expanded") === "true";
    closeRowMenus();
    if (wasOpen) return;
    openRowMenu(more, more.dataset.more, renderFollowups);
    return;
  }
  const menuOption = event.target.closest(".egd-assign__option");
  if (menuOption) applyRowMenuAction(menuOption, renderFollowups);
});

renderFollowups();

// ============================================================
// Team QA / Conversation Review
// ============================================================

const QA_QUEUE = [
  { id: "qa-1", conversationId: "2050", reason: "New team member", om: "Daniel George", note: "Daniel's 3rd week — first conversations still need a second set of eyes." },
  { id: "qa-2", conversationId: "2188", reason: "Escalated", om: "Priyanka Menon", note: "Escalated for a difficult disclosure — review before closing the loop." },
  { id: "qa-3", conversationId: "2129", reason: "Random QA sample", om: "Divya Krishnan", note: "Routine sample from this week's rotation." },
  { id: "qa-4", conversationId: "2277", reason: "Needs coaching", om: "Arjun Nair", note: "Response time has been slipping on formation-stage conversations." },
];

document.getElementById("qa-list").innerHTML = QA_QUEUE.map(
  (item) => `
    <li class="egd-qa-row" data-id="${item.id}" data-conversation="${item.conversationId}">
      <span class="egd-qa-row__tag">${escapeHtml(item.reason)}</span>
      <div class="egd-qa-row__body">
        <span class="egd-qa-row__conv">Seeker #${item.conversationId} · with ${escapeHtml(item.om)}</span>
        <span class="egd-qa-row__note">${escapeHtml(item.note)}</span>
      </div>
      <button class="egd-btn-cta egd-btn-cta--muted" type="button" data-qa-review="${item.id}">Review</button>
    </li>
  `
).join("");

const qaDialog = document.getElementById("qa-dialog");
let qaLastTrigger = null;

document.getElementById("qa-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-qa-review]");
  if (!button) return;
  const item = QA_QUEUE.find((q) => q.id === button.dataset.qaReview);
  qaLastTrigger = button;
  document.getElementById("qa-dialog-title").textContent = `Seeker #${item.conversationId}`;
  document.getElementById("qa-dialog-meta").textContent = `${item.reason} · with ${item.om}`;
  document.getElementById("qa-dialog-quote").textContent = item.note;
  document.getElementById("qa-form").reset();
  document.getElementById("qa-submit").textContent = "Save feedback";
  document.getElementById("qa-submit").disabled = false;
  qaDialog.showModal();
});

document.getElementById("qa-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("qa-submit").textContent = "Feedback saved ✓";
  document.getElementById("qa-submit").disabled = true;
  setTimeout(() => qaDialog.close(), 700);
});

document.getElementById("qa-dialog-close").addEventListener("click", () => qaDialog.close());
qaDialog.addEventListener("close", () => {
  qaLastTrigger?.focus();
  qaLastTrigger = null;
});
qaDialog.addEventListener("click", (event) => {
  if (event.target === qaDialog) qaDialog.close();
});

// ============================================================
// Onboarding & Training
// ============================================================

const ONBOARDING = [
  { name: "Neha Verma", week: 1, ofWeeks: 3, echo: true, conversationTraining: false, readyForShift: false, qaWeeksLeft: 8, coachingTasks: 2 },
  { name: "Rahul Deshmukh", week: 2, ofWeeks: 3, echo: true, conversationTraining: true, readyForShift: true, qaWeeksLeft: 6, coachingTasks: 1 },
];

document.getElementById("onboard-list").innerHTML = ONBOARDING.map(
  (person) => `
    <li class="egd-onboard-row">
      <span class="egd-avatar" style="width:34px;height:34px;font-size:11px;background: ${avatarColorVar(person.name)}">${initials(person.name)}</span>
      <div class="egd-onboard-row__body">
        <p class="egd-onboard-row__name">${escapeHtml(person.name)} <span class="egd-onboard-row__week">Week ${person.week} of ${person.ofWeeks}</span></p>
        <div class="egd-onboard-row__checks">
          <span class="egd-onboard-check${person.echo ? " is-done" : ""}">ECHO training</span>
          <span class="egd-onboard-check${person.conversationTraining ? " is-done" : ""}">Conversation training</span>
        </div>
        <p class="egd-onboard-row__meta">${person.readyForShift ? "Ready for a shift" : "Not yet ready for a shift"} · QA monitoring: ${person.qaWeeksLeft} weeks left · ${person.coachingTasks} coaching task${person.coachingTasks === 1 ? "" : "s"}</p>
      </div>
    </li>
  `
).join("");

// ============================================================
// Alerts (proactive, dismissible)
// ============================================================

const ALERTS = [
  { tier: "critical", text: "18 seekers responded and are waiting on your team." },
  { tier: "warning", text: "7 conversations expire today." },
  { tier: "warning", text: "OM Divya has 157 active conversations — workload is high." },
  { tier: "warning", text: "12 new conversations are unclaimed." },
  { tier: "caution", text: "Only 1 Telugu resource is in the library — 3 active conversations may need more options." },
  { tier: "warning", text: "Team workload is above normal — Divya and 1 other OM are over capacity." },
];

document.getElementById("alertfeed-list").innerHTML = ALERTS.map(
  (alert, index) => `
    <li class="egd-alertfeed-row" data-index="${index}">
      <span class="egd-alertfeed-dot" style="background: var(--egd-${alert.tier})" aria-hidden="true"></span>
      <p class="egd-alertfeed-text">${escapeHtml(alert.text)}</p>
      <button class="egd-alertfeed-dismiss" type="button" aria-label="Dismiss alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    </li>
  `
).join("");

document.getElementById("alertfeed-list").addEventListener("click", (event) => {
  const button = event.target.closest(".egd-alertfeed-dismiss");
  if (!button) return;
  button.closest(".egd-alertfeed-row").remove();
});

// ============================================================
// Conversation Analytics (secondary)
// ============================================================

const LANGUAGE_VOLUME = [
  { label: "Hindi", pct: 34 },
  { label: "Malayalam", pct: 18 },
  { label: "Tamil", pct: 15 },
  { label: "Telugu", pct: 12 },
  { label: "Bengali", pct: 10 },
  { label: "English", pct: 8 },
  { label: "Other", pct: 3 },
];

document.getElementById("analytics-body").innerHTML = `
  <div class="egd-analytics-row">
    <span>Avg. response time</span>
    <strong>6m</strong>
  </div>
  <div class="egd-analytics-row">
    <span>No-response rate</span>
    <strong>4.2%</strong>
  </div>
  <div class="egd-analytics-row">
    <span>Outcomes today</span>
    <strong>22 resolved · 9 follow-up · 3 no response</strong>
  </div>
  <p class="egd-analytics-sublabel">Volume by language</p>
  <div class="egd-lang-volume">
    ${LANGUAGE_VOLUME.map(
      (l) => `
      <div class="egd-lang-volume__row">
        <span class="egd-lang-volume__label">${escapeHtml(l.label)}</span>
        <span class="egd-lang-volume__bar"><span class="egd-lang-volume__fill" style="width: ${l.pct}%"></span></span>
        <span class="egd-lang-volume__pct">${l.pct}%</span>
      </div>
    `
    ).join("")}
  </div>
`;

// ============================================================
// Resource Library
// ============================================================

const TYPE_ICON = {
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="14" height="14" rx="2" /><path d="m21.5 8-5 3 5 3z" /></svg>',
  scripture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /></svg>',
  testimony: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>',
};

const RESOURCES = [
  { id: "r1", title: "Understanding Fear", type: "video", language: "Hindi", topic: "Fear", duration: "4:12", sent: 42, opened: 31, watched: 18 },
  { id: "r2", title: "Scripture on Fear", type: "scripture", language: "Hindi", topic: "Fear", sent: 38, opened: 30 },
  { id: "r3", title: "Testimony: Overcoming Fear", type: "testimony", language: "Hindi", topic: "Fear", duration: "6:32", sent: 20, opened: 14, watched: 9 },
  { id: "r4", title: "Who is Jesus?", type: "video", language: "Malayalam", topic: "Gospel", duration: "5:03", sent: 55, opened: 40, watched: 22 },
  { id: "r5", title: "Finding Hope", type: "pdf", language: "Tamil", topic: "Hope", sent: 30, opened: 12, downloaded: 8 },
  { id: "r6", title: "Marriage and Faith", type: "video", language: "Telugu", topic: "Marriage", duration: "7:20", sent: 18, opened: 9, watched: 5 },
  { id: "r7", title: "Prayer for Peace", type: "scripture", language: "Bengali", topic: "Anxiety", sent: 25, opened: 19 },
  { id: "r8", title: "Gospel of John — Ep 1", type: "video", language: "English", topic: "Gospel", duration: "10:00", sent: 60, opened: 48, watched: 30 },
  { id: "r9", title: "Testimony: A Changed Life", type: "testimony", language: "Hindi", topic: "Salvation", sent: 33, opened: 22, watched: 15 },
  { id: "r10", title: "Grief and Comfort", type: "pdf", language: "Malayalam", topic: "Grief", sent: 14, opened: 6, downloaded: 4 },
];

const LANGUAGES = ["Hindi", "Malayalam", "Tamil", "Telugu", "Bengali", "English", "Other"];

document.getElementById("lang-chips").innerHTML =
  `<button class="egd-lang-chip is-active" type="button" data-lang="all">All languages</button>` +
  LANGUAGES.map((lang) => `<button class="egd-lang-chip" type="button" data-lang="${escapeHtml(lang)}">${escapeHtml(lang)}</button>`).join("");

document.getElementById("topic-select").innerHTML +=
  [...new Set(RESOURCES.map((r) => r.topic))].map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join("");

const resourceFilters = { lang: "all", topic: "all", type: "all", sort: "used" };

function engagementLine(res) {
  if (res.type === "video" || res.type === "testimony") {
    return `Sent ${res.sent} → Opened ${res.opened} → Watched ${res.watched ?? 0}`;
  }
  if (res.downloaded != null) return `Sent ${res.sent} → Opened ${res.opened} → Downloaded ${res.downloaded}`;
  return `Sent ${res.sent} → Opened ${res.opened}`;
}

function renderResourceGrid() {
  let rows = RESOURCES.filter((r) => {
    if (resourceFilters.lang !== "all" && r.language !== resourceFilters.lang) return false;
    if (resourceFilters.topic !== "all" && r.topic !== resourceFilters.topic) return false;
    if (resourceFilters.type !== "all" && r.type !== resourceFilters.type) return false;
    return true;
  });
  rows = [...rows].sort((a, b) => (resourceFilters.sort === "used" ? b.sent - a.sent : b.id.localeCompare(a.id)));

  document.getElementById("resource-grid").innerHTML =
    rows
      .map(
        (res) => `
    <article class="egd-resource-card" data-id="${res.id}">
      <div class="egd-resource-card__head">
        <span class="egd-resource-card__icon">${TYPE_ICON[res.type]}</span>
        <span class="egd-resource-card__lang">${escapeHtml(res.language)}</span>
      </div>
      <p class="egd-resource-card__title">${escapeHtml(res.title)}</p>
      <p class="egd-resource-card__meta">${escapeHtml(res.topic)}${res.duration ? ` · ${res.duration}` : ""}</p>
      <p class="egd-resource-card__engagement">${engagementLine(res)}</p>
      <button class="egd-btn-cta egd-resource-card__send" type="button" data-send-id="${res.id}">
        Send to conversation
        ${CTA_ARROW}
      </button>
    </article>
  `
      )
      .join("") || `<p class="egd-empty-row">No resources match these filters yet.</p>`;
}

document.getElementById("lang-chips").addEventListener("click", (event) => {
  const chip = event.target.closest(".egd-lang-chip");
  if (!chip) return;
  document.querySelectorAll(".egd-lang-chip").forEach((c) => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  resourceFilters.lang = chip.dataset.lang;
  renderResourceGrid();
});

document.getElementById("topic-select").addEventListener("change", (event) => {
  resourceFilters.topic = event.target.value;
  renderResourceGrid();
});

document.getElementById("type-select").addEventListener("change", (event) => {
  resourceFilters.type = event.target.value;
  renderResourceGrid();
});

document.getElementById("resources-sort-btn").addEventListener("click", (event) => {
  resourceFilters.sort = resourceFilters.sort === "used" ? "recent" : "used";
  event.currentTarget.textContent = resourceFilters.sort === "used" ? "Most used" : "Recently added";
  renderResourceGrid();
});

// "Send to conversation" from the library (no conversation already open, so
// pick one first) — reuses the same body-portal popover pattern as
// .egd-assign, just listing recent conversations instead of team members.
document.getElementById("resource-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-send-id]");
  if (!button) return;
  const wasOpen = button.getAttribute("aria-expanded") === "true";
  closeRowMenus();
  if (wasOpen) return;
  button.setAttribute("aria-expanded", "true");
  const menu = document.createElement("div");
  menu.className = "egd-assign__menu";
  menu.setAttribute("role", "menu");
  menu.innerHTML = QUEUE.slice(0, 5)
    .map((row) => `<button class="egd-assign__option" type="button" role="menuitem" data-send-to="${row.id}">Seeker #${row.id}</button>`)
    .join("");
  document.body.appendChild(menu);
  const rect = button.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.left = `${rect.left}px`;
  menu.addEventListener("click", (event2) => {
    const option = event2.target.closest("[data-send-to]");
    if (!option) return;
    closeRowMenus();
    const originalLabel = button.innerHTML;
    button.innerHTML = `Sent to Seeker #${option.dataset.sendTo} ✓`;
    setTimeout(() => {
      button.innerHTML = originalLabel;
    }, 2200);
  });
});

renderResourceGrid();
