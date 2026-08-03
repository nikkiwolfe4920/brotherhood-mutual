import { ICONS } from "../design-system/icons.js";

const TYPING_DELAY_MS = 900;
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SESSION_KEY = "shep-auto-opened";
const DISMISS_KEY = "shep-last-dismiss";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const root = document.getElementById("shep-root");
if (root) {
  initShep(root);
}

function initShep(root) {
  // `data-flow` on #shep-root lets a page opt into a different scripted
  // conversation (see the "payroll" and "mission-trip" branches below)
  // without forking the whole widget — the panel chrome/a11y contract stays
  // identical either way.
  const flow =
    root.dataset.flow === "payroll"
      ? "payroll"
      : root.dataset.flow === "mission-trip"
        ? "mission-trip"
        : "default";

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
  let scrim = null;

  function renderScrim() {
    scrim = document.createElement("div");
    scrim.className = "shep__scrim";
    scrim.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrim);
  }

  function removeScrim() {
    if (!scrim) return;
    scrim.remove();
    scrim = null;
  }

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
          <p class="shep__header-status">${
            flow === "payroll"
              ? "Payroll &amp; HR assistant"
              : flow === "mission-trip"
                ? "Global Missions assistant"
                : "Ministry trip assistant"
          }</p>
        </div>
        <button class="shep__close" type="button" aria-label="Close chat">${ICONS.close}</button>
      </div>
      <div class="shep__messages" role="log" aria-live="polite"></div>
      <div class="shep__topic-select" hidden></div>
      <div class="shep__quick-replies" hidden></div>
      <div class="shep__email-capture" hidden></div>
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
    renderScrim();
    renderPanel();
    launcher.setAttribute("aria-expanded", "true");
    launcher.classList.remove("is-idle-pulse");

    // Each panel is a fresh, empty `.shep__messages` log (the previous one was
    // torn down in closePanel), so this greeting must run every time a panel
    // opens — not just once per session — or a reopened panel silently shows
    // nothing at all.
    showTyping().then(() => {
      if (flow === "payroll") {
        addMessage(
          "shep",
          "Hi! Curious how Payroll would work alongside what you already have with us — or just exploring? Either way, I can help."
        );
        showQuickReplies(
          [
            { label: "See how it works", value: "how-it-works" },
            { label: "Get Pricing", value: "pricing" },
          ],
          onPayrollIntroReply
        );
        return;
      }

      if (flow === "mission-trip") {
        addMessage(
          "shep",
          "Hi, I'm Shep \u{1F44B} Planning a mission trip with your ministry? We'd love to help make sure it's protected — want to learn more about trip protection, fundraising tools, or background checks?"
        );
        showTopicSelect();
        showQuickReplies(
          [
            { label: "Yes, tell me more", value: "yes" },
            { label: "Not right now", value: "no" },
          ],
          onMissionTripIntroReply
        );
        return;
      }

      addMessage(
        "shep",
        "Hi, I'm Shep \u{1F44B} Planning a mission trip with your ministry? We'd love to help make sure it's protected — want to learn more about mission trip insurance?"
      );
      showQuickReplies([
        { label: "Yes, tell me more", value: "yes" },
        { label: "Not right now", value: "no" },
      ]);
    });

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
    removeScrim();
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

  function showQuickReplies(options, onSelect = onQuickReply) {
    if (!panel) return;
    const container = panel.querySelector(".shep__quick-replies");
    container.hidden = false;
    container.innerHTML = "";
    for (const option of options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shep__quick-reply";
      btn.textContent = option.label;
      btn.addEventListener("click", () => onSelect(option, container));
      container.appendChild(btn);
    }
  }

  // ---------- Payroll page flow ----------
  async function onPayrollIntroReply(option, container) {
    container.hidden = true;
    container.innerHTML = "";
    addMessage("user", option.label);

    await showTyping();
    addMessage(
      "shep",
      "By the way — looks like you might already have a Brotherhood account. Mind popping in your email so I can double check?"
    );
    showEmailCapture(onPayrollEmailVerified);
  }

  function showEmailCapture(onVerified) {
    if (!panel) return;
    const container = panel.querySelector(".shep__email-capture");
    container.hidden = false;
    container.innerHTML = `
      <form class="shep__email-form" novalidate>
        <label class="visually-hidden" for="shep-email-input">Email address</label>
        <input
          class="shep__input shep__email-input"
          id="shep-email-input"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          aria-describedby="shep-email-error"
        />
        <button class="shep__send" type="submit" aria-label="Send email">${ICONS.send}</button>
      </form>
      <p class="shep__field-error" id="shep-email-error" role="alert" hidden></p>
    `;

    const form = container.querySelector(".shep__email-form");
    const input = container.querySelector("#shep-email-input");
    const error = container.querySelector("#shep-email-error");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const value = input.value.trim();

      if (!EMAIL_PATTERN.test(value)) {
        error.textContent = "Enter a valid email address, like name@example.com.";
        error.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      error.hidden = true;
      input.removeAttribute("aria-invalid");
      input.disabled = true;
      form.querySelector(".shep__send").disabled = true;

      // A visible confirmation that the address passed validation, distinct
      // from the "Shep is typing" indicator that follows once the form is
      // torn down — otherwise a valid submit and an invalid one look the
      // same for a beat.
      const success = document.createElement("p");
      success.className = "shep__field-success";
      success.innerHTML = `${ICONS.check} Email verified`;
      container.appendChild(success);

      await new Promise((resolve) => window.setTimeout(resolve, TYPING_DELAY_MS));

      container.hidden = true;
      container.innerHTML = "";
      addMessage("user", value);

      await showTyping();
      onVerified();
    });

    window.requestAnimationFrame(() => input.focus());
  }

  function onPayrollEmailVerified() {
    addMessage(
      "shep",
      "Just a heads-up—it looks like your building may need a new roof in the near future. If you're able to replace it before your insurance policy renews in about three months, you may be eligible for some savings on your premium. It could be worth looking into!"
    );
    showQuickReplies(
      [
        { label: "Yes, Interested in Learning More", value: "roof-yes" },
        { label: "Maybe Later", value: "roof-later" },
      ],
      onPayrollRoofReply
    );
  }

  async function onPayrollRoofReply(option, container) {
    container.hidden = true;
    container.innerHTML = "";
    addMessage("user", option.label);

    await showTyping();
    if (option.value === "roof-yes") {
      addMessage(
        "shep",
        "Great — I'll flag this for a specialist so they can follow up with the roof savings details."
      );
    } else {
      addMessage("shep", "No problem — I'll be right here if you change your mind.");
    }

    // Same reasoning as onQuickReply below: the clicked button was just
    // removed from the DOM, so focus needs somewhere to land explicitly.
    panel?.querySelector("#shep-input")?.focus();
  }

  // ---------- Mission-trip page flow ----------
  function showTopicSelect() {
    if (!panel) return;
    const container = panel.querySelector(".shep__topic-select");
    container.hidden = false;
    container.innerHTML = `
      <fieldset class="shep__form-fieldset shep__topic-fieldset">
        <legend>What would you like to learn more about?</legend>
        <label class="shep__checkbox-option">
          <input type="checkbox" name="shep-topic" value="trip-protection" checked />
          Trip protection
        </label>
        <label class="shep__checkbox-option">
          <input type="checkbox" name="shep-topic" value="fundraising-tools" />
          Fundraising tools
        </label>
        <label class="shep__checkbox-option">
          <input type="checkbox" name="shep-topic" value="background-checks" />
          Background checks
        </label>
      </fieldset>
    `;
  }

  function hideTopicSelect() {
    const container = panel?.querySelector(".shep__topic-select");
    if (!container) return;
    container.hidden = true;
    container.innerHTML = "";
  }

  async function onMissionTripIntroReply(option, container) {
    container.hidden = true;
    container.innerHTML = "";
    hideTopicSelect();
    addMessage("user", option.label);

    await showTyping();
    if (option.value === "yes") {
      addMessage("shep", "Help us get to know you — a few quick details for our Global Missions Team.");
      showIntakeForm();
      return;
    }

    addMessage("shep", "No problem — I'll be right here if you change your mind.");
    panel?.querySelector("#shep-input")?.focus();
  }

  // A form is rendered as its own message bubble (rather than the fixed
  // quick-replies/email-capture slots) so it scrolls naturally with the rest
  // of the conversation log instead of fighting the panel's fixed height.
  function addFormMessage(html) {
    if (!panel) return null;
    const messagesEl = panel.querySelector(".shep__messages");
    const wrapper = document.createElement("div");
    wrapper.className = "shep__bubble shep__bubble--shep shep__form-message";
    wrapper.innerHTML = html;
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrapper;
  }

  function showFieldError(input, errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    input.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(input, errorEl) {
    if (errorEl) errorEl.hidden = true;
    input.removeAttribute("aria-invalid");
  }

  function validateRequired(input, errorEl, message) {
    if (!input.value.trim()) {
      showFieldError(input, errorEl, message);
      return false;
    }
    clearFieldError(input, errorEl);
    return true;
  }

  function showIntakeForm() {
    const wrapper = addFormMessage(`
      <form class="shep__intake-form" novalidate>
        <div class="shep__form-field">
          <label for="mt-first-name">First name (required)</label>
          <input class="shep__form-input" id="mt-first-name" type="text" required autocomplete="given-name" aria-describedby="mt-first-name-error" />
          <p class="shep__field-error" id="mt-first-name-error" role="alert" hidden></p>
        </div>
        <div class="shep__form-field">
          <label for="mt-last-name">Last name (required)</label>
          <input class="shep__form-input" id="mt-last-name" type="text" required autocomplete="family-name" aria-describedby="mt-last-name-error" />
          <p class="shep__field-error" id="mt-last-name-error" role="alert" hidden></p>
        </div>
        <div class="shep__form-field">
          <label for="mt-job-title">Job title</label>
          <input class="shep__form-input" id="mt-job-title" type="text" autocomplete="organization-title" />
        </div>
        <div class="shep__form-field">
          <label for="mt-phone">Phone number</label>
          <input class="shep__form-input" id="mt-phone" type="tel" autocomplete="tel" />
        </div>
        <div class="shep__form-field">
          <label for="mt-email">Email address (required)</label>
          <input class="shep__form-input" id="mt-email" type="email" required autocomplete="email" aria-describedby="mt-email-error" />
          <p class="shep__field-error" id="mt-email-error" role="alert" hidden></p>
        </div>
        <div class="shep__form-field">
          <label for="mt-contact-pref">Contact preference</label>
          <select class="shep__form-input" id="mt-contact-pref">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div class="shep__form-field">
          <label for="mt-org-name">Organization name</label>
          <input class="shep__form-input" id="mt-org-name" type="text" autocomplete="organization" />
        </div>
        <div class="shep__form-field">
          <label for="mt-org-address">Organization street address</label>
          <input class="shep__form-input" id="mt-org-address" type="text" autocomplete="street-address" />
        </div>
        <div class="shep__form-field">
          <label for="mt-org-type">Organization type</label>
          <select class="shep__form-input" id="mt-org-type">
            <option value="church">Church</option>
            <option value="missions-org">Missions organization</option>
            <option value="nonprofit">Nonprofit ministry</option>
            <option value="school">Christian school</option>
            <option value="other">Other</option>
          </select>
        </div>

        <fieldset class="shep__form-fieldset">
          <legend>I am interested in</legend>
          <label class="shep__checkbox-option"><input type="checkbox" name="interest" value="insurance" /> Insurance for My Ministry</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="interest" value="payroll" /> Payroll</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="interest" value="hr-solutions" /> HR Solutions</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="interest" value="employee-benefits" /> Employee Benefits</label>
        </fieldset>

        <fieldset class="shep__form-fieldset">
          <legend>Mission coverage options</legend>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="travel-insurance" /> Mission Travel Insurance</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="liability-coverage" /> Mission Liability Coverage</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="medical-evacuation" /> Medical/Evacuation Coverage</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="trip-cancellation" /> Trip Cancellation/Interruption Coverage</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="kidnap-ransom" /> Kidnap &amp; Ransom Coverage</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="coverage" value="foreign-property-liability" /> Foreign Property/Liability Coverage</label>
          <label class="shep__form-field">
            <span>Other</span>
            <input class="shep__form-input" id="mt-coverage-other" type="text" placeholder="Tell us what else you need" />
          </label>
        </fieldset>

        <fieldset class="shep__form-fieldset">
          <legend>Background screening options</legend>
          <label class="shep__checkbox-option"><input type="checkbox" name="screening" value="background-checks" /> Background Checks</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="screening" value="arrest-alerts" /> Arrest Alerts</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="screening" value="reference-checks" /> Reference Checks</label>
          <label class="shep__checkbox-option"><input type="checkbox" name="screening" value="abuse-prevention-training" /> Online Sexual Abuse Prevention Training</label>
        </fieldset>

        <label class="shep__checkbox-option shep__consent">
          <input type="checkbox" id="mt-consent" required aria-describedby="mt-consent-error" />
          <span>By submitting your request to our Global Missions Team, I agree that I have read and agree to the <a href="#" target="_blank" rel="noopener">privacy statement</a>.</span>
        </label>
        <p class="shep__field-error" id="mt-consent-error" role="alert" hidden></p>

        <div class="shep__form-actions">
          <button class="btn btn--primary shep__intake-submit" type="submit">Continue</button>
        </div>
      </form>
    `);

    wrapper?.querySelector(".shep__intake-form")?.addEventListener("submit", onIntakeFormSubmit);
  }

  async function onIntakeFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const firstNameInput = form.querySelector("#mt-first-name");
    const lastNameInput = form.querySelector("#mt-last-name");
    const emailInput = form.querySelector("#mt-email");
    const consentInput = form.querySelector("#mt-consent");

    let isValid = true;
    isValid =
      validateRequired(firstNameInput, form.querySelector("#mt-first-name-error"), "Enter your first name.") &&
      isValid;
    isValid =
      validateRequired(lastNameInput, form.querySelector("#mt-last-name-error"), "Enter your last name.") && isValid;

    const emailError = form.querySelector("#mt-email-error");
    if (!EMAIL_PATTERN.test(emailInput.value.trim())) {
      showFieldError(emailInput, emailError, "Enter a valid email address, like name@example.com.");
      isValid = false;
    } else {
      clearFieldError(emailInput, emailError);
    }

    const consentError = form.querySelector("#mt-consent-error");
    if (!consentInput.checked) {
      showFieldError(consentInput, consentError, "You must agree to the privacy statement to continue.");
      isValid = false;
    } else {
      clearFieldError(consentInput, consentError);
    }

    if (!isValid) return;

    form.querySelector(".shep__intake-submit").disabled = true;

    // A visible confirmation that the email cleared validation, distinct from
    // the "Shep is typing" indicator that follows once the form is torn down
    // — same pattern as the payroll flow's inline email capture.
    const success = document.createElement("p");
    success.className = "shep__field-success";
    success.innerHTML = `${ICONS.check} Email verified`;
    emailInput.closest(".shep__form-field")?.appendChild(success);

    await new Promise((resolve) => window.setTimeout(resolve, TYPING_DELAY_MS));

    form.closest(".shep__form-message")?.remove();
    addMessage("user", "Submitted my mission trip request details.");

    await showTyping();
    onMissionTripFormSubmitted();
  }

  function onMissionTripFormSubmitted() {
    addMessage(
      "shep",
      "Just a heads-up—it looks like your building may need a new roof in the near future. If you're able to replace it before your insurance policy renews in about three months, you may be eligible for some savings on your premium. It could be worth looking into!"
    );
    showQuickReplies(
      [
        { label: "Yes, Interested in Learning More", value: "roof-yes" },
        { label: "Maybe Later", value: "roof-later" },
      ],
      onMissionTripRoofReply
    );
  }

  async function onMissionTripRoofReply(option, container) {
    container.hidden = true;
    container.innerHTML = "";
    addMessage("user", option.label);

    await showTyping();
    if (option.value === "roof-yes") {
      addMessage(
        "shep",
        "Great — I'll flag this for a specialist so they can follow up with the roof savings details."
      );
    } else {
      addMessage("shep", "No problem — I'll be right here if you change your mind.");
    }

    showFinalSubmit();
  }

  function showFinalSubmit() {
    const wrapper = addFormMessage(`
      <p class="shep__submit-prompt">Ready to send this to our Global Missions Team?</p>
      <button class="btn btn--primary shep__final-submit" type="button">Submit</button>
    `);
    wrapper?.querySelector(".shep__final-submit")?.addEventListener("click", () => onFinalSubmit(wrapper));
  }

  async function onFinalSubmit(wrapper) {
    wrapper.remove();
    addMessage("user", "Submit");

    await showTyping();
    addMessage("shep", "Thank you for your request — our Global Missions Team will be reaching out to you shortly.");
    panel?.querySelector("#shep-input")?.focus();
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
    if (flow === "payroll") {
      addMessage(
        "shep",
        "Thanks for asking! For specifics like that, our payroll team can give you a real answer — get pricing and a specialist will follow up, or keep chatting with me about the basics."
      );
      showQuickReplies([{ label: "Get Pricing", value: "quote" }], onQuickReply);
      return;
    }

    if (flow === "mission-trip") {
      addMessage(
        "shep",
        "Thanks for asking! For specifics like that, our Global Missions Team can give you a real answer — let's get your details started so a specialist can follow up."
      );
      showQuickReplies([{ label: "Get started", value: "yes" }], onMissionTripIntroReply);
      return;
    }

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
      removeScrim();
      launcher.setAttribute("aria-expanded", "false");
    }
  });

  maybeAutoOpen();

  function maybeAutoOpen() {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const lastDismiss = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - lastDismiss < DISMISS_COOLDOWN_MS) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    openPanel({ auto: true });
  }
}
