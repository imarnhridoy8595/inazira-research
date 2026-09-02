// Reads ?q= from the URL and filters the homepage article list client-side.
// Works because Jekyll already rendered every post's title/excerpt into
// data attributes on each <li> at build time — no server or index needed.

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim().toLowerCase();

  const searchInputs = document.querySelectorAll(".topbar-search input");
  searchInputs.forEach((input) => { input.value = params.get("q") || ""; });

  if (!query) return;

  const list = document.getElementById("index-list");
  const noResults = document.getElementById("no-results");
  if (!list) return;

  let visibleCount = 0;

  Array.from(list.children).forEach((li) => {
    const title = (li.dataset.title || "").toLowerCase();
    const excerpt = (li.dataset.excerpt || "").toLowerCase();
    const matches = title.includes(query) || excerpt.includes(query);
    li.style.display = matches ? "" : "none";
    if (matches) visibleCount += 1;
  });

  if (noResults) {
    noResults.style.display = visibleCount === 0 ? "" : "none";
  }
});
