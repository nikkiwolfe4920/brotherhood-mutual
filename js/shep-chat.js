import { ICONS } from "../design-system/icons.js";

const AUTO_OPEN_DELAY_MS = 4500;
const TYPING_DELAY_MS = 900;
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SESSION_KEY = "shep-auto-opened";
const DISMISS_KEY = "shep-last-dismiss";

const root = document.getElementById("shep-root");
if (root) {
  initShep(root);
}

function initShep(root) {
  root.innerHTML = `
    <div class="shep">
      <div class="shep__panel-slot"></div>
      <button
        class="shep__launcher"
        type="button"
        id="shep-launcher"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-label="Chat with Shep, our ministry assistant"
      >
        <span class="shep__launcher-avatar">${ICONS.compass}</span>
        <span class="shep__launcher-label">Chat with Shep</span>
        <span class="shep__badge" aria-hidden="true"></span>
      </button>
    </div>
  `;

  const launcher = root.querySelector("#shep-launcher");
  const panelSlot = root.querySelector(".shep__panel-slot");
  launcher.classList.add("is-idle-pulse");

  let panel = null;
  let hasGreeted = false;

  function renderPanel() {
    panel = document.createElement("div");
    panel.className = "shep__panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Chat with Shep");
    panel.innerHTML = `
      <div class="shep__header">
        <span class="shep__header-avatar">${ICONS.compass}</span>
        <div class="shep__header-text">
          <p class="shep__header-name">Shep</p>
          <p class="shep__header-status">Ministry trip assistant</p>
        </div>
        <button class="shep__close" type="button" aria-label="Close chat">${ICONS.close}</button>
      </div>
      <div class="shep__messages" role="log" aria-live="polite"></div>
      <div class="shep__quick-replies" hidden></div>
      <form class="shep__form">
        <label class="visually-hidden" for="shep-input">Message Shep</label>
        <input
          class="shep__input"
          id="shep-input"
          type="text"
          placeholder="Ask Shep a question..."
          autocomplete="off"
        />
        <button class="shep__send" type="submit" aria-label="Send message">${ICONS.send}</button>
      </form>
    `;
    panelSlot.appendChild(panel);

    panel.querySelector(".shep__close").addEventListener("click", closePanel);
    panel.querySelector(".shep__form").addEventListener("submit", onSubmit);

    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
        return;
      }
      if (event.key === "Tab") trapFocus(event, panel);
    });
  }

  function trapFocus(event, container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openPanel({ auto = false } = {}) {
    if (panel) return;
    renderPanel();
    launcher.setAttribute("aria-expanded", "true");
    launcher.classList.remove("is-idle-pulse");

    if (!hasGreeted) {
      hasGreeted = true;
      showTyping().then(() => {
        addMessage(
          "shep",
          "Hi, I'm Shep \u{1F44B} Planning a mission trip with your ministry? We'd love to help make sure it's protected — want to learn more about mission trip insurance?"
        );
        showQuickReplies([
          { label: "Yes, tell me more", value: "yes" },
          { label: "Not right now", value: "no" },
        ]);
      });
    }

    window.requestAnimationFrame(() => {
      panel.querySelector(".shep__close")?.focus();
    });

    if (!auto) {
      panel.querySelector("#shep-input")?.focus();
    }
  }

  function closePanel() {
    if (!panel) return;
    panel.remove();
    panel = null;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  function showTyping() {
    return new Promise((resolve) => {
      const messagesEl = panel.querySelector(".shep__messages");
      const typing = document.createElement("div");
      typing.className = "shep__typing";
      typing.setAttribute("aria-hidden", "true");
      typing.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      window.setTimeout(() => {
        typing.remove();
        resolve();
      }, TYPING_DELAY_MS);
    });
  }

  function addMessage(from, text) {
    if (!panel) return;
    const messagesEl = panel.querySelector(".shep__messages");
    const bubble = document.createElement("p");
    bubble.className = `shep__bubble shep__bubble--${from}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showQuickReplies(options) {
    if (!panel) return;
    const container = panel.querySelector(".shep__quick-replies");
    container.hidden = false;
    container.innerHTML = "";
    for (const option of options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shep__quick-reply";
      btn.textContent = option.label;
      btn.addEventListener("click", () => onQuickReply(option, container));
      container.appendChild(btn);
    }
  }

  async function onQuickReply(option, container) {
    container.hidden = true;
    container.innerHTML = "";
    addMessage("user", option.label);

    await showTyping();

    if (option.value === "yes") {
      addMessage(
        "shep",
        "Mission trip coverage can include emergency medical care, trip interruption, and liability while your team is serving abroad. Want a specialist to follow up, or would you rather browse the details first?"
      );
      showQuickReplies([
        { label: "Get a quote", value: "quote" },
        { label: "See coverage details", value: "details" },
      ]);
    } else if (option.value === "no") {
      addMessage("shep", "No problem — I'll be right here if you change your mind.");
    } else if (option.value === "quote") {
      addMessage("shep", "Great — heading you to our quote request form now.");
      window.location.hash = "quote";
    } else if (option.value === "details") {
      addMessage(
        "shep",
        "You can see everything mission trip protection covers under “Insure Your Ministry” in the main menu — or just ask me anything here."
      );
    }

    // The quick-reply button that was just clicked is now detached from the
    // DOM (its container was cleared above), which silently drops keyboard
    // focus. Land it somewhere useful instead of letting it vanish.
    panel?.querySelector("#shep-input")?.focus();
  }

  async function onSubmit(event) {
    event.preventDefault();
    const input = panel.querySelector("#shep-input");
    const value = input.value.trim();
    if (!value) return;

    addMessage("user", value);
    input.value = "";

    await showTyping();
    addMessage(
      "shep",
      "Thanks for asking! For specifics like that, our team can give you a real answer — request a quote and a mission-trip specialist will follow up, or keep chatting with me about the basics."
    );
    showQuickReplies([{ label: "Get a quote", value: "quote" }]);
  }

  launcher.addEventListener("click", () => {
    if (panel) {
      closePanel();
    } else {
      openPanel();
    }
  });

  document.addEventListener("click", (event) => {
    // Use composedPath() rather than root.contains(event.target): a quick-reply
    // click can remove its own button from the DOM synchronously (clearing its
    // container's innerHTML) before this listener runs, which would otherwise
    // make an "inside" click look like it happened outside the widget.
    if (panel && !event.composedPath().includes(root)) {
      // Clicking outside is a soft dismiss — no cooldown penalty, unlike an
      // explicit close, since the visitor didn't say "not now."
      panel.remove();
      panel = null;
      launcher.setAttribute("aria-expanded", "false");
    }
  });

  maybeAutoOpen();

  function maybeAutoOpen() {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const lastDismiss = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - lastDismiss < DISMISS_COOLDOWN_MS) return;

    window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      openPanel({ auto: true });
    }, AUTO_OPEN_DELAY_MS);
  }
}
