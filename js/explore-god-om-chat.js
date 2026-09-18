/**
 * OneHope CRM — Online Missionary conversation workspace — data + rendering
 * for /ExploreGod-OM-Chat.
 *
 * Same one-file-per-page convention as the other lenses on this CRM: small
 * helpers are duplicated rather than imported, and every panel is rendered
 * from small in-file arrays standing in for a real conversation/CRM feed —
 * see DESIGN.md's "Thirteenth page" note for this page's scope.
 *
 * Reached with an optional `?seeker=NNNN` query param (set by "Resume chat"/
 * "Start chat" links on /ExploreGod-OM-Dashboard) — that seeker's tab opens
 * and becomes active on load, alongside a few conversations already open by
 * default so the multi-tab behavior is visible without extra clicks.
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

const JOURNEY_BLURB = {
  new: "Just getting to know each other — focus on trust and curiosity, not answers yet.",
  active: "An active, ongoing relationship — keep showing up consistently.",
  growing: "Going deeper into faith — a good time to introduce scripture and community.",
  handoff: "Ready for local church connection — begin the handoff checklist when the timing feels right.",
};

const PRIORITY_META = {
  waiting: { color: "--egd-critical", label: "Waiting for you" },
  expiring: { color: "--egd-critical", label: "Expires soon" },
  followup: { color: "--egd-warning", label: "Follow-up needed" },
  escalated: { color: "--egd-critical", label: "Escalated" },
  none: { color: "--egd-good", label: "You replied" },
};

// A tiny word-substitution mock (no real translation service is wired up
// anywhere in this product) used two ways: showing a seeker's message in an
// approximation of their own language below the auto-translated English
// Joseph normally sees, and previewing what an outgoing reply would look
// like once translated before sending.
const EN_ID_DICTIONARY = {
  hello: "halo",
  hi: "hai",
  thank: "terima",
  thanks: "terima kasih",
  you: "kamu",
  god: "Tuhan",
  jesus: "Yesus",
  pray: "berdoa",
  prayer: "doa",
  love: "kasih",
  hope: "harapan",
  today: "hari ini",
  feeling: "perasaan",
  how: "bagaimana",
  understand: "mengerti",
  good: "baik",
  morning: "pagi",
  family: "keluarga",
  church: "gereja",
  faith: "iman",
  read: "membaca",
  scripture: "firman",
  peace: "damai",
  welcome: "selamat datang",
  here: "di sini",
  with: "dengan",
  glad: "senang",
  sorry: "maaf",
  okay: "baik",
};

function mockLocalize(text) {
  return text
    .split(/(\s+)/)
    .map((word) => {
      const clean = word.toLowerCase().replace(/[.,!?]/g, "");
      const match = EN_ID_DICTIONARY[clean];
      return match ? word.replace(new RegExp(clean, "i"), match) : word;
    })
    .join("");
}

// ============================================================
// Seeker + conversation data
// ============================================================
// Mirrors the shape of /ExploreGod-OM-Dashboard's own QUEUE array (a
// separate, independently maintained mock feed — see this project's
// one-file-per-page convention) so any "Resume chat" link from there
// resolves to a matching conversation here.

const SEEKERS = {
  "512": { stage: "new", language: "Bahasa Indonesia", topic: "Feeling anxious about exams, asked for prayer", priority: "waiting" },
  "489": { stage: "active", language: "Javanese", topic: "Wants to talk about family conflict again", priority: "expiring" },
  "365": { stage: "growing", language: "Bahasa Indonesia", topic: "Said they'd share their story of coming to faith", priority: "followup" },
  "201": { stage: "active", language: "English", topic: "Escalated — mentioned feeling hopeless", priority: "escalated" },
  "150": { stage: "handoff", language: "Bahasa Indonesia", topic: "Shared they were baptized last month!", priority: "none" },
  "340": { stage: "handoff", language: "Bahasa Indonesia", topic: "Ready to connect with a local church in Surabaya", priority: "none" },
  "276": { stage: "active", language: "Javanese", topic: "Asked what the Bible says about forgiveness", priority: "none" },
  "198": { stage: "new", language: "English", topic: "First message — curious about who Jesus is", priority: "waiting" },
  "422": { stage: "growing", language: "Bahasa Indonesia", topic: "Quiet since last week, hasn't replied", priority: "followup" },
};

const CONVERSATIONS = {
  "512": {
    messages: [
      { from: "seeker", text: "Hi... I have a big exam this week and I'm really anxious. Can you pray for me?", time: "9:02 AM" },
      { from: "om", text: "Of course, I'd love to pray for you. What's making you most anxious about it?", time: "9:05 AM" },
      { from: "seeker", text: "I'm scared I'll disappoint my parents if I fail.", time: "9:24 AM" },
    ],
    aiNextTopic: "Gently explore where that fear of disappointing their parents comes from before moving to reassurance.",
    aiGuidance: "Reflect their fear back to them first (“that sounds like a lot of pressure”) — resist the urge to jump straight to a comforting verse.",
    aiExamples: [
      "One missionary asked “what would it mean if they were disappointed?” — it surfaced a much older wound about worth and performance.",
      "Another simply prayed with them in the moment instead of promising it would go well.",
    ],
    vero: { text: "This is a good one to practice sitting with someone's fear before reassuring them. You're doing great with #512.", time: "Today" },
  },
  "489": {
    messages: [
      { from: "seeker", text: "Sorry to message again. Things got worse with my dad last night.", time: "7:40 PM" },
      { from: "om", text: "You never need to apologize for reaching out — I'm glad you did. I'm here.", time: "7:44 PM" },
      { from: "seeker", text: "He said some things that really hurt. I don't know how to respond to him anymore.", time: "7:52 PM" },
      { from: "om", text: "That sounds so painful. Can you tell me a bit more about what happened?", time: "7:58 PM" },
    ],
    aiNextTopic: "Ask what support looks like for them right now — advice, or just someone to listen.",
    aiGuidance: "This conversation's window closes soon — a short, warm reply now matters more than a long one later.",
    aiExamples: [
      "One missionary asked directly: “do you want ideas, or do you just need me to listen right now?”",
      "Another affirmed the seeker's feelings before anything else: “it makes sense that hurt.”",
    ],
    vero: { text: "Keep this one short and warm before the window closes — you can go deeper with them tomorrow.", time: "45m ago" },
  },
  "365": {
    messages: [
      { from: "seeker", text: "I've been thinking a lot about what you shared last time.", time: "Yesterday" },
      { from: "om", text: "That makes me really glad to hear. What's been on your mind?", time: "Yesterday" },
      { from: "seeker", text: "I think I want to share my story sometime — how I started believing. Is that okay?", time: "Yesterday" },
    ],
    aiNextTopic: "Invite them to share their story now — this is a meaningful open door, not a scheduling question.",
    aiGuidance: "Respond with genuine excitement before anything logistical — this is a big step for them to offer.",
    aiExamples: [
      "One missionary replied “I would be honored to hear it, whenever you're ready” and let the seeker set the pace.",
      "Another asked one gentle follow-up question rather than a whole list, to keep the door open without overwhelming them.",
    ],
    vero: { text: "This is exactly the kind of opening worth following up on today — don't let it sit past the promised follow-up.", time: "Today" },
  },
  "201": {
    messages: [
      { from: "seeker", text: "I don't see the point anymore. Nothing feels like it's getting better.", time: "10:12 AM" },
      { from: "om", text: "Thank you for trusting me with that. I'm really glad you told me — you're not alone in this.", time: "10:15 AM" },
      { from: "seeker", text: "I don't know who else to talk to.", time: "10:18 AM" },
    ],
    aiNextTopic: "Stay present and check on their immediate safety before anything else — this isn't a moment for scripture yet.",
    aiGuidance: "This was escalated for a reason — consider using “Get help with this one” now rather than after the conversation.",
    aiExamples: [
      "One missionary asked directly and gently about safety, then looped in a coordinator right away.",
      "Another stayed in the conversation, replying briefly and often, until a coordinator could join.",
    ],
    vero: { text: "I saw this one come through and flagged it for extra eyes. Please use Get Help below if you need a second voice — I'm also checking in with you after your shift either way.", time: "10m ago" },
  },
};

function buildGenericConversation(id) {
  const seeker = SEEKERS[id];
  return {
    messages: [{ from: "seeker", text: seeker.topic, time: "recently" }],
    aiNextTopic: `Continue the conversation about "${seeker.topic.toLowerCase()}."`,
    aiGuidance: "Lead with a question before offering an answer — let them set the pace of what they share next.",
    aiExamples: [
      "One missionary let a similar conversation unfold over two weeks before introducing scripture.",
      "Another simply said “tell me more” — it opened up what was really going on underneath.",
    ],
    vero: { text: "Nothing flagged here yet — just keep showing up consistently.", time: "—" },
  };
}

const conversationCache = {};

function getConversation(id) {
  if (conversationCache[id]) return conversationCache[id];
  const seeker = SEEKERS[id];
  if (!seeker) return null;
  const base = CONVERSATIONS[id] ?? buildGenericConversation(id);
  conversationCache[id] = {
    id,
    stage: seeker.stage,
    language: seeker.language,
    priority: seeker.priority,
    messages: base.messages.map((message, index) => ({ ...message, id: `${id}-${index}` })),
    aiNextTopic: base.aiNextTopic,
    aiGuidance: base.aiGuidance,
    aiExamples: base.aiExamples,
    vero: base.vero,
    showOriginal: false,
    askAnswer: null,
    helpPickerOpen: false,
    helpConfirm: null,
    outcome: null,
    outcomeNoteOpen: false,
  };
  return conversationCache[id];
}

// ============================================================
// Tab state
// ============================================================

let openTabs = [];
let activeId = null;

function initTabs() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("seeker");
  openTabs = ["512", "489", "365"];
  activeId = "512";
  if (requested && SEEKERS[requested]) {
    if (!openTabs.includes(requested)) openTabs.push(requested);
    activeId = requested;
  }
}

function setActive(id) {
  activeId = id;
  renderTabs();
  renderConversation();
}

function closeTab(id) {
  const index = openTabs.indexOf(id);
  if (index === -1) return;
  openTabs.splice(index, 1);
  if (activeId === id) {
    activeId = openTabs[index] ?? openTabs[index - 1] ?? null;
  }
  renderTabs();
  renderConversation();
}

const chatTabs = document.getElementById("chat-tabs");

// Each open conversation needs two independent controls — select it, close
// it — so this can't use the strict ARIA tabs pattern (a `role="tab"` isn't
// allowed to contain another interactive control). Instead each item is a
// plain container with two sibling <button>s: selecting and closing.
function renderTabs() {
  chatTabs.innerHTML = openTabs
    .map((id) => {
      const conversation = getConversation(id);
      const meta = PRIORITY_META[conversation.priority];
      const active = id === activeId;
      return `
        <div class="egd-chat-tab${active ? " is-active" : ""}">
          <button class="egd-chat-tab__select" type="button" data-select-tab="${id}" aria-current="${active}">
            <span class="egd-chat-tab__status" style="--status-color: var(${meta.color})" aria-hidden="true"></span>
            <span class="egd-chat-tab__name">Seeker #${id}</span>
            <span class="visually-hidden">${escapeHtml(meta.label)}</span>
          </button>
          <button class="egd-chat-tab__close" type="button" data-close-tab="${id}" aria-label="Close Seeker #${id} tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      `;
    })
    .join("");
}

chatTabs.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close-tab]");
  if (close) {
    closeTab(close.dataset.closeTab);
    return;
  }
  const select = event.target.closest("[data-select-tab]");
  if (select) setActive(select.dataset.selectTab);
});

// ============================================================
// Active conversation rendering
// ============================================================

// English-speaking seekers have nothing to translate — the toggle and
// "before sending" checkbox only make sense for a conversation in another
// language/dialect.
function needsTranslation(conversation) {
  return conversation.language !== "English";
}

const chatEmpty = document.getElementById("chat-empty");
const chatActive = document.getElementById("chat-active");
const chatMessages = document.getElementById("chat-messages");
const chatHeader = document.getElementById("chat-header");
const translateBar = document.getElementById("translate-bar");
const aiRecs = document.getElementById("ai-recs");
const chatContext = document.getElementById("chat-context");

function renderMessages(conversation) {
  chatMessages.innerHTML = conversation.messages
    .map((message) => {
      const isSeeker = message.from === "seeker";
      const translation =
        (isSeeker && conversation.showOriginal) || (!isSeeker && message.translationPreview)
          ? `<p class="egd-chat-bubble__translation">${
              isSeeker
                ? `Original (${escapeHtml(conversation.language)}): ${escapeHtml(mockLocalize(message.text))}`
                : `Translated to ${escapeHtml(conversation.language)} (preview): ${escapeHtml(mockLocalize(message.text))}`
            }</p>`
          : "";
      return `
        <div class="egd-chat-bubble-row egd-chat-bubble-row--${isSeeker ? "seeker" : "om"}">
          <div class="egd-chat-bubble">${escapeHtml(message.text)}</div>
          ${translation}
          <span class="egd-chat-bubble-row__time">${escapeHtml(message.time)}</span>
        </div>
      `;
    })
    .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderHeader(conversation) {
  const stage = avatarStage(conversation.id);
  const translatable = needsTranslation(conversation);
  chatHeader.innerHTML = `
    <span class="egd-avatar" style="background: var(${stage.var})">${initials(`S ${conversation.id}`)}</span>
    <span class="egd-chat-header__body">
      <h1 class="egd-chat-header__name">Seeker #${conversation.id}</h1>
      <span class="egd-chat-header__meta">${escapeHtml(conversation.language)} · ${stageById(conversation.stage).label} stage</span>
    </span>
    ${
      translatable
        ? `<button class="egd-chat-header__translate-btn${conversation.showOriginal ? " is-active" : ""}" type="button" id="translate-toggle-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h9" /><path d="M9 5v3.5c0 5-3 8.5-6 10" /><path d="M6 13c1.5 1.7 4 3 6.5 3" /><path d="m13 21 4-9 4 9" /><path d="M15 18h4" /></svg>
      ${conversation.showOriginal ? "Showing original" : "Show original language"}
    </button>`
        : ""
    }
  `;

  if (!translatable) return;
  document.getElementById("translate-toggle-btn").addEventListener("click", () => {
    conversation.showOriginal = !conversation.showOriginal;
    renderHeader(conversation);
    renderTranslateBar(conversation);
    renderMessages(conversation);
  });
}

const CHAT_DIALECTS = ["Bahasa Indonesia (formal)", "Bahasa Indonesia (Jawa dialect)", "English"];

function renderTranslateBar(conversation) {
  translateBar.hidden = !conversation.showOriginal;
  if (!conversation.showOriginal) return;
  translateBar.innerHTML = `
    Showing seeker messages in their own language.
    <label class="visually-hidden" for="dialect-select">Dialect</label>
    <select id="dialect-select">
      ${CHAT_DIALECTS.map((d) => `<option${d === conversation.language ? " selected" : ""}>${escapeHtml(d)}</option>`).join("")}
    </select>
  `;
}

function renderAiPanel(conversation) {
  aiRecs.innerHTML = `
    <div class="egd-chat-ai-card">
      <span class="egd-chat-ai-card__label">Suggested next topic</span>
      <p class="egd-chat-ai-card__text">${escapeHtml(conversation.aiNextTopic)}</p>
    </div>
    <div class="egd-chat-ai-card">
      <span class="egd-chat-ai-card__label">In the moment</span>
      <p class="egd-chat-ai-card__text">${escapeHtml(conversation.aiGuidance)}</p>
    </div>
    <div class="egd-chat-ai-card">
      <span class="egd-chat-ai-card__label">What good looked like</span>
      <ul class="egd-chat-ai-card__examples">
        ${conversation.aiExamples.map((example) => `<li class="egd-chat-ai-card__example">${escapeHtml(example)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderContext(conversation) {
  const stage = stageById(conversation.stage);

  chatContext.innerHTML = `
    <div class="egd-context-card egd-vero-card">
      <p class="egd-context-card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        Message from Vero
      </p>
      <div class="egd-vero-card__from">
        <span class="egd-avatar" style="width:26px;height:26px;font-size:10px;background: var(--egd-stage-new)">VS</span>
        <span class="egd-vero-card__from-name">Vero Salcedo</span>
        <span class="egd-vero-card__from-time">${escapeHtml(conversation.vero.time)}</span>
      </div>
      <p class="egd-vero-card__text">${escapeHtml(conversation.vero.text)}</p>
      <form class="egd-vero-card__reply" id="vero-reply-form">
        <label class="visually-hidden" for="vero-reply-input">Reply to Vero</label>
        <input type="text" id="vero-reply-input" placeholder="Reply to Vero…" />
        <button type="submit">Send</button>
      </form>
      <span class="egd-vero-card__ask-label">Ask AI a question</span>
      <form class="egd-vero-card__ask" id="ask-ai-form">
        <label class="visually-hidden" for="ask-ai-input">Ask AI a question about this conversation</label>
        <input type="text" id="ask-ai-input" placeholder="e.g. how do I bring up baptism gently?" />
        <button type="submit">Ask</button>
      </form>
      <p class="egd-vero-card__ask-answer" id="ask-ai-answer" ${conversation.askAnswer ? "" : "hidden"}>${conversation.askAnswer ? escapeHtml(conversation.askAnswer) : ""}</p>
    </div>

    <div class="egd-context-card">
      <p class="egd-context-card__title">Seeker Journey</p>
      <span class="egd-journey-flag" style="--stage-color: var(${stage.var}); --stage-soft: var(${stage.soft}); --stage-text: var(${stage.text})">${stage.label}</span>
      <p class="egd-journey-blurb">${escapeHtml(JOURNEY_BLURB[conversation.stage])}</p>
    </div>

    <div class="egd-context-card">
      <p class="egd-context-card__title">Get help with this one</p>
      <div class="egd-help-actions">
        <button class="egd-help-btn egd-help-btn--escalate" type="button" id="escalate-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          Escalate to Vero
        </button>
        <button class="egd-help-btn" type="button" id="ask-teammate-btn" aria-expanded="${conversation.helpPickerOpen}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" /><circle cx="18" cy="7.5" r="2.5" /><path d="M15.8 14.5c2.9.3 5.7 2 5.7 5.5" /></svg>
          Ask a teammate
        </button>
        <div class="egd-help-picker" id="help-picker" ${conversation.helpPickerOpen ? "" : "hidden"}>
          ${["Ariel Domingo", "Andi Pratama", "Siji Oommen"].map((name) => `<button type="button" data-ask-teammate="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
        </div>
      </div>
      <p class="egd-help-confirm" id="help-confirm" ${conversation.helpConfirm ? "" : "hidden"}>${conversation.helpConfirm ? escapeHtml(conversation.helpConfirm) : ""}</p>
    </div>

    <div class="egd-context-card">
      <p class="egd-context-card__title">Capture what happened</p>
      <div class="egd-outcome-chips" id="outcome-chips">
        ${["Meaningful conversation", "Follow-up needed", "Ready for next step", "Other"]
          .map((label) => `<button class="egd-outcome-chip${conversation.outcome === label ? " is-picked" : ""}" type="button" data-outcome="${escapeHtml(label)}">${escapeHtml(label)}</button>`)
          .join("")}
      </div>
      <form class="egd-outcome-note" id="outcome-note-form" ${conversation.outcomeNoteOpen ? "" : "hidden"}>
        <label class="visually-hidden" for="outcome-note-input">Note</label>
        <input type="text" id="outcome-note-input" placeholder="What happened, briefly…" />
        <button type="submit">Save</button>
      </form>
      <p class="egd-outcome-done" ${conversation.outcome && conversation.outcome !== "Other" ? "" : "hidden"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        Saved
      </p>
    </div>
  `;

  wireContextEvents(conversation);
}

function wireContextEvents(conversation) {
  document.getElementById("vero-reply-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("vero-reply-input");
    if (!input.value.trim()) return;
    input.value = "";
    input.placeholder = "Sent to Vero";
  });

  document.getElementById("ask-ai-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("ask-ai-input");
    const question = input.value.trim();
    if (!question) return;
    conversation.askAnswer = `Try leading with a question rather than an answer here — ask what "${question.replace(/\?$/, "")}" means to them specifically before responding.`;
    input.value = "";
    renderContext(conversation);
  });

  document.getElementById("escalate-btn").addEventListener("click", () => {
    conversation.helpConfirm = "Escalated to Vero — she can see this full conversation now.";
    conversation.helpPickerOpen = false;
    renderContext(conversation);
  });

  document.getElementById("ask-teammate-btn").addEventListener("click", () => {
    conversation.helpPickerOpen = !conversation.helpPickerOpen;
    renderContext(conversation);
  });

  document.getElementById("help-picker").addEventListener("click", (event) => {
    const button = event.target.closest("[data-ask-teammate]");
    if (!button) return;
    conversation.helpConfirm = `Asked ${button.dataset.askTeammate} for a second opinion — they'll see this conversation's context.`;
    conversation.helpPickerOpen = false;
    renderContext(conversation);
  });

  document.getElementById("outcome-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-outcome]");
    if (!chip) return;
    conversation.outcome = chip.dataset.outcome;
    conversation.outcomeNoteOpen = chip.dataset.outcome === "Other";
    renderContext(conversation);
  });

  document.getElementById("outcome-note-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("outcome-note-input");
    if (!input.value.trim()) return;
    conversation.outcomeNoteOpen = false;
    renderContext(conversation);
  });
}

function renderConversation() {
  const conversation = activeId ? getConversation(activeId) : null;
  chatEmpty.hidden = !!conversation;
  chatActive.style.display = conversation ? "flex" : "none";
  if (!conversation) return;

  renderHeader(conversation);
  renderTranslateBar(conversation);
  renderMessages(conversation);
  renderAiPanel(conversation);
  renderContext(conversation);
  resetLearnSearch();

  const translateLabel = document.getElementById("translate-outgoing-label");
  const translatable = needsTranslation(conversation);
  translateLabel.hidden = !translatable;
  if (!translatable) document.getElementById("translate-outgoing-toggle").checked = false;
}

// ============================================================
// Learn at the point of need
// ============================================================

const LEARN_LIBRARY = [
  { title: "Responding to anxiety", body: "Reflect the feeling back before offering reassurance — “that sounds really heavy” before any “it will be okay.”" },
  { title: "When a seeker asks about baptism", body: "Ask what they think baptism means before explaining it — their question often reveals what they actually need answered." },
  { title: "De-escalating a heavy conversation", body: "Slow your pace, ask fewer questions, and use “Get help with this one” early rather than after it becomes urgent." },
  { title: "Introducing scripture naturally", body: "Let a verse answer a question they already asked, rather than opening with one unprompted." },
  { title: "What to say when you don't know what to say", body: "“I don't have a perfect answer, but I'm glad you told me” is always a true, safe thing to say." },
  { title: "Using Get Help well", body: "Escalating isn't failing the seeker — it's often the most caring thing you can do for them." },
];

const learnSearchInput = document.getElementById("learn-search-input");
const learnResults = document.getElementById("learn-results");

function resetLearnSearch() {
  learnSearchInput.value = "";
  learnResults.hidden = true;
  aiRecs.style.display = "";
}

learnSearchInput.addEventListener("input", () => {
  const query = learnSearchInput.value.trim().toLowerCase();
  if (!query) {
    learnResults.hidden = true;
    aiRecs.style.display = "";
    return;
  }
  const matches = LEARN_LIBRARY.filter((tip) => `${tip.title} ${tip.body}`.toLowerCase().includes(query));
  aiRecs.style.display = "none";
  learnResults.hidden = false;
  learnResults.innerHTML = matches.length
    ? matches
        .map(
          (tip) => `
      <div class="egd-chat-ai__learn-item">
        <span class="egd-chat-ai__learn-title">${escapeHtml(tip.title)}</span>
        <span class="egd-chat-ai__learn-body">${escapeHtml(tip.body)}</span>
      </div>
    `
        )
        .join("")
    : `<div class="egd-chat-ai__learn-item"><span class="egd-chat-ai__learn-body">No matches — try a different word.</span></div>`;
});

// ============================================================
// Composer: text, attachments, emoji, translate-before-sending
// ============================================================

const composerForm = document.getElementById("chat-composer");
const composerInput = document.getElementById("composer-input");
const composerAttachments = document.getElementById("composer-attachments");
const attachBtn = document.getElementById("attach-btn");
const attachInput = document.getElementById("attach-input");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const translateOutgoingToggle = document.getElementById("translate-outgoing-toggle");

let pendingAttachments = [];

function renderAttachments() {
  composerAttachments.innerHTML = pendingAttachments
    .map(
      (name, index) => `
    <span class="egd-chat-attachment-chip">
      ${escapeHtml(name)}
      <button type="button" data-remove-attachment="${index}" aria-label="Remove ${escapeHtml(name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    </span>
  `
    )
    .join("");
}

attachBtn.addEventListener("click", () => attachInput.click());

attachInput.addEventListener("change", () => {
  pendingAttachments.push(...Array.from(attachInput.files).map((file) => file.name));
  attachInput.value = "";
  renderAttachments();
});

composerAttachments.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-attachment]");
  if (!button) return;
  pendingAttachments.splice(Number(button.dataset.removeAttachment), 1);
  renderAttachments();
});

const EMOJI_SET = ["🙏", "❤️", "😊", "🙌", "✝️", "🕊️", "💬", "👍", "🌿", "☀️", "📖", "🤝"];
emojiPicker.innerHTML = EMOJI_SET.map((emoji) => `<button type="button" data-emoji="${emoji}">${emoji}</button>`).join("");

emojiBtn.addEventListener("click", () => {
  const opening = emojiPicker.hidden;
  emojiPicker.hidden = !opening;
  emojiBtn.setAttribute("aria-expanded", String(opening));
});

emojiPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-emoji]");
  if (!button) return;
  composerInput.value += button.dataset.emoji;
  composerInput.focus();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#emoji-btn, #emoji-picker")) return;
  emojiPicker.hidden = true;
  emojiBtn.setAttribute("aria-expanded", "false");
});

composerInput.addEventListener("input", () => {
  composerInput.style.height = "auto";
  composerInput.style.height = `${Math.min(composerInput.scrollHeight, 120)}px`;
});

composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composerForm.requestSubmit();
  }
});

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeId) return;
  const text = composerInput.value.trim();
  const attachmentNote = pendingAttachments.length ? ` [${pendingAttachments.map((n) => `📎 ${n}`).join(", ")}]` : "";
  if (!text && !pendingAttachments.length) return;

  const conversation = getConversation(activeId);
  const message = {
    id: `${activeId}-${conversation.messages.length}`,
    from: "om",
    text: `${text}${attachmentNote}`,
    time: "Just now",
    translationPreview: translateOutgoingToggle.checked,
  };
  conversation.messages.push(message);

  // Replying moves the ball back to the seeker's court — the tab's priority
  // chip should reflect that immediately rather than stay stuck on
  // "Waiting for you" after Joseph has, in fact, just replied.
  if (conversation.priority !== "none") {
    conversation.priority = "none";
    renderTabs();
  }

  composerInput.value = "";
  composerInput.style.height = "auto";
  pendingAttachments = [];
  renderAttachments();
  renderMessages(conversation);
});

// ============================================================
// Boot
// ============================================================

initTabs();
renderTabs();
renderConversation();
