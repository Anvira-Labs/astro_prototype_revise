// Zodiac Bee — Astrologer picks: a static curated catalog (real product
// copy and outbound retailer links), with client-side filter/view controls.
import { icon, showToast } from "../utils.js";
import { initScrollReveal } from "../effects/bloom.js";

const PRODUCTS = [
  {
    category: "Crystals",
    tone: "tone-a",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M9 3l3 6 3-6"/></svg>',
    title: "Rose Quartz Palm Stone",
    desc: "A smooth worry-stone weight recommended for Venus-ruled charts working through matters of the heart.",
    retailer: "Crystal Grove",
    href: "https://www.google.com/search?q=Crystal+Grove+rose+quartz+palm+stone"
  },
  {
    category: "Books",
    tone: "tone-b",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0z"/><path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0z"/></svg>',
    title: "The Inner Sky, Steven Forrest",
    desc: 'The book we hand to anyone asking "okay but what does my chart actually mean" for the first time.',
    retailer: "Bookshop.org",
    href: "https://bookshop.org"
  },
  {
    category: "Rituals",
    tone: "tone-c",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M9 21h6"/><rect x="8.5" y="9" width="7" height="12" rx="1.5"/><path d="M12 9V5"/><path d="M12 5c-1 0-1.6-.8-1.2-1.7C11 2.6 12 2 12 2s1 .6 1.2 1.3C13.6 4.2 13 5 12 5z"/></svg>',
    title: "Saturn Return Candle Kit",
    desc: "A seven-night ritual candle set timed for a Saturn return — steady, unfussy, no incense theatrics.",
    retailer: "Little Ritual Co.",
    href: "https://www.google.com/search?q=Little+Ritual+Co+candle+kit"
  },
  {
    category: "Crystals",
    tone: "tone-d",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M9 3l3 6 3-6"/></svg>',
    title: "Moonstone Pendant, Sterling",
    desc: "A daily-wear stone paired often with cancer placements and anyone tracking their lunar cycle.",
    retailer: "Crystal Grove",
    href: "https://www.google.com/search?q=Crystal+Grove+rose+quartz+palm+stone"
  },
  {
    category: "Books",
    tone: "tone-a",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>',
    title: "Astro Almanac 2027 Planner",
    desc: "Week-by-week transits printed alongside a real planner grid — for people who want the sky, not just the app.",
    retailer: "Bookshop.org",
    href: "https://bookshop.org"
  },
  {
    category: "Remedies",
    tone: "tone-b",
    art: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M4 20L16 8"/><path d="M18 3l.6 1.8L20.5 5.4l-1.9.6L18 8l-.6-1.9-1.9-.6 1.9-.6z"/><path d="M13 3l.4 1.2L14.6 4.6l-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z"/></svg>',
    title: "Selenite Cleansing Wand",
    desc: "The low-effort remedy our astrologers suggest most — a monthly reset for the space you read in.",
    retailer: "Crystal Grove",
    href: "https://www.google.com/search?q=Crystal+Grove+rose+quartz+palm+stone"
  }
];

const CATEGORIES = ["all", "Crystals", "Books", "Rituals", "Remedies"];

function cardHtml(p, i) {
  return `
    <article class="product-card" data-category="${p.category}" data-reveal style="transition-delay:${(i % 3) * 70}ms">
      <div class="product-art ${p.tone}">${p.art}</div>
      <div class="product-body">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.desc}</p>
        <a class="product-link" href="${p.href}" target="_blank" rel="noopener" data-retailer="${p.retailer}">View at retailer ${icon.externalLink}</a>
      </div>
    </article>`;
}

export function renderProducts(main) {
  main.innerHTML = `
    <div class="section section-wide">
      <div class="page-head">
        <h1 class="h1">Astrologer picks</h1>
        <p class="lede">Objects and reading our astrologers keep coming back to — curated by our team, not user-submitted.</p>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; justify-content:space-between;">
        <div class="filter-row" id="filterRow">
          ${CATEGORIES.map((c) => `<button class="chip" data-filter="${c}" aria-pressed="${c === "all"}">${c === "all" ? "All" : c}</button>`).join("")}
        </div>
        <div class="view-toggle" id="viewToggle">
          <button aria-pressed="true" data-view="grid">${icon.gridView} Grid</button>
          <button aria-pressed="false" data-view="list">${icon.listView} List</button>
        </div>
      </div>

      <div class="product-grid" id="productGrid">
        ${PRODUCTS.map(cardHtml).join("")}
      </div>

      <p class="fine">No prices shown — checkout isn't part of this build, so these link straight out to the retailer.</p>
    </div>
  `;

  const filterRow = main.querySelector("#filterRow");
  const viewToggle = main.querySelector("#viewToggle");
  const productGrid = main.querySelector("#productGrid");
  const cards = Array.from(productGrid.querySelectorAll(".product-card"));

  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    filterRow.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    const filter = btn.getAttribute("data-filter");
    cards.forEach((card) => {
      card.style.display = filter === "all" || card.getAttribute("data-category") === filter ? "" : "none";
    });
  });

  viewToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    viewToggle.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    productGrid.classList.toggle("is-list", btn.getAttribute("data-view") === "list");
  });

  productGrid.addEventListener("click", (e) => {
    const link = e.target.closest(".product-link");
    if (!link) return;
    showToast("Opening " + link.getAttribute("data-retailer") + " in a new tab…");
  });

  return initScrollReveal(main);
}
