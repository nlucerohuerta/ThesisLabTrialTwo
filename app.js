const storageKey = "storyStacksEntries";
const entryForm = document.getElementById("entryForm");
const entriesList = document.getElementById("entriesList");
const filterCategory = document.getElementById("filterCategory");
const filterYear = document.getElementById("filterYear");
const filterSearch = document.getElementById("filterSearch");
const ratingInput = entryForm.elements.rating;
const ratingOutput = entryForm.querySelector("output");

const stats = {
  total: document.getElementById("statTotal"),
  screen: document.getElementById("statScreen"),
  books: document.getElementById("statBooks"),
};

let entries = loadEntries();
render();

entryForm.addEventListener("input", (event) => {
  if (event.target === ratingInput) {
    ratingOutput.textContent = Number(event.target.value).toFixed(1);
  }
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(entryForm);
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    category: formData.get("category"),
    title: formData.get("title").trim(),
    creator: formData.get("creator").trim(),
    dateFinished: formData.get("dateFinished"),
    rating: Number(formData.get("rating") || 0),
    format: formData.get("format"),
    thoughts: formData.get("thoughts").trim(),
    highlights: formData.get("highlights").trim(),
    pinned: false,
    createdAt: new Date().toISOString(),
  };

  if (!entry.title) {
    entryForm.elements.title.focus();
    return;
  }

  entries = [entry, ...entries];
  persist();
  render();
  entryForm.reset();
  ratingOutput.textContent = "4.0";
});

filterCategory.addEventListener("change", render);
filterYear.addEventListener("change", render);
filterSearch.addEventListener("input", () => {
  window.requestAnimationFrame(render);
});

function loadEntries() {
  try {
    const cached = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function render() {
  const fragment = document.createDocumentFragment();
  const years = new Set();

  const filters = {
    category: filterCategory.value,
    year: filterYear.value,
    search: filterSearch.value.toLowerCase().trim(),
  };

  const filtered = entries.filter((entry) => {
    const finishedYear = entry.dateFinished?.slice(0, 4) ?? "Unknown";
    years.add(finishedYear);

    if (filters.category !== "all" && entry.category !== filters.category) {
      return false;
    }

    if (filters.year !== "all" && finishedYear !== filters.year) {
      return false;
    }

    if (filters.search) {
      const haystack = [
        entry.title,
        entry.creator,
        entry.thoughts,
        entry.highlights,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(filters.search)) {
        return false;
      }
    }
    return true;
  });

  const template = document.getElementById("entryTemplate");
  filtered
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
    .forEach((entry) => {
      const node = template.content.cloneNode(true);
      const card = node.querySelector(".entry-card");
      if (entry.pinned) card.classList.add("pinned");

      node.querySelector(".entry-category").textContent = formatCategory(entry.category);
      node.querySelector(".entry-title").textContent = entry.title;
      node.querySelector(".entry-rating").textContent = entry.rating ? `${entry.rating} ★` : "—";
      node.querySelector(".entry-date").textContent =
        entry.dateFinished ? formatDate(entry.dateFinished) : "Date unknown";

      const details = node.querySelector(".entry-details");
      if (entry.creator) {
        appendDetail(details, "Creator", entry.creator);
      }
      appendDetail(details, "Format", entry.format || "—");

      const thoughts = node.querySelector(".entry-thoughts");
      thoughts.textContent = entry.thoughts || "No notes yet — add them when inspiration hits.";

      const highlights = node.querySelector(".entry-highlights");
      highlights.textContent = entry.highlights || "";
      highlights.style.display = entry.highlights ? "block" : "none";

      const pinBtn = node.querySelector(".pin-toggle");
      pinBtn.textContent = entry.pinned ? "Unpin" : "Pin";
      pinBtn.addEventListener("click", () => {
        entry.pinned = !entry.pinned;
        persist();
        render();
      });

      const deleteBtn = node.querySelector(".delete-entry");
      deleteBtn.addEventListener("click", () => {
        if (!confirm(`Delete "${entry.title}"?`)) return;
        entries = entries.filter((item) => item.id !== entry.id);
        persist();
        render();
      });

      fragment.appendChild(node);
    });

  entriesList.replaceChildren(fragment);
  updateYearOptions(years);
  updateStats();

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No entries match those filters yet.";
    entriesList.appendChild(empty);
  }
}

function updateYearOptions(yearsSet) {
  const sorted = [...yearsSet].filter(Boolean).sort().reverse();
  const currentValue = filterYear.value;
  filterYear.innerHTML = `<option value="all">Any year</option>`;
  sorted.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    filterYear.appendChild(option);
  });
  if (sorted.includes(currentValue)) {
    filterYear.value = currentValue;
  }
}

function updateStats() {
  stats.total.textContent = entries.length;
  stats.screen.textContent = entries.filter((entry) => entry.category !== "book").length;
  stats.books.textContent = entries.filter((entry) => entry.category === "book").length;
}

function appendDetail(container, title, value) {
  const dt = document.createElement("dt");
  dt.textContent = title;
  const dd = document.createElement("dd");
  dd.textContent = value;
  container.append(dt, dd);
}

function formatCategory(category) {
  return {
    movie: "Movie",
    tv: "TV Show",
    book: "Book",
  }[category] ?? "Entry";
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unknown";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

