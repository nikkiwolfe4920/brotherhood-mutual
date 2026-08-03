// ---------- Mobile sidebar toggle ----------
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("app-sidebar");
const sidebarScrim = document.getElementById("sidebar-scrim");

function closeSidebar() {
  sidebarToggle?.setAttribute("aria-expanded", "false");
  sidebar?.classList.remove("is-open");
  if (sidebarScrim) sidebarScrim.hidden = true;
}

function openSidebar() {
  sidebarToggle?.setAttribute("aria-expanded", "true");
  sidebar?.classList.add("is-open");
  if (sidebarScrim) sidebarScrim.hidden = false;
}

sidebarToggle?.addEventListener("click", () => {
  const isOpen = sidebarToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) closeSidebar();
  else openSidebar();
});

sidebarScrim?.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSidebar();
});

// ---------- ⌘K / Ctrl+K focuses search ----------
const searchInput = document.getElementById("dashboard-search");

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput?.focus();
  }
});

// ---------- Ask Shep a question (AI Chat Summary card) ----------
const askShepForm = document.getElementById("ask-shep-form");
const askShepInput = document.getElementById("ask-shep-input");
const askShepResponse = document.getElementById("ask-shep-response");
const feedList = document.getElementById("feed-list");
const feedMeta = document.querySelector(".feed__meta");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function addShepFeedItem(question) {
  if (!feedList) return;

  const item = document.createElement("li");
  item.className = "feed__item";
  item.innerHTML = `
    <span class="feed__icon feed__icon--shep">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="14" height="14"><circle cx="12" cy="12" r="9" /><path d="m14.5 9.5-2 5-5 2 2-5z" /></svg>
    </span>
    <div style="flex: 1; min-width: 0;">
      <div class="feed__row">
        <p class="feed__row-title">Asked Shep: <strong>“${escapeHtml(question)}”</strong></p>
        <span class="feed__timestamp">Just now</span>
      </div>
      <p class="feed__desc">Shep is looking into this and will follow up here.</p>
    </div>
  `;
  feedList.prepend(item);

  if (feedMeta) feedMeta.textContent = "Updated just now";
}

askShepForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = askShepInput.value.trim();
  if (!question) return;

  askShepResponse.hidden = false;
  askShepResponse.textContent = `Got it — Shep is looking into “${question}” and will follow up in the Living Profile Feed.`;
  addShepFeedItem(question);
  askShepForm.reset();
  askShepInput.focus();
});
