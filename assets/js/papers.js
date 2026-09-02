// Pulls recent papers from arXiv's free public API (no key required)
// Docs: https://info.arxiv.org/help/api/index.html

const ARXIV_API = "https://export.arxiv.org/api/query";

const FIELDS = [
  { id: "social", label: "Social Research", query: "cat:cs.CY+OR+cat:econ.GN+OR+all:%22social+science%22" },
  { id: "bio", label: "Biology & Life Sciences", query: "cat:q-bio.*" },
  { id: "ai-ml", label: "AI & Machine Learning", query: "cat:cs.AI+OR+cat:cs.LG" },
  { id: "econ", label: "Economics & Finance", query: "cat:econ.*+OR+cat:q-fin.*" },
  { id: "cs", label: "Computer Science", query: "cat:cs.*" },
  { id: "math", label: "Mathematics", query: "cat:math.*" },
  { id: "physics", label: "Physics", query: "cat:physics.*" },
  { id: "others", label: "Others", query: "cat:stat.*+OR+cat:eess.*" }
];

const RESULTS_PER_FIELD = 5;

function buildUrl(query) {
  const params = new URLSearchParams({
    search_query: query,
    sortBy: "submittedDate",
    sortOrder: "descending",
    max_results: String(RESULTS_PER_FIELD)
  });
  // URLSearchParams encodes '+' and ':' in a way arXiv still accepts, but
  // we built query with literal '+OR+' and 'cat:' already, so swap back.
  return `${ARXIV_API}?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${RESULTS_PER_FIELD}`;
}

function parseEntries(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const entries = Array.from(doc.getElementsByTagName("entry"));
  return entries.map((entry) => {
    const title = entry.querySelector("title")?.textContent?.trim().replace(/\s+/g, " ") || "Untitled";
    const summary = entry.querySelector("summary")?.textContent?.trim().replace(/\s+/g, " ") || "";
    const link = Array.from(entry.getElementsByTagName("link")).find(
      (l) => l.getAttribute("rel") === "alternate"
    )?.getAttribute("href") || entry.querySelector("id")?.textContent;
    const published = entry.querySelector("published")?.textContent;
    const authors = Array.from(entry.getElementsByTagName("author")).map(
      (a) => a.querySelector("name")?.textContent
    ).filter(Boolean);
    return { title, summary, link, published, authors };
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function renderField(field, entries) {
  const section = document.getElementById(`field-${field.id}`);
  if (!section) return;
  const list = section.querySelector(".paper-list");

  if (!entries.length) {
    list.innerHTML = `<p class="paper-empty">No results right now — try refreshing later.</p>`;
    return;
  }

  list.innerHTML = entries.map((e) => `
    <li class="paper-entry">
      <a href="${e.link}" target="_blank" rel="noopener noreferrer">
        <div class="paper-top">
          <h3 class="paper-title">${escapeHtml(e.title)}</h3>
          <span class="paper-date">${formatDate(e.published)}</span>
        </div>
        <p class="paper-authors">${escapeHtml(e.authors.slice(0, 3).join(", "))}${e.authors.length > 3 ? " et al." : ""}</p>
        <p class="paper-summary">${escapeHtml(truncate(e.summary, 220))}</p>
      </a>
    </li>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadField(field) {
  const section = document.getElementById(`field-${field.id}`);
  const list = section?.querySelector(".paper-list");
  if (list) list.innerHTML = `<p class="paper-empty">Loading…</p>`;

  try {
    const res = await fetch(buildUrl(field.query));
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const text = await res.text();
    const entries = parseEntries(text);
    renderField(field, entries);
  } catch (err) {
    if (list) {
      list.innerHTML = `<p class="paper-empty">Couldn't load this field right now. <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer">Browse arXiv directly</a>.</p>`;
    }
    console.error(`Failed to load ${field.label}:`, err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  FIELDS.forEach(loadField);
});
