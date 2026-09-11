/**
 * OneHope CRM — Engagement Command Center — data + rendering for
 * /ExploreGod-CRM-Dashboard-2.
 *
 * Same one-file-per-page convention as `explore-god-dashboard.js` and
 * `explore-god-global.js`: small helpers (`escapeHtml`, `hashString`,
 * `initials`) are duplicated rather than imported from either, and every
 * panel below the Ministry Today stat row is rendered from small in-file
 * arrays standing in for a real intake/CRM feed — see DESIGN.md's "Tenth
 * page" note for this page's scope and its relationship to
 * /ExploreGod-CRM-Dashboard.
 */

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

// A small deterministic hash so the same name always produces the same
// decorative values (avatar color) across reloads — same approach as
// explore-god-dashboard.js's hashString/avatarStage.
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

// ---------- Stage identity ----------
// New/Active/Growing/Handoff are the same four fixed pipeline stages as
// New Contact/Active Conversation/Christian Formation/Discipleship Journey
// on /ExploreGod-CRM-Dashboard, in the plainer language Vero's dashboard
// brief uses — same color per stage, never a second palette for the same
// four stages. Each stage's `text` property is the token that keeps a stage
// hue readable as actual text (see explore-god-dashboard.css's "Text-safe
// variants" note) rather than the raw fill/dot color, which some of these
// hues don't clear 4.5:1 as.
const STAGES = [
  { id: "new", label: "New", var: "--egd-stage-new", soft: "--egd-stage-new-soft", text: "--egd-accent-text" },
  { id: "active", label: "Active", var: "--egd-stage-chatting", soft: "--egd-stage-chatting-soft", text: "--egd-stage-chatting-text" },
  { id: "growing", label: "Growing", var: "--egd-stage-formation", soft: "--egd-stage-formation-soft", text: "--egd-stage-formation-text" },
  { id: "handoff", label: "Handoff", var: "--egd-stage-discipleship", soft: "--egd-stage-discipleship-soft", text: "--egd-gold-text" },
];

function stageById(id) {
  return STAGES.find((s) => s.id === id);
}

function avatarStage(name) {
  return STAGES[hashString(name) % STAGES.length];
}

// Ministry Today's sparklines need two colors outside the four-stage system
// (good/critical, for "missionaries online" and "high-priority conversations"
// — neither is a pipeline stage) alongside the four stage hues used for the
// other three cards, so this checks STAGES first and falls back to a bare
// good/critical token rather than forcing every sparkline through the stage
// palette.
function sparklineColorVar(key) {
  const stage = stageById(key);
  if (stage) return `var(${stage.var})`;
  return `var(--egd-${key})`;
}

// ---------- Sparklines ----------
// Same technique as explore-god-dashboard.js's renderSparkline — duplicated
// per this project's one-file-per-page convention rather than imported —
// adapted to color by sparklineColorVar() instead of a pipeline stage only.

let sparklineSeq = 0;

function renderSparkline(svg) {
  const points = svg.dataset.points.split(",").map(Number);
  const color = sparklineColorVar(svg.dataset.stage);
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
  const gradientId = `egd2-spark-fill-${sparklineSeq}`;

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

// ---------- Needs Attention ----------

// `count` is the tier's true total (3/8/4, matching the mockup); `items` is
// a handful of representative rows for the drill-down — where count exceeds
// items.length, the detail panel says so explicitly rather than implying
// those are the only ones (see the "+N more" line below).
const ATTENTION_ITEMS = [
  {
    id: "heavy",
    tier: "critical",
    title: "Heavy conversations",
    count: 3,
    desc: "Flagged as emotionally difficult — may need a second set of eyes.",
    items: [
      { name: "Seeker #402", meta: "With Daniel · a recent loss came up", chip: "2h ago", action: "View conversation" },
      { name: "Seeker #178", meta: "With Ariel · a disclosure of past abuse", chip: "40m ago", action: "View conversation" },
      { name: "Seeker #260", meta: "With Marco · mentioned feeling hopeless", chip: "5m ago", action: "View conversation" },
    ],
  },
  {
    id: "overdue",
    tier: "warning",
    title: "Follow-up overdue",
    count: 8,
    desc: "No response from the assigned missionary in 48+ hours.",
    items: [
      { name: "Seeker #193", meta: "With Daniel · last reply 5 days ago", chip: "5d overdue", action: "Send reminder" },
      { name: "Seeker #331", meta: "With Andi · last reply 3 days ago", chip: "3d overdue", action: "Send reminder" },
      { name: "Seeker #087", meta: "With Josiah · last reply 4 days ago", chip: "4d overdue", action: "Send reminder" },
      { name: "Seeker #445", meta: "With Ariel · last reply 6 days ago", chip: "6d overdue", action: "Send reminder" },
    ],
  },
  {
    id: "quiet",
    tier: "caution",
    title: "Seekers without recent activity",
    count: 4,
    desc: "No activity in 7+ days — the relationship risks going quiet.",
    items: [
      { name: "Seeker #212", meta: "With Marco · last active 9 days ago", chip: "9d quiet", action: "Nudge" },
      { name: "Seeker #356", meta: "With Daniel · last active 11 days ago", chip: "11d quiet", action: "Nudge" },
      { name: "Seeker #150", meta: "With Josiah · last active 14 days ago", chip: "14d quiet", action: "Nudge" },
    ],
  },
];

const attentionList = document.getElementById("attention-list");

attentionList.innerHTML = ATTENTION_ITEMS.map((tier, index) => {
  const detailId = `attn-detail-${tier.id}`;
  const expanded = index === 0; // heaviest tier open by default — the row a coordinator most needs to see shouldn't require a click.
  return `
    <li class="egd-attn-row">
      <button
        class="egd-attn-row__summary"
        type="button"
        aria-expanded="${expanded}"
        aria-controls="${detailId}"
        style="--tier-color: var(--egd-${tier.tier}); --tier-soft: var(--egd-${tier.tier}-soft); --tier-text: var(--egd-${tier.tier === "critical" ? "critical" : tier.tier + "-text"})"
      >
        <span class="egd-attn-row__dot" aria-hidden="true"></span>
        <span class="egd-attn-row__body">
          <span class="egd-attn-row__title">${escapeHtml(tier.title)}</span>
          <span class="egd-attn-row__desc">${escapeHtml(tier.desc)}</span>
        </span>
        <span class="egd-attn-row__count">${tier.count}</span>
        <span class="egd-attn-row__toggle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </button>
      <div class="egd-attn-row__detail" id="${detailId}" ${expanded ? "" : "hidden"}>
        ${tier.items
          .map(
            (item) => `
          <div class="egd-attn-item">
            <span class="egd-avatar" style="width:34px;height:34px;font-size:11px;background: var(${avatarStage(item.name).var})">${initials(item.name)}</span>
            <span class="egd-attn-item__body">
              <span class="egd-attn-item__name">${escapeHtml(item.name)}</span><br />
              <span class="egd-attn-item__meta">${escapeHtml(item.meta)}</span>
            </span>
            <span class="egd-attn-item__chip" style="--tier-soft: var(--egd-${tier.tier}-soft); --tier-text: var(--egd-${tier.tier === "critical" ? "critical" : tier.tier + "-text"})">${escapeHtml(item.chip)}</span>
            <button class="egd-attn-item__action" type="button">${escapeHtml(item.action)}</button>
          </div>
        `
          )
          .join("")}
        ${tier.count > tier.items.length ? `<p class="egd-attn-row__desc">+${tier.count - tier.items.length} more — view all</p>` : ""}
      </div>
    </li>
  `;
}).join("");

attentionList.addEventListener("click", (event) => {
  const summary = event.target.closest(".egd-attn-row__summary");
  if (!summary) return;
  const expanded = summary.getAttribute("aria-expanded") === "true";
  summary.setAttribute("aria-expanded", String(!expanded));
  document.getElementById(summary.getAttribute("aria-controls")).hidden = expanded;
});

// ---------- Seeker Journey stepper ----------

// `count` is the stage's true total (matches the mockup's New 18/Active
// 21/Growing 6/Handoff 2); `seekers` is a handful of representative rows for
// the drill-down, not the full list — a real backend would page or search
// the rest rather than this page hardcoding all 18-plus rows per stage.
const JOURNEY = [
  {
    stageId: "new",
    count: 18,
    seekers: [
      { id: "#512", days: "1 day", last: "Today", next: "Send a warm welcome and learn their story." },
      { id: "#498", days: "2 days", last: "Yesterday", next: "Introduce Haven and ask what brought them here." },
    ],
  },
  {
    stageId: "active",
    count: 21,
    seekers: [
      { id: "#284", days: "9 days", last: "2 hours ago", next: "Continue the conversation about family and faith." },
      { id: "#193", days: "14 days", last: "5 days ago", next: "Re-engage before the relationship goes quiet." },
    ],
  },
  {
    stageId: "growing",
    count: 6,
    seekers: [
      { id: "#192", days: "42 days", last: "3 days ago", next: "Continue exploring their interest in community." },
      { id: "#204", days: "31 days", last: "1 day ago", next: "Introduce a short devotional on prayer." },
      { id: "#238", days: "18 days", last: "6 days ago", next: "Check in — they mentioned a difficult week at home." },
    ],
  },
  {
    stageId: "handoff",
    count: 2,
    seekers: [
      { id: "#384", days: "61 days", last: "Today", next: "Begin local church connection — checklist complete." },
      { id: "#421", days: "48 days", last: "Yesterday", next: "Confirm the safety review before initiating handoff." },
    ],
  },
];

const journeyStagesEl = document.getElementById("journey-stages");
const journeyDetailEl = document.getElementById("journey-detail");
let activeJourneyStage = "handoff"; // the most actionable stage — open by default so it's visible without a click.

function renderJourney() {
  journeyStagesEl.innerHTML = JOURNEY.map((stage) => {
    const meta = stageById(stage.stageId);
    const expanded = stage.stageId === activeJourneyStage;
    return `
      <button
        class="egd-journey-stage"
        type="button"
        data-stage="${stage.stageId}"
        aria-expanded="${expanded}"
        aria-controls="journey-detail"
        style="--stage-color: var(${meta.var}); --stage-soft: var(${meta.soft}); --stage-text: var(${meta.text})"
      >
        <span class="egd-journey-stage__label">${meta.label}</span>
        <span class="egd-journey-stage__count">${stage.count}</span>
        <span class="egd-journey-stage__cta">
          View seekers
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </span>
      </button>
    `;
  }).join("");

  const active = JOURNEY.find((stage) => stage.stageId === activeJourneyStage);
  const activeMeta = stageById(active.stageId);
  journeyDetailEl.innerHTML = `
    <div class="egd-journey-seekers">
      ${active.seekers
        .map(
          (seeker) => `
        <div class="egd-journey-seeker">
          <div class="egd-journey-seeker__head">
            <span class="egd-journey-seeker__id">Seeker ${seeker.id}</span>
            <span class="egd-journey-seeker__days">${seeker.days} in ${escapeHtml(activeMeta.label.toLowerCase())}</span>
          </div>
          <p class="egd-journey-seeker__row"><strong>Last interaction:</strong> ${escapeHtml(seeker.last)}</p>
          <p class="egd-journey-seeker__row"><strong>Next step:</strong> ${escapeHtml(seeker.next)}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
  journeyDetailEl.hidden = false;
}

journeyStagesEl.addEventListener("click", (event) => {
  const stage = event.target.closest(".egd-journey-stage");
  if (!stage) return;
  activeJourneyStage = stage.dataset.stage;
  renderJourney();
});

renderJourney();

// ---------- Team Health ----------

const TEAM = [
  { name: "Ariel Domingo", online: true, seekers: 6, activeChats: 4, load: "moderate" },
  { name: "Marco Villanueva", online: true, seekers: 3, activeChats: 2, load: "light" },
  {
    name: "Daniel Kurniawan",
    online: false,
    seekers: 9,
    activeChats: 3,
    load: "heavy",
    note: 'Requested support — "Had several difficult conversations this week."',
    checkin: "Check in with Daniel",
  },
  { name: "Andi Pratama", online: true, seekers: 5, activeChats: 4, load: "moderate" },
  {
    name: "Josiah Bell",
    online: true,
    seekers: 8,
    activeChats: 6,
    load: "heavy",
    note: "One-on-one due — last check-in was 3 weeks ago.",
    checkin: "Schedule one-on-one",
  },
  { name: "Ethan Brooks", online: false, seekers: 4, activeChats: 1, load: "light" },
  { name: "Caleb Nguyen", online: true, seekers: 7, activeChats: 5, load: "moderate" },
  { name: "Tunde Adeyemi", online: false, seekers: 2, activeChats: 0, load: "light" },
];

const LOAD_LABEL = { light: "Light load", moderate: "Moderate load", heavy: "Heavy load" };

document.getElementById("team-list").innerHTML = TEAM.map((person) => {
  const stage = avatarStage(person.name);
  return `
    <li class="egd-team-row">
      <span class="egd-avatar" style="background: var(${stage.var})">${initials(person.name)}</span>
      <div class="egd-team-row__body">
        <div class="egd-team-row__name-line">
          <span class="egd-team-row__name">${escapeHtml(person.name)}</span>
          <span class="egd-status${person.online ? " egd-status--online" : ""}">${person.online ? "Online" : "Offline"}</span>
        </div>
        <p class="egd-team-row__caseload"><strong>${person.seekers}</strong> seekers · <strong>${person.activeChats}</strong> active chats</p>
        ${person.note ? `<p class="egd-team-row__note">${escapeHtml(person.note)}</p>` : ""}
      </div>
      <span class="egd-load egd-load--${person.load}">${LOAD_LABEL[person.load]}</span>
      ${person.checkin ? `<button class="egd-team-row__checkin" type="button">${escapeHtml(person.checkin)}</button>` : `<span></span>`}
    </li>
  `;
}).join("");

// ---------- Follow-up queue ----------

const FOLLOWUPS = [
  { seeker: "#284", meta: "Last conversation Monday · family and faith", owner: "Marco", status: "today", chip: "Follow up today" },
  { seeker: "#193", meta: "Last interaction 5 days ago", owner: "Daniel", status: "unscheduled", chip: "No follow-up scheduled" },
  { seeker: "#087", meta: "Last conversation Tuesday · job loss", owner: "Josiah", status: "overdue", chip: "3 days overdue" },
  { seeker: "#331", meta: "Last conversation last week · marriage struggles", owner: "Andi", status: "overdue", chip: "6 days overdue" },
  { seeker: "#512", meta: "First conversation yesterday", owner: "Ariel", status: "today", chip: "Follow up today" },
  { seeker: "#445", meta: "Last interaction a week ago", owner: "Ariel", status: "unscheduled", chip: "No follow-up scheduled" },
  { seeker: "#298", meta: "Last conversation 4 days ago · grief", owner: "Caleb", status: "overdue", chip: "2 days overdue" },
];

const FOLLOWUP_ACTION = { today: "Message now", overdue: "Message now", unscheduled: "Schedule" };

const followupList = document.getElementById("followup-list");

function renderFollowups(filter = "all") {
  const rows = FOLLOWUPS.filter((row) => filter === "all" || row.status === filter);
  followupList.innerHTML = rows
    .map((row) => {
      const stage = avatarStage(row.owner);
      return `
        <li class="egd-followup-row">
          <span class="egd-avatar" style="width:36px;height:36px;font-size:12px;background: var(${stage.var})">${initials(row.owner)}</span>
          <div class="egd-followup-row__body">
            <p class="egd-followup-row__name">Seeker ${row.seeker}</p>
            <p class="egd-followup-row__meta">${escapeHtml(row.meta)}</p>
          </div>
          <span class="egd-wait egd-wait--${row.status === "today" ? "good" : row.status === "overdue" ? "critical" : "warning"}">${escapeHtml(row.chip)}</span>
          <div class="egd-followup-row__owner">with ${escapeHtml(row.owner)}</div>
          <button class="egd-followup-row__action${row.status === "unscheduled" ? " egd-followup-row__action--muted" : ""}" type="button">${FOLLOWUP_ACTION[row.status]}</button>
        </li>
      `;
    })
    .join("");
}

document.getElementById("followup-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#followup-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  renderFollowups(tab.dataset.filter);
});

renderFollowups();

// ---------- Recent Progress ----------

const PROGRESS = [
  { who: "Marco", seeker: "#284", note: "Meaningful faith conversation", time: "20m ago" },
  { who: "Daniel", seeker: "#193", note: "Ready for local church connection", time: "1h ago" },
  { who: "Ariel", seeker: "#421", note: "Follow-up needed", time: "2h ago" },
  { who: "Josiah", seeker: "#238", note: "Shared a testimony about answered prayer", time: "4h ago" },
  { who: "Andi", seeker: "#331", note: "First conversation about baptism", time: "6h ago" },
];

document.getElementById("progress-list").innerHTML = PROGRESS.map((row) => {
  const stage = avatarStage(row.who);
  return `
    <li class="egd-progress-row">
      <span class="egd-avatar" style="width:34px;height:34px;font-size:11px;background: var(${stage.var})">${initials(row.who)}</span>
      <div class="egd-progress-row__body">
        <p class="egd-progress-row__line"><strong>${escapeHtml(row.who)}</strong> → Seeker ${row.seeker}<span class="egd-progress-row__time">${escapeHtml(row.time)}</span></p>
        <p class="egd-progress-row__note">${escapeHtml(row.note)}</p>
      </div>
    </li>
  `;
}).join("");

// ---------- AI Copilot ----------

const AI_ITEMS = [
  {
    icon: "insight",
    text: "<strong>Seeker #392</strong> has discussed family conflict and financial stress across the last 3 conversations.",
    meta: "18-day relationship · prefers Bahasa Indonesia · previously asked about finding a local church.",
    cta: "View full brief",
    doneLabel: "Brief opened",
  },
  {
    icon: "help",
    text: "<strong>Daniel</strong> flagged a conversation as too difficult to handle alone.",
    meta: "Get a conversation summary and suggested response approaches — you stay the one who replies.",
    cta: "Help Daniel",
    doneLabel: "Opened for Daniel",
  },
  {
    icon: "bell",
    text: "3 seekers in the <strong>Growing</strong> stage haven't heard from their missionary in 5+ days.",
    meta: "Suggest a gentle check-in message for each.",
    cta: "Suggest messages",
    doneLabel: "Suggested",
  },
  {
    icon: "check",
    text: "Formation-stage seekers who prefer Bahasa Indonesia respond best to a slower, question-led pace.",
    meta: "Insight drawn from 40+ recent conversations.",
    cta: "View insight",
    doneLabel: "Viewed",
  },
];

const AI_ICONS = {
  check: '<path d="M20 6 9 17l-5-5" />',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" />',
  help: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 1.9-2.4 3.4" /><path d="M12 17h.01" />',
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

// ---------- Ready for Handoff ----------

const HANDOFFS = [
  {
    id: "#384",
    recommend: "Begin local church connection in Bandung.",
    cta: "Begin handoff",
    checklist: [
      { label: "Trust established", done: true },
      { label: "Seeker interested", done: true },
      { label: "Safety reviewed", done: true },
      { label: "Appropriate timing", done: true },
      { label: "Local church identified", done: true },
      { label: "Handoff initiated", done: false },
      { label: "Handoff completed", done: false },
    ],
  },
  {
    id: "#421",
    recommend: "Confirm timing before beginning local church connection.",
    cta: "Continue checklist",
    checklist: [
      { label: "Trust established", done: true },
      { label: "Seeker interested", done: true },
      { label: "Safety reviewed", done: true },
      { label: "Appropriate timing", done: false },
      { label: "Local church identified", done: false },
      { label: "Handoff initiated", done: false },
      { label: "Handoff completed", done: false },
    ],
  },
];

document.getElementById("handoff-list").innerHTML = HANDOFFS.map(
  (card) => `
    <div class="egd-handoff-card">
      <div class="egd-handoff-card__head">
        <span class="egd-handoff-card__id">Seeker ${card.id}</span>
        <span class="egd-handoff-card__stage">Ready for local community</span>
      </div>
      <p class="egd-handoff-card__recommend">${escapeHtml(card.recommend)}</p>
      <ul class="egd-checklist">
        ${card.checklist
          .map(
            (step) => `
          <li class="egd-checklist__item egd-checklist__item--${step.done ? "done" : "pending"}">
            ${
              step.done
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 5-5" /></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>'
            }
            ${escapeHtml(step.label)}
          </li>
        `
          )
          .join("")}
      </ul>
      <button class="egd-handoff-card__cta" type="button">
        ${escapeHtml(card.cta)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
      </button>
    </div>
  `
).join("");

// ---------- Stories & Testimonies ----------

const TESTIMONY_PIPELINE = [
  { label: "Potential", count: 12 },
  { label: "Reviewed", count: 5 },
  { label: "Approved", count: 3 },
  { label: "Shared", count: 2 },
];

document.getElementById("testimony-pipeline").innerHTML = TESTIMONY_PIPELINE.map(
  (stage) => `
    <div class="egd-testimony-pipeline__stage">
      <span class="egd-testimony-pipeline__count">${stage.count}</span>
      <span class="egd-testimony-pipeline__label">${escapeHtml(stage.label)}</span>
    </div>
  `
).join("");

// ---------- Quick Actions ----------
// Anchors to the relevant panel's heading — the same "land the target's own
// heading just below the sticky topbar" offset used by dashboard-partner.js's
// in-page section navigation, adapted for this page's actual scroll
// container (the window — `.egd-scroll` has no `overflow` of its own here).

const QUICK_ACTIONS = [
  { icon: '<circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />', label: "Find a seeker", target: "#journey-title" },
  { icon: '<path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" />', label: "Review conversations", target: "#attention-title" },
  { icon: '<circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" /><circle cx="18" cy="7.5" r="2.5" /><path d="M15.8 14.5c2.9.3 5.7 2 5.7 5.5" />', label: "Check on a missionary", target: "#team-title" },
  { icon: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />', label: "Review handoffs", target: "#handoff-title" },
  { icon: '<path d="M12 2.5 14.6 9l6.9.5-5.3 4.5 1.7 6.7L12 17l-5.9 3.7 1.7-6.7-5.3-4.5 6.9-.5z" />', label: "Add a testimony", target: "#testimony-title" },
];

document.getElementById("quick-actions").innerHTML = QUICK_ACTIONS.map(
  (action) => `
    <a class="egd-quick-action" href="${action.target}">
      <span class="egd-quick-action__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${action.icon}</svg>
      </span>
      + ${escapeHtml(action.label)}
    </a>
  `
).join("");

const topbar = document.querySelector(".egd-topbar");
const SCROLL_OFFSET_GAP = 16;

document.getElementById("quick-actions").addEventListener("click", (event) => {
  const link = event.target.closest(".egd-quick-action");
  if (!link) return;
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  const topbarHeight = topbar?.getBoundingClientRect().height ?? 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: targetTop - topbarHeight - SCROLL_OFFSET_GAP, behavior: "smooth" });
});

