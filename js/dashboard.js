// ---------- Sidebar date ----------
const todayEl = document.getElementById("sidebar-today");
if (todayEl) {
  todayEl.textContent = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
