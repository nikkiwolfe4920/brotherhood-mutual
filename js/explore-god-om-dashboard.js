/**
 * OneHope CRM — Online Missionary Dashboard — data + rendering for
 * /ExploreGod-OM-Dashboard.
 *
 * Same one-file-per-page convention as the other three lenses on this CRM:
 * small helpers (`escapeHtml`, `hashString`, `initials`) are duplicated
 * rather than imported, and every panel is rendered from small in-file
 * arrays standing in for a real conversation/CRM feed — see DESIGN.md's
 * "Twelfth page" note for this page's scope.
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

const CTA_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>';

// ---------- Stage identity ----------
// Same fixed New/Active/Growing/Handoff mapping used everywhere on this CRM
// (see explore-god-dashboard-2.js's identical comment) — never a second
// palette for the same four stages.
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

function stageChip(stageId) {
  const stage = stageById(stageId);
  return `<span class="egd-stage-chip" style="--stage-color: var(${stage.var}); --stage-soft: var(${stage.soft}); --stage-text: var(${stage.text})">${stage.label}</span>`;
}

// ============================================================
// My Conversations — Joseph's full assigned queue
// ============================================================
// Seeker identity follows this product's anonymized "Seeker #NNNN"
// convention throughout — no real seeker name is ever surfaced to staff UI,
// including on the conversation tabs this page links into.

const QUEUE = [
  {
    id: "512",
    stage: "new",
    language: "Bahasa Indonesia",
    message: "Feeling anxious about exams, asked for prayer",
    waitLabel: "Replied 18m ago",
    waitLevel: "critical",
    date: "May 14",
    flags: ["waiting"],
  },
  {
    id: "489",
    stage: "active",
    language: "Javanese",
    message: "Wants to talk about family conflict again",
    waitLabel: "Expires in 45m",
    waitLevel: "critical",
    date: "May 14",
    flags: ["expiring"],
  },
  {
    id: "365",
    stage: "growing",
    language: "Bahasa Indonesia",
    message: "Said they'd share their story of coming to faith",
    waitLabel: "Follow-up today",
    waitLevel: "warning",
    date: "May 14",
    flags: ["followup"],
  },
  {
    id: "201",
    stage: "active",
    language: "English",
    message: "Escalated — mentioned feeling hopeless",
    waitLabel: "Escalated 10m ago",
    waitLevel: "critical",
    date: "May 14",
    flags: ["escalated", "waiting"],
  },
  {
    id: "150",
    stage: "handoff",
    language: "Bahasa Indonesia",
    message: "Shared they were baptized last month!",
    waitLabel: "With seeker · today",
    waitLevel: "good",
    date: "May 14",
    flags: [],
  },
  {
    id: "340",
    stage: "handoff",
    language: "Bahasa Indonesia",
    message: "Ready to connect with a local church in Surabaya",
    waitLabel: "With seeker · 1d",
    waitLevel: "good",
    date: "May 13",
    flags: [],
  },
  {
    id: "276",
    stage: "active",
    language: "Javanese",
    message: "Asked what the Bible says about forgiveness",
    waitLabel: "With seeker · 2d",
    waitLevel: "good",
    date: "May 12",
    flags: [],
  },
  {
    id: "198",
    stage: "new",
    language: "English",
    message: "First message — curious about who Jesus is",
    waitLabel: "Replied 3d ago",
    waitLevel: "warning",
    date: "May 11",
    flags: ["waiting"],
  },
  {
    id: "422",
    stage: "growing",
    language: "Bahasa Indonesia",
    message: "Quiet since last week, hasn't replied",
    waitLabel: "No response · 6d",
    waitLevel: "warning",
    date: "May 8",
    flags: ["followup"],
  },
];

function findQueueRow(id) {
  return QUEUE.find((row) => row.id === id);
}

// ---------- My Shift ----------
// Four rows, one per category — the shift's own "what needs me before I sign
// off" view of the same queue below, at the individual level. This is the
// only module on the page that carries a count badge (see the brief's
// design principle #1) — every other list here shows plain rows on purpose.

const SHIFT_REASONS = [
  { flag: "waiting", queueId: "512", label: "Seeker replied 18m ago — your turn" },
  { flag: "expiring", queueId: "489", label: "Conversation window expires in 45m" },
  { flag: "followup", queueId: "365", label: "Follow-up you promised is due today" },
  { flag: "escalated", queueId: "201", label: "Escalated back to you by Vero — please review" },
];

const shiftList = document.getElementById("shift-list");
document.getElementById("shift-badge").textContent = String(SHIFT_REASONS.length);

shiftList.innerHTML = SHIFT_REASONS.map((reason) => {
  const row = findQueueRow(reason.queueId);
  return `
    <li>
      <a class="egd-shift-row" href="../ExploreGod-OM-Chat/?seeker=${row.id}">
        <span class="egd-avatar" style="background: var(${avatarStage(row.id).var})">${initials(`S ${row.id}`)}</span>
        <span class="egd-shift-row__body">
          <span class="egd-shift-row__name">Seeker #${row.id}</span>
          <span class="egd-shift-row__reason">${escapeHtml(reason.label)}</span>
        </span>
        ${stageChip(row.stage)}
        <svg class="egd-shift-row__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </a>
    </li>
  `;
}).join("");

// ---------- My Conversations: search + filter + bulk close ----------

const myqueueList = document.getElementById("myqueue-list");
const myqueueEmpty = document.getElementById("myqueue-empty");
const myqueueSearchInput = document.getElementById("myqueue-search-input");
const myqueueBulkbar = document.getElementById("myqueue-bulkbar");
const myqueueBulkCount = document.getElementById("myqueue-bulk-count");

let myqueueFilter = "all";
let myqueueSearch = "";
const selectedIds = new Set();

function matchesFilter(row) {
  if (myqueueFilter === "all") return true;
  return row.flags.includes(myqueueFilter);
}

function matchesSearch(row) {
  if (!myqueueSearch) return true;
  const haystack = `${row.id} ${row.message} ${row.date}`.toLowerCase();
  return haystack.includes(myqueueSearch);
}

function renderMyQueue() {
  const rows = QUEUE.filter((row) => matchesFilter(row) && matchesSearch(row));

  myqueueList.innerHTML = rows
    .map((row) => {
      const stage = avatarStage(row.id);
      return `
        <li class="egd-myqueue-row">
          <input class="egd-myqueue-row__check" type="checkbox" data-select-id="${row.id}" ${selectedIds.has(row.id) ? "checked" : ""} aria-label="Select Seeker #${row.id}" />
          <span class="egd-myqueue-row__who">
            <span class="egd-avatar" style="width:36px;height:36px;font-size:12px;background: var(${stage.var})">${initials(`S ${row.id}`)}</span>
            <span>
              <span class="egd-myqueue-row__name">Seeker #${row.id}</span>
              <span class="egd-myqueue-row__lang">${escapeHtml(row.language)}</span>
            </span>
          </span>
          <span class="egd-myqueue-row__msg">${escapeHtml(row.message)}</span>
          ${stageChip(row.stage)}
          <span class="egd-myqueue-row__waiting">
            <span class="egd-wait egd-wait--${row.waitLevel}">${escapeHtml(row.waitLabel)}</span>
            <span class="egd-myqueue-row__date">${escapeHtml(row.date)}</span>
          </span>
          <span class="egd-myqueue-row__action">
            <a class="egd-btn-cta" href="../ExploreGod-OM-Chat/?seeker=${row.id}">Resume chat ${CTA_ARROW}</a>
          </span>
        </li>
      `;
    })
    .join("");

  myqueueEmpty.hidden = rows.length > 0;
  updateBulkbar();
}

function updateBulkbar() {
  const count = selectedIds.size;
  myqueueBulkbar.hidden = count === 0;
  myqueueBulkCount.textContent = `${count} selected`;
}

document.getElementById("myqueue-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".egd-tab");
  if (!tab) return;
  document.querySelectorAll("#myqueue-tabs .egd-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  myqueueFilter = tab.dataset.filter;
  renderMyQueue();
});

myqueueSearchInput.addEventListener("input", () => {
  myqueueSearch = myqueueSearchInput.value.trim().toLowerCase();
  renderMyQueue();
});

myqueueList.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-select-id]");
  if (!checkbox) return;
  const id = checkbox.dataset.selectId;
  if (checkbox.checked) selectedIds.add(id);
  else selectedIds.delete(id);
  updateBulkbar();
});

document.getElementById("myqueue-bulk-clear").addEventListener("click", () => {
  selectedIds.clear();
  renderMyQueue();
});

myqueueBulkbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-bulk-outcome]");
  if (!button) return;
  const outcome = button.dataset.bulkOutcome;
  const closedIds = [...selectedIds];
  closedIds.forEach((id) => {
    const index = QUEUE.findIndex((row) => row.id === id);
    if (index !== -1) QUEUE.splice(index, 1);
  });
  selectedIds.clear();
  renderMyQueue();
  showBulkToast(closedIds.length, outcome);
});

function showBulkToast(count, outcome) {
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

renderMyQueue();

// ============================================================
// Team Feed
// ============================================================

const FEED = [
  {
    id: "f1",
    author: "Vero Salcedo",
    role: "Program Coordinator",
    lead: true,
    time: "1h ago",
    text: "Reminder: this week's coaching theme is patient listening before offering answers. If a conversation feels heavy, use “Get help with this one” in the chat — that's exactly what it's for.",
    attachment: "Coaching: Patient Listening (12 min)",
    comments: [],
  },
  {
    id: "f2",
    author: "Siji Oommen",
    role: "Team Lead",
    lead: true,
    time: "Yesterday",
    text: "New training module unlocked for anyone past week 4: Trauma-Informed Care. Please complete it by Friday — it's short, about 20 minutes.",
    attachment: "Training: Trauma-Informed Care",
    comments: [],
  },
  {
    id: "f3",
    author: "Ariel Domingo",
    role: "Online Missionary",
    lead: false,
    time: "Yesterday",
    text: "Anyone have a good resource for someone asking about baptism, in Bahasa? Mine feels a bit dry for this seeker.",
    attachment: null,
    comments: [{ author: "Andi Pratama", text: "Try “Baptism Explained (BM)” in the resource library — worked well for me last month." }],
  },
  {
    id: "f4",
    author: "Joseph Wijaya",
    role: "Online Missionary",
    lead: false,
    time: "2 days ago",
    text: "Thank you all for the encouragement after that hard conversation last week. It meant a lot.",
    attachment: null,
    comments: [{ author: "Vero Salcedo", text: "Proud of how you handled that one, Joseph. 💙" }],
  },
];

const feedList = document.getElementById("feed-list");

function renderFeed() {
  feedList.innerHTML = FEED.map((post) => {
    const stage = avatarStage(post.author);
    return `
      <li class="egd-feed-post${post.lead ? " egd-feed-post--lead" : ""}" data-post-id="${post.id}">
        <span class="egd-avatar" style="background: var(${stage.var})">${initials(post.author)}</span>
        <div class="egd-feed-post__body">
          <div class="egd-feed-post__head">
            <span class="egd-feed-post__name">${escapeHtml(post.author)}</span>
            <span class="egd-feed-post__role">${escapeHtml(post.role)}</span>
            <span class="egd-feed-post__time">${escapeHtml(post.time)}</span>
          </div>
          <p class="egd-feed-post__text">${escapeHtml(post.text)}</p>
          ${
            post.attachment
              ? `<span class="egd-feed-post__attachment"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /></svg>${escapeHtml(post.attachment)}</span>`
              : ""
          }
          <div class="egd-feed-post__actions">
            <button class="egd-feed-post__reply-toggle" type="button" data-toggle-reply="${post.id}">
              ${post.comments.length} comment${post.comments.length === 1 ? "" : "s"} · Reply
            </button>
          </div>
          <ul class="egd-feed-comments" id="comments-${post.id}" hidden>
            ${post.comments
              .map((comment) => `<li class="egd-feed-comment"><strong>${escapeHtml(comment.author)}:</strong> ${escapeHtml(comment.text)}</li>`)
              .join("")}
          </ul>
          <form class="egd-feed-reply" id="reply-form-${post.id}" data-reply-id="${post.id}" hidden>
            <label class="visually-hidden" for="reply-input-${post.id}">Reply to ${escapeHtml(post.author)}</label>
            <input class="egd-feed-reply__input" type="text" id="reply-input-${post.id}" placeholder="Write a reply…" />
            <button class="egd-feed-reply__send" type="submit">Send</button>
          </form>
        </div>
      </li>
    `;
  }).join("");
}

renderFeed();

feedList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-reply]");
  if (!toggle) return;
  const id = toggle.dataset.toggleReply;
  const comments = document.getElementById(`comments-${id}`);
  const replyForm = document.getElementById(`reply-form-${id}`);
  const opening = comments.hidden;
  comments.hidden = !opening;
  replyForm.hidden = !opening;
  if (opening) replyForm.querySelector("input").focus();
});

feedList.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-reply-id]");
  if (!form) return;
  event.preventDefault();
  const id = form.dataset.replyId;
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  const post = FEED.find((p) => p.id === id);
  post.comments.push({ author: "Joseph Wijaya", text });
  renderFeed();
  document.getElementById(`comments-${id}`).hidden = false;
  document.getElementById(`reply-form-${id}`).hidden = false;
});

document.getElementById("feed-composer").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("feed-composer-input");
  const text = input.value.trim();
  if (!text) return;
  FEED.unshift({
    id: `f${Date.now()}`,
    author: "Joseph Wijaya",
    role: "Online Missionary",
    lead: false,
    time: "Just now",
    text,
    attachment: null,
    comments: [],
  });
  input.value = "";
  renderFeed();
});

// ============================================================
// My Team
// ============================================================

const MY_TEAM = [
  { name: "Vero Salcedo", role: "Program Coordinator", online: true },
  { name: "Ariel Domingo", role: "Online Missionary", online: true },
  { name: "Andi Pratama", role: "Online Missionary", online: true },
  { name: "Marco Villanueva", role: "Online Missionary", online: false },
  { name: "Daniel Kurniawan", role: "Online Missionary", online: false },
];

document.getElementById("myteam-list").innerHTML = MY_TEAM.map((person) => {
  const stage = avatarStage(person.name);
  return `
    <li class="egd-myteam-row">
      <span class="egd-avatar" style="width:36px;height:36px;font-size:12px;background: var(${stage.var})">${initials(person.name)}</span>
      <span class="egd-myteam-row__body">
        <span class="egd-myteam-row__name-line">
          <span class="egd-myteam-row__name">${escapeHtml(person.name)}</span>
          <span class="egd-status${person.online ? " egd-status--online" : ""}">${person.online ? "Online" : "Offline"}</span>
        </span>
        <span class="egd-myteam-row__role">${escapeHtml(person.role)}</span>
      </span>
      <button class="egd-myteam-row__msg" type="button" data-message-teammate="${escapeHtml(person.name)}" aria-label="Message ${escapeHtml(person.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
      </button>
    </li>
  `;
}).join("");

// A message icon that jumps to Team Feed with the composer pre-addressed,
// rather than opening a second messaging surface this brief never asked for
// ("don't create a second chat/assistant surface" applies here too).
document.getElementById("myteam-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-message-teammate]");
  if (!button) return;
  const input = document.getElementById("feed-composer-input");
  input.value = `@${button.dataset.messageTeammate} `;
  document.getElementById("feed-title").scrollIntoView({ behavior: "smooth", block: "start" });
  input.focus();
});

// ============================================================
// Formation & Training
// ============================================================

const ONBOARD_STATE = {
  week: 6,
  ofWeeks: 12,
  qaWeeksLeft: 4,
  tasks: [
    { id: "echo", title: "ECHO training", meta: "Completed week 1", done: true },
    { id: "conversation", title: "Conversation training", meta: "Completed week 2", done: true },
    { id: "trauma", title: "Trauma-informed care", meta: "Sent by Siji · due Friday", done: false },
    { id: "handoff-protocol", title: "Local church handoff protocol", meta: "Unlocks after trauma-informed care", done: false },
  ],
  coachingNote: "Your check-ins with Seeker #340 showed real patience — keep leading with listening before offering scripture.",
  coachingFrom: "Vero",
};

function renderOnboarding() {
  document.getElementById("onboard-progress").innerHTML = `
    <strong>Week ${ONBOARD_STATE.week} of ${ONBOARD_STATE.ofWeeks}</strong> · QA monitoring: ${ONBOARD_STATE.qaWeeksLeft} weeks left
  `;

  document.getElementById("onboard-tasks").innerHTML = ONBOARD_STATE.tasks
    .map(
      (task) => `
    <li class="egd-onboard-task${task.done ? " is-done" : ""}" data-task-id="${task.id}">
      ${
        task.done
          ? '<svg class="egd-onboard-task__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 5-5" /></svg>'
          : '<svg class="egd-onboard-task__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>'
      }
      <span class="egd-onboard-task__body">
        <span class="egd-onboard-task__title">${escapeHtml(task.title)}</span>
        <span class="egd-onboard-task__meta">${escapeHtml(task.meta)}</span>
      </span>
      <button class="egd-onboard-task__toggle" type="button" data-toggle-task="${task.id}">${task.done ? "Completed" : "Mark done"}</button>
    </li>
  `
    )
    .join("");

  document.getElementById("onboard-coaching-note").innerHTML = `
    <strong>Coaching note from ${escapeHtml(ONBOARD_STATE.coachingFrom)}:</strong> ${escapeHtml(ONBOARD_STATE.coachingNote)}
  `;
}

renderOnboarding();

document.getElementById("onboard-tasks").addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-task]");
  if (!toggle) return;
  const task = ONBOARD_STATE.tasks.find((t) => t.id === toggle.dataset.toggleTask);
  if (!task || task.done) return;
  task.done = true;
  renderOnboarding();
});

// ============================================================
// How I'm Doing
// ============================================================

const WELLBEING = {
  activeToday: 6,
  heavyToday: 2,
  hoursToday: "3h 40m",
};

document.getElementById("wellbeing-body").innerHTML = `
  <p class="egd-wellbeing-row"><span>Conversations today</span> <strong>${WELLBEING.activeToday} active · ${WELLBEING.heavyToday} heavy</strong></p>
  <p class="egd-wellbeing-row"><span>Hours online today</span> <strong>${WELLBEING.hoursToday}</strong></p>
  <p class="egd-wellbeing-note">It's okay to skip to the next chat if you don't know what to say — that's a healthy response, not a dip.</p>
`;

document.getElementById("wellbeing-flag-btn").addEventListener("click", () => {
  const button = document.getElementById("wellbeing-flag-btn");
  const hint = document.getElementById("wellbeing-hint");
  if (hint.hidden) {
    hint.hidden = false;
    button.disabled = true;
    FEED.unshift({
      id: `f${Date.now()}`,
      author: "Joseph Wijaya",
      role: "Online Missionary",
      lead: false,
      time: "Just now",
      text: "Flagged that I could use some support this week.",
      attachment: null,
      comments: [],
    });
    renderFeed();
  }
});

// ============================================================
// Quick Actions + in-page section nav
// ============================================================

const QUICK_ACTIONS = [
  { icon: '<circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />', label: "Search my conversations", target: "#queue-title" },
  { icon: '<path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" />', label: "Review my shift", target: "#shift-title" },
  { icon: '<circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" /><circle cx="18" cy="7.5" r="2.5" /><path d="M15.8 14.5c2.9.3 5.7 2 5.7 5.5" />', label: "Ask the team a question", target: "#feed-title" },
  { icon: '<path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /><path d="M9 13h6" /><path d="M9 17h6" />', label: "Continue my training", target: "#onboarding-title" },
];

document.getElementById("quick-actions").innerHTML = QUICK_ACTIONS.map(
  (action) => `
    <a class="egd-quick-action" href="${action.target}">
      <span class="egd-quick-action__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${action.icon}</svg>
      </span>
      ${escapeHtml(action.label)}
    </a>
  `
).join("");

const topbar = document.querySelector(".egd-topbar");
const SCROLL_OFFSET_GAP = 16;

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const topbarHeight = topbar?.getBoundingClientRect().height ?? 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: targetTop - topbarHeight - SCROLL_OFFSET_GAP, behavior: "smooth" });
}

document.querySelectorAll(".egd-quick-action, .egd-section-nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    event.preventDefault();
    scrollToSection(href);
  });
});
