const footerYear = document.getElementById("footer-year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ---------- Announcement banner ----------
const banner = document.getElementById("announcement-banner");
const bannerCloseKey = "bm-banner-dismissed";

if (banner) {
  if (localStorage.getItem(bannerCloseKey) === "1") {
    banner.hidden = true;
  }

  document.getElementById("banner-close")?.addEventListener("click", () => {
    banner.hidden = true;
    localStorage.setItem(bannerCloseKey, "1");
  });
}

// ---------- Sticky header: deep-blur once the page scrolls ----------
const header = document.getElementById("site-header");

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

// ---------- Primary nav dropdowns ----------
const dropdowns = Array.from(document.querySelectorAll("[data-dropdown]"));

function closeAllDropdowns(except) {
  for (const item of dropdowns) {
    if (item === except) continue;
    const trigger = item.querySelector("[data-dropdown-trigger]");
    const panel = item.querySelector("[data-dropdown-panel]");
    trigger?.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
  }
}

for (const item of dropdowns) {
  const trigger = item.querySelector("[data-dropdown-trigger]");
  const panel = item.querySelector("[data-dropdown-panel]");
  if (!trigger || !panel) continue;

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    closeAllDropdowns(item);
    trigger.setAttribute("aria-expanded", String(!isOpen));
    panel.hidden = isOpen;
  });
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || !event.target.closest("[data-dropdown]")) {
    closeAllDropdowns();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllDropdowns();
});

// ---------- Mobile nav toggle ----------
const mobileToggle = document.getElementById("mobile-nav-toggle");
const mainNav = document.querySelector(".main-nav");

mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
  mobileToggle.setAttribute("aria-expanded", String(!isOpen));
  mainNav?.classList.toggle("is-open", !isOpen);
});
