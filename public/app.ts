type Exhibit = {
  id: number;
  title: string;
  category: string;
  era: string;
  location: string;
  description: string;
  image: string;
  featured?: boolean;
};

const grid = document.querySelector<HTMLDivElement>("#exhibitGrid");
const searchInput = document.querySelector<HTMLInputElement>("#searchInput");
const filterList = document.querySelector<HTMLDivElement>("#filterList");
const resultCount = document.querySelector<HTMLSpanElement>("#resultCount");
const emptyState = document.querySelector<HTMLDivElement>("#emptyState");
const clearFiltersButton = document.querySelector<HTMLButtonElement>("#clearFilters");
const dialog = document.querySelector<HTMLDialogElement>("#exhibitDialog");
const menuToggle = document.querySelector<HTMLButtonElement>("#menuToggle");
const mainNav = document.querySelector<HTMLElement>("#mainNav");

let activeCategory = "all";
let searchTerm = "";
let exhibits: Exhibit[] = [];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character: string) => {
    const entities: Record<string, string> = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    };
    return entities[character] || character;
  });
}

async function loadExhibits(): Promise<void> {
  if (!grid) return;
  grid.innerHTML = '<p class="loading-message">Gathering stories from the collection…</p>';

  try {
    const response = await fetch("/api/exhibits");
    if (!response.ok) throw new Error("Could not load exhibits");
    exhibits = (await response.json()) as Exhibit[];
    renderExhibits();
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="loading-message">The collection could not load. Check that the server is running, then refresh.</p>';
    if (resultCount) resultCount.textContent = "Collection unavailable";
  }
}

function getFilteredExhibits(): Exhibit[] {
  return exhibits.filter((exhibit) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !query ||
      exhibit.title.toLowerCase().includes(query) ||
      exhibit.category.toLowerCase().includes(query) ||
      exhibit.era.toLowerCase().includes(query) ||
      exhibit.description.toLowerCase().includes(query);
    const matchesCategory = activeCategory === "all" || exhibit.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
}

function renderExhibits(): void {
  if (!grid || !resultCount || !emptyState) return;
  const filtered = getFilteredExhibits();
  resultCount.textContent = `${String(filtered.length).padStart(2, "0")} ${filtered.length === 1 ? "EXHIBIT" : "EXHIBITS"} TO DISCOVER`;
  grid.innerHTML = "";
  emptyState.hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;

  filtered.forEach((exhibit, index) => {
    const card = document.createElement("article");
    card.className = "exhibit-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Learn more about ${exhibit.title}`);
    card.innerHTML = `
      <div class="card-image-wrap">
        <img class="card-image" src="${escapeHtml(exhibit.image)}" alt="${escapeHtml(exhibit.title)}" loading="lazy">
        <span class="card-number">0${index + 1}</span>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="card-body">
        <span class="card-category">${escapeHtml(exhibit.category)}</span>
        <h3>${escapeHtml(exhibit.title)}</h3>
        <span class="card-era">${escapeHtml(exhibit.era)}</span>
        <p class="card-description">${escapeHtml(exhibit.description)}</p>
      </div>`;
    card.addEventListener("click", () => openExhibit(exhibit));
    card.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExhibit(exhibit);
      }
    });
    grid.appendChild(card);
  });
}

function openExhibit(exhibit: Exhibit): void {
  const image = document.querySelector<HTMLImageElement>("#dialogImage");
  const category = document.querySelector<HTMLParagraphElement>("#dialogCategory");
  const title = document.querySelector<HTMLHeadingElement>("#dialogTitle");
  const era = document.querySelector<HTMLParagraphElement>("#dialogEra");
  const description = document.querySelector<HTMLParagraphElement>("#dialogDescription");
  const location = document.querySelector<HTMLParagraphElement>("#dialogLocation");
  if (!dialog || !image || !category || !title || !era || !description || !location) return;

  image.src = exhibit.image;
  image.alt = exhibit.title;
  category.textContent = exhibit.category;
  title.textContent = exhibit.title;
  era.textContent = exhibit.era;
  description.textContent = exhibit.description;
  location.textContent = exhibit.location;
  dialog.showModal();
}

searchInput?.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderExhibits();
});

filterList?.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category || "all";
  filterList.querySelectorAll<HTMLButtonElement>(".filter-chip").forEach((chip) => {
    const selected = chip === button;
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderExhibits();
});

clearFiltersButton?.addEventListener("click", () => {
  searchTerm = "";
  activeCategory = "all";
  if (searchInput) searchInput.value = "";
  filterList?.querySelectorAll<HTMLButtonElement>(".filter-chip").forEach((chip) => {
    const selected = chip.dataset.category === "all";
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderExhibits();
});

document.querySelector<HTMLButtonElement>("#dialogClose")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event: MouseEvent) => {
  if (event.target === dialog) dialog.close();
});
menuToggle?.addEventListener("click", () => {
  const open = mainNav?.classList.toggle("open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav?.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});
const year = document.querySelector<HTMLSpanElement>("#year");
if (year) year.textContent = String(new Date().getFullYear());

void loadExhibits();
