"use strict";
const grid = document.querySelector("#exhibitGrid");
const searchInput = document.querySelector("#searchInput");
const filterList = document.querySelector("#filterList");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const clearFiltersButton = document.querySelector("#clearFilters");
const dialog = document.querySelector("#exhibitDialog");
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
let activeCategory = "all";
let searchTerm = "";
let exhibits = [];
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        };
        return entities[character] || character;
    });
}
async function loadExhibits() {
    if (!grid)
        return;
    grid.innerHTML = '<p class="loading-message">Gathering stories from the collection…</p>';
    try {
        const response = await fetch("/api/exhibits");
        if (!response.ok)
            throw new Error("Could not load exhibits");
        exhibits = (await response.json());
        renderExhibits();
    }
    catch (error) {
        console.error(error);
        grid.innerHTML = '<p class="loading-message">The collection could not load. Check that the server is running, then refresh.</p>';
        if (resultCount)
            resultCount.textContent = "Collection unavailable";
    }
}
function getFilteredExhibits() {
    return exhibits.filter((exhibit) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = !query ||
            exhibit.title.toLowerCase().includes(query) ||
            exhibit.category.toLowerCase().includes(query) ||
            exhibit.era.toLowerCase().includes(query) ||
            exhibit.description.toLowerCase().includes(query);
        const matchesCategory = activeCategory === "all" || exhibit.category === activeCategory;
        return matchesSearch && matchesCategory;
    });
}
function renderExhibits() {
    if (!grid || !resultCount || !emptyState)
        return;
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
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openExhibit(exhibit);
            }
        });
        grid.appendChild(card);
    });
}
function openExhibit(exhibit) {
    const image = document.querySelector("#dialogImage");
    const category = document.querySelector("#dialogCategory");
    const title = document.querySelector("#dialogTitle");
    const era = document.querySelector("#dialogEra");
    const description = document.querySelector("#dialogDescription");
    const location = document.querySelector("#dialogLocation");
    if (!dialog || !image || !category || !title || !era || !description || !location)
        return;
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
filterList?.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest("[data-category]");
    if (!button)
        return;
    activeCategory = button.dataset.category || "all";
    filterList.querySelectorAll(".filter-chip").forEach((chip) => {
        const selected = chip === button;
        chip.classList.toggle("selected", selected);
        chip.setAttribute("aria-pressed", String(selected));
    });
    renderExhibits();
});
clearFiltersButton?.addEventListener("click", () => {
    searchTerm = "";
    activeCategory = "all";
    if (searchInput)
        searchInput.value = "";
    filterList?.querySelectorAll(".filter-chip").forEach((chip) => {
        const selected = chip.dataset.category === "all";
        chip.classList.toggle("selected", selected);
        chip.setAttribute("aria-pressed", String(selected));
    });
    renderExhibits();
});
document.querySelector("#dialogClose")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => {
    if (event.target === dialog)
        dialog.close();
});
menuToggle?.addEventListener("click", () => {
    const open = mainNav?.classList.toggle("open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
    });
});
const year = document.querySelector("#year");
if (year)
    year.textContent = String(new Date().getFullYear());
void loadExhibits();
