// ---------- Copy-to-clipboard for API snippets ----------
const COPIED_LABEL_DURATION = 2000;

document.querySelectorAll(".code-block__copy").forEach((button) => {
  const target = document.getElementById(button.dataset.copyTarget);
  const label = button.querySelector(".code-block__copy-label");
  if (!target || !label) return;

  const defaultLabel = label.textContent;
  let resetTimer = null;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(target.textContent);
      button.classList.add("is-copied");
      label.textContent = "Copied";
    } catch {
      // Clipboard access can fail (permissions, insecure context, older
      // browsers) — fall back to telling the user to select and copy
      // manually rather than failing silently.
      label.textContent = "Press Ctrl+C to copy";
    }

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.classList.remove("is-copied");
      label.textContent = defaultLabel;
    }, COPIED_LABEL_DURATION);
  });
});
