/* ==========================================================
   MUNTAHA RAHMAN — site script
   Hash routing, JSON-driven rendering, modal with shop variants.
   No random tilt/float; structured reveal animation only.
   ========================================================== */

const state = {
  site: null,
  artworks: [],
  journal: [],
  activeRoute: "home",
  activeFilter: "all",
  workGridRendered: false,
  activeArtworkId: null,
  activeImageIndex: 0,
};

const ROUTES = new Set(["home", "work", "diary", "contact"]);

const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

const escapeHtml = (v = "") =>
  String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const money = (v) => {
  if (v === null || v === undefined || v === "") return "Inquire";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
};

async function loadJson(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`Could not load ${path}`);
  return r.json();
}

const studioEmail = () => state.site?.contact?.email || "muntaharaiba@gmail.com";

const mailtoUrl = ({ subject, body }) =>
  `mailto:${encodeURIComponent(studioEmail())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function artworkUrl(id) {
  const url = new URL(window.location.href);
  url.hash = `#/work/${encodeURIComponent(id)}`;
  return url.toString();
}

/* ---------- Routing ---------- */
function getHashParts() {
  const hash = window.location.hash.replace(/^#\/?/, "").trim();
  return hash ? hash.split("/").filter(Boolean) : [];
}

function getRouteFromHash() {
  const parts = getHashParts();
  const hash = parts[0] || "";
  if (!hash || hash === "top" || hash === "about") return "home";
  // Legacy: "shop" route folds into "work"
  if (hash === "shop") return "work";
  return ROUTES.has(hash) ? hash : "home";
}

function getArtworkIdFromHash() {
  const parts = getHashParts();
  return parts[0] === "work" && parts[1] ? decodeURIComponent(parts[1]) : null;
}

function showRoute(route = getRouteFromHash()) {
  state.activeRoute = route;
  document.body.dataset.route = route;
  $$("[data-view]").forEach((v) => { v.hidden = v.dataset.view !== route; });
  if (route === "work" && !state.workGridRendered && state.artworks.length) {
    renderWorkGrid();
    state.workGridRendered = true;
  }
  $$("[data-route-link]").forEach((link) =>
    link.classList.toggle("is-active", link.dataset.routeLink === route)
  );
  // Close mobile nav on route change
  $(".site-nav")?.classList.remove("is-open");
  $(".nav-toggle")?.setAttribute("aria-expanded", "false");
  // Close modal on route change
  const dialog = $("#art-dialog");
  if (dialog && dialog.open) {
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  requestAnimationFrame(applyReveal);
  const linkedArtworkId = getArtworkIdFromHash();
  if (route === "work" && linkedArtworkId) {
    requestAnimationFrame(() => openArtwork(linkedArtworkId, { updateHash: false }));
  }
}

function setupNav() {
  const toggle = $(".nav-toggle");
  const nav = $(".site-nav");
  const closeNav = () => {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  // Close menu when a link inside is clicked
  $$(".site-nav a").forEach((a) => a.addEventListener("click", closeNav));
  // Close on outside tap
  document.addEventListener("click", (e) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(e.target) || toggle?.contains(e.target)) return;
    closeNav();
  });
  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("is-open")) closeNav();
  });
  window.addEventListener("hashchange", () => showRoute());
  showRoute();
}

/* ---------- Site content (header, about, hero) ---------- */
function applySiteContent() {
  const { site, landing, about, contact, analytics } = state.site;

  document.title = site.title;
  $("meta[name='description']")?.setAttribute("content", site.description);
  $("meta[property='og:title']")?.setAttribute("content", site.title);
  $("meta[property='og:description']")?.setAttribute("content", site.description);
  $("link[rel='canonical']")?.setAttribute("href", site.url);
  $("#year").textContent = String(new Date().getFullYear());

  // About copy
  const aboutEl = $("[data-about-copy]");
  if (aboutEl) {
    const paragraphs = (about.paragraphs || []).map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    aboutEl.outerHTML = paragraphs;
  }
  // Facts as definition list
  const factsEl = $("[data-about-facts]");
  if (factsEl) {
    factsEl.innerHTML = (about.facts || [])
      .map((f) => `<div class="about-fact"><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd></div>`)
      .join("");
  }

  // Instagram
  const igLink = $("[data-ig-link]");
  if (igLink && landing.instagramUrl) igLink.href = landing.instagramUrl;
  const igLabel = $("[data-ig-label]");
  if (igLabel && landing.instagramLabel) igLabel.textContent = landing.instagramLabel;

  // Contact
  const noteEl = $("[data-contact-note]");
  if (noteEl) {
    if (contact.note) {
      noteEl.textContent = contact.note;
      noteEl.hidden = false;
    } else {
      noteEl.hidden = true;
    }
  }
  const emailEl = $("[data-contact-email]");
  if (emailEl) {
    emailEl.href = `mailto:${contact.email}`;
    emailEl.textContent = contact.email;
  }

  // Hero — featured artwork on landing
  applyHero();

  // SEO JSON-LD
  $("#structured-data").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.artistName,
    url: site.url,
    jobTitle: "Artist",
    address: { "@type": "PostalAddress", addressLocality: "New York", addressRegion: "NY", addressCountry: "US" },
    sameAs: (state.site.social || []).filter(Boolean),
  }, null, 2);

  // Optional analytics
  if (analytics?.googleMeasurementId && !analytics.googleMeasurementId.includes("XXXX")) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics.googleMeasurementId)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", analytics.googleMeasurementId);
  }
}

function applyHero() {
  const featuredId = state.site?.landing?.featuredArtworkId;
  const art =
    state.artworks.find((a) => a.id === featuredId) ||
    state.artworks.find((a) => a.featured) ||
    state.artworks[0];
  if (!art) return;
  const img = $("[data-hero-img]");
  if (img) {
    img.style.aspectRatio = art.aspectRatio || "auto";
    img.src = art.image;
    img.alt = art.alt || art.title;
  }
  const title = $("[data-hero-title]");
  if (title) title.textContent = art.title;
  const meta = $("[data-hero-meta]");
  if (meta) meta.textContent = `${art.year} · ${art.medium} · ${art.dimensions}`;
  const cta = $("[data-hero-cta]");
  if (cta) {
    // Always open the artwork modal — predictable UX. Keep href as fallback.
    cta.href = "#/work";
    cta.dataset.heroArtId = art.id;
    cta.textContent = "View artwork →";
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      openArtwork(art.id);
    });
  }
}

/* ---------- Work catalog ---------- */
function visibleArtworks() {
  if (state.activeFilter === "all") return state.artworks;
  return state.artworks.filter((a) => (a.tags || []).includes(state.activeFilter));
}

function classifyCard(art) {
  // Decide grid span based on featured + aspect
  if (art.featured) return "is-featured";
  if (art.tags?.includes("paper") || art.tags?.includes("series")) return "";
  return "";
}

function buildArtworkCard(art) {
  const ratio = art.aspectRatio || "4 / 5";
  const cls = classifyCard(art);
  const src = art.imageMd || art.image;
  return `
    <button type="button" class="catalog-card ${cls}" data-art-id="${escapeHtml(art.id)}" aria-label="Open ${escapeHtml(art.title)} details">
      <div class="catalog-image-wrap" style="aspect-ratio: ${ratio};">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(art.alt || art.title)}" loading="eager" decoding="async" />
        <div class="catalog-overlay"><span class="catalog-overlay-text">View →</span></div>
      </div>
      <div class="catalog-meta">
        <span class="catalog-meta-title">${escapeHtml(art.title)}</span>
        <span class="catalog-meta-year">${escapeHtml(art.year)}</span>
        <span class="catalog-meta-sub">${escapeHtml(art.medium)} · ${escapeHtml(art.dimensions)}</span>
        <span class="catalog-tag is-prints">Prints — coming soon</span>
      </div>
    </button>
  `;
}

function renderWorkFilters() {
  const tagSet = new Set(["all"]);
  state.artworks.forEach((a) => (a.tags || []).forEach((t) => tagSet.add(t)));
  // Stable sort: 'all' first, then alpha
  const tags = ["all", ...Array.from(tagSet).filter((t) => t !== "all").sort()];
  const wrap = $("#work-filters");
  if (!wrap) return;
  wrap.innerHTML = tags
    .map((t) => `<button class="filter-btn" type="button" data-filter="${escapeHtml(t)}" aria-pressed="${t === state.activeFilter}">${escapeHtml(t)}</button>`)
    .join("");
  $$(".filter-btn", wrap).forEach((btn) =>
    btn.addEventListener("click", () => {
      state.activeFilter = btn.dataset.filter;
      renderWorkFilters();
      renderWorkGrid();
    })
  );
}

function renderWorkGrid() {
  const grid = $("#work-grid");
  if (!grid) return;
  grid.innerHTML = visibleArtworks().map(buildArtworkCard).join("");
  $$("[data-art-id]", grid).forEach((b) => b.addEventListener("click", () => openArtwork(b.dataset.artId)));
  applyReveal();
}

/* ---------- Studio Diary (paused — coming-soon view rendered statically) ---------- */

/* ---------- Modal: artwork details (inquiry only — print sales paused) ---------- */
function buildShopBlock(art) {
  const inquireOriginalHref = mailtoUrl({
    subject: `Original artwork inquiry: ${art.title}`,
    body: `Hi Muntaha,\n\nI'm interested in the original work:\n• ${art.title} (${art.year})\n• ${art.medium} — ${art.dimensions}\n\nPlease send details.\n\nThanks,`,
  });
  const inquirePrintHref = mailtoUrl({
    subject: `Print inquiry: ${art.title}`,
    body: `Hi Muntaha,\n\nI'd like to be in touch about a print of:\n• ${art.title} (${art.year})\n\nPlease let me know when prints become available, and any sizing/pricing details you can share now.\n\nThanks,`,
  });

  const originalRow =
    art.original?.saleMode === "inquiry-only"
      ? `<div class="shop-row">
           <div>
             <div class="shop-row-label">Original artwork</div>
             <div class="shop-row-sub"><em>By inquiry</em></div>
           </div>
           <a class="btn btn-accent btn-sm" href="${escapeHtml(inquireOriginalHref)}">Inquire</a>
         </div>`
      : "";

  const printsRow = (art.products || []).length
    ? `<div class="shop-row">
         <div>
           <div class="shop-row-label">Prints</div>
           <div class="shop-row-sub"><em>Coming soon</em></div>
         </div>
         <a class="btn btn-ghost btn-sm" href="${escapeHtml(inquirePrintHref)}">Inquire</a>
       </div>`
    : "";

  if (!originalRow && !printsRow) return "";

  return `
    <section class="dialog-shop" aria-labelledby="dialog-shop-heading">
      <h3 id="dialog-shop-heading">Acquire</h3>
      ${originalRow}
      ${printsRow}
    </section>
  `;
}

function renderDialogStage(art) {
  const images = art.images?.length ? art.images : [{ src: art.image, alt: art.alt, caption: art.title }];
  const active = images[state.activeImageIndex] || images[0];
  const stage = $("[data-dialog-stage]");
  const thumbs = $("[data-dialog-thumbs]");
  if (!stage || !thumbs) return;
  stage.innerHTML = `<img src="${escapeHtml(active.src)}" alt="${escapeHtml(active.alt || art.alt || art.title)}" />`;
  if (images.length <= 1) {
    thumbs.style.display = "none";
  } else {
    thumbs.style.display = "";
    thumbs.innerHTML = images
      .map(
        (img, i) =>
          `<button type="button" data-thumb="${i}" aria-pressed="${i === state.activeImageIndex}" aria-label="Show image ${i + 1}">
             <img src="${escapeHtml(img.src)}" alt="" />
           </button>`
      )
      .join("");
    $$("[data-thumb]", thumbs).forEach((b) =>
      b.addEventListener("click", () => {
        state.activeImageIndex = Number(b.dataset.thumb);
        renderDialogStage(art);
      })
    );
  }
}

function openArtwork(id, options = {}) {
  const { updateHash = true } = options;
  const art = state.artworks.find((a) => a.id === id);
  if (!art) return;
  state.activeArtworkId = id;
  state.activeImageIndex = 0;
  if (updateHash) {
    history.pushState(null, "", artworkUrl(id));
  }

  $("#dialog-content").innerHTML = `
    <div class="dialog-layout">
      <div class="dialog-gallery">
        <div class="dialog-stage" data-dialog-stage></div>
        <div class="dialog-thumbs" data-dialog-thumbs></div>
      </div>
      <div class="dialog-copy">
        <p class="eyebrow">${escapeHtml(art.collection || "Artwork")}</p>
        <div class="dialog-title-row">
          <h2 id="dialog-title">${escapeHtml(art.title)}</h2>
          <div class="dialog-share-wrap">
            <button class="dialog-share-btn" type="button" data-share-art="${escapeHtml(art.id)}" aria-label="Share ${escapeHtml(art.title)}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.5 12.5 16.5 7.5M7.5 11.5l9 5M18 8.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM6 14.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM18 20.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"/>
              </svg>
              <span>Share</span>
            </button>
            <span class="share-note" data-share-note role="status" aria-live="polite"></span>
          </div>
        </div>
        <dl class="dialog-meta">
          <div class="dialog-meta-row"><dt>Year</dt><dd>${escapeHtml(art.year)}</dd></div>
          <div class="dialog-meta-row"><dt>Medium</dt><dd>${escapeHtml(art.medium)}</dd></div>
          <div class="dialog-meta-row"><dt>Dimensions</dt><dd>${escapeHtml(art.dimensions)}</dd></div>
        </dl>
        <div class="dialog-thesis">
          <h3>Thesis</h3>
          <p>${escapeHtml(art.thesis || art.description || "Statement coming soon.")}</p>
        </div>
        ${buildShopBlock(art)}
      </div>
    </div>
  `;
  renderDialogStage(art);
  const dialog = $("#art-dialog");
  $("[data-share-art]")?.addEventListener("click", () => shareArtwork(art));
  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

let shareNoteTimer = null;
function setShareNote(message) {
  const note = $("[data-share-note]");
  if (!note) return;
  note.textContent = message;
  if (shareNoteTimer) clearTimeout(shareNoteTimer);
  shareNoteTimer = setTimeout(() => {
    note.textContent = "";
  }, 1800);
}

async function copyArtworkLink(id) {
  try {
    await copyText(artworkUrl(id));
    setShareNote("Link copied");
  } catch {
    setShareNote("Copy failed");
  }
}

async function shareArtwork(art) {
  const url = artworkUrl(art.id);
  const data = {
    title: `${art.title} — Muntaha Rahman`,
    text: `${art.title} by Muntaha Rahman`,
    url,
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await copyText(url);
      setShareNote("Link copied");
    }
  } catch (err) {
    if (err?.name !== "AbortError") setShareNote("Share canceled");
  }
}

function setupDialog() {
  const dialog = $("#art-dialog");
  const closeDialog = () => {
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
    if (getArtworkIdFromHash()) history.pushState(null, "", "#/work");
  };
  $(".dialog-close")?.addEventListener("click", closeDialog);
  // Click backdrop to close
  dialog?.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog();
    }
  });
}

/* ---------- Contact form ---------- */
function setupContactForm() {
  const form = $("#contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = `${data.get("type")} — muntaha.art inquiry`;
    const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nInquiry type: ${data.get("type")}\n\n${data.get("message")}`;
    window.location.href = mailtoUrl({ subject, body });
    $("#form-note").textContent = "Opening your email app. If nothing opens, please copy this and send it manually.";
  });
}

/* ---------- Reveal: structured fade + 8px rise (NO rotation, NO float) ---------- */
function applyReveal() {
  const items = $$(".catalog-card, .browse-card, .diary-entry, .about-band > *, .hero-figure");
  if (!("IntersectionObserver" in window)) {
    items.forEach((it) => it.classList.add("reveal", "is-in"));
    return;
  }
  if (!window.__revealObserver) {
    window.__revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          window.__revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }
  items.forEach((it, i) => {
    if (it.classList.contains("is-in")) return;
    it.classList.add("reveal");
    it.style.setProperty("--reveal-delay", `${(i % 8) * 50}ms`);
    window.__revealObserver.observe(it);
  });
}

/* ---------- Boot ---------- */
async function init() {
  setupNav();
  setupDialog();
  setupContactForm();
  try {
    const [s, a, j] = await Promise.all([
      loadJson("content/site.json"),
      loadJson("content/artworks.json"),
      loadJson("content/journal.json"),
    ]);
    state.site = s;
    state.artworks = Array.isArray(a) ? a : a.items || [];
    state.journal = Array.isArray(j) ? j : j.items || [];
    applySiteContent();
    showRoute();
  } catch (err) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="error-box"><strong>Content loading issue.</strong><br>${escapeHtml(err.message)}<br>Run the site through a local server (start-preview.ps1) instead of opening index.html directly.</div>`
    );
    console.error(err);
  }
}

init();
