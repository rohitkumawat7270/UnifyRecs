const fallbackCatalog = [
  {
    id: "v1",
    title: "Decoded: The AI Supply Chain",
    domain: "Video",
    creator: "Signal Studio",
    duration: 24,
    freshness: 0.93,
    popularity: 0.84,
    novelty: 0.61,
    topics: ["tech", "business", "innovation"],
    moods: ["focus", "energetic"],
    blurb: "A sharp explainer on the infrastructure and economics behind modern AI systems.",
    url: "https://www.youtube.com/results?search_query=Decoded+The+AI+Supply+Chain",
    source: "Fallback catalog",
  },
  {
    id: "m1",
    title: "Night Shift Atlas",
    domain: "Music",
    creator: "Luma District",
    duration: 42,
    freshness: 0.72,
    popularity: 0.77,
    novelty: 0.68,
    topics: ["music", "tech", "focus"],
    moods: ["chill", "focus"],
    blurb: "Cinematic electronic textures built for deep work and low-noise focus.",
    url: "https://open.spotify.com/search/Night%20Shift%20Atlas",
    source: "Fallback catalog",
  },
  {
    id: "p1",
    title: "Founders After Hours",
    domain: "Podcast",
    creator: "Relay Network",
    duration: 58,
    freshness: 0.81,
    popularity: 0.88,
    novelty: 0.49,
    topics: ["business", "tech"],
    moods: ["focus", "energetic"],
    blurb: "Operators unpack product launches, company pivots, and market timing.",
    url: "https://podcasts.apple.com/us/search?term=Founders%20After%20Hours",
    source: "Fallback catalog",
  },
  {
    id: "mv1",
    title: "Glass Harbor",
    domain: "Movie",
    creator: "North Frame",
    duration: 109,
    freshness: 0.66,
    popularity: 0.74,
    novelty: 0.73,
    topics: ["movies", "design", "culture"],
    moods: ["chill"],
    blurb: "A stylish drama about urban change, memory, and the stories cities tell.",
    url: "https://www.imdb.com/find/?q=Glass%20Harbor&s=tt",
    source: "Fallback catalog",
  },
  {
    id: "n1",
    title: "Markets Rewire Around Clean Compute",
    domain: "News",
    creator: "World Ledger",
    duration: 9,
    freshness: 0.96,
    popularity: 0.8,
    novelty: 0.52,
    topics: ["business", "tech"],
    moods: ["focus"],
    blurb: "Coverage of the race to reduce energy cost across large-scale compute systems.",
    url: "https://news.google.com/search?q=clean%20compute%20markets",
    source: "Fallback catalog",
  },
];

const sourceConfigs = {
  Video: { label: "Dailymotion", loader: fetchVideos },
  Music: { label: "iTunes", loader: fetchMusic },
  Podcast: { label: "Apple Podcasts", loader: fetchPodcasts },
  Movie: { label: "iTunes Movies", loader: fetchMovies },
  News: { label: "Hacker News", loader: fetchNews },
};

const domainPalette = {
  Video: "rgba(216, 97, 60, 0.5)",
  Music: "rgba(31, 111, 120, 0.5)",
  Podcast: "rgba(242, 193, 78, 0.55)",
  Movie: "rgba(108, 91, 164, 0.36)",
  News: "rgba(69, 127, 75, 0.42)",
};

const domainIcons = {
  Video: "▶",
  Music: "♪",
  Podcast: "◉",
  Movie: "▣",
  News: "✦",
};

const artworkPalette = {
  Video: ["#ff9f6e", "#6d2d1e"],
  Music: ["#5ad1cb", "#163c40"],
  Podcast: ["#ffd97a", "#60430f"],
  Movie: ["#9d8cff", "#2b214f"],
  News: ["#80d58a", "#173620"],
};

const interestOptions = ["tech", "business", "sports", "music", "movies", "news", "design"];
const typeOptions = ["All", "Video", "Music", "Podcast", "Movie", "News"];
const moodOptions = ["All", "chill", "focus", "energetic"];

const STORAGE_KEYS = {
  interactions: "unify-recs-interactions",
  clickCounts: "unify-recs-click-counts",
  likedIds: "unify-recs-liked-ids",
  dislikedIds: "unify-recs-disliked-ids",
  savedIds: "unify-recs-saved-ids",
  hiddenIds: "unify-recs-hidden-ids",
  interests: "unify-recs-interests",
  theme: "unify-recs-theme",
};

const INTERACTION_LIMIT = 10;

const state = {
  selectedInterests: new Set(),
  selectedType: "All",
  selectedMood: "All",
  searchQuery: "",
  catalog: [],
  loading: false,
  lastUpdated: null,
  statusMessage: "Loading recommendations...",
  interactions: [],
  clickCounts: {},
  likedIds: new Set(),
  dislikedIds: new Set(),
  savedIds: new Set(),
  hiddenIds: new Set(),
  theme: "dark",
};

const interestFilters = document.querySelector("#interestFilters");
const typeFilters = document.querySelector("#typeFilters");
const moodFilters = document.querySelector("#moodFilters");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");
const heroCta = document.querySelector("#heroCta");
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const cursorAura = document.querySelector("#cursorAura");
const liveStatus = document.querySelector("#liveStatus");
const liveCount = document.querySelector("#liveCount");
const savedCount = document.querySelector("#savedCount");
const feedSummary = document.querySelector("#feedSummary");
const emptyState = document.querySelector("#emptyState");
const trendingGrid = document.querySelector("#trendingGrid");
const basedGrid = document.querySelector("#basedGrid");
const exploreGrid = document.querySelector("#exploreGrid");
const trendingSummary = document.querySelector("#trendingSummary");
const basedSummary = document.querySelector("#basedSummary");
const exploreSummary = document.querySelector("#exploreSummary");

function init() {
  hydrateState();
  applyTheme();
  buildChips(interestFilters, interestOptions, getInterestChipState, handleInterestToggle);
  buildChips(typeFilters, typeOptions, getTypeChipState, handleTypeSelect);
  buildChips(moodFilters, moodOptions, getMoodChipState, handleMoodSelect);

  searchForm.addEventListener("submit", (event) => event.preventDefault());
  searchInput.value = state.searchQuery;
  searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    render();
  });

  refreshBtn.addEventListener("click", () => loadRecommendations(true));
  themeToggle.addEventListener("click", toggleTheme);
  heroCta.addEventListener("click", () => {
    document.querySelector("#feed").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  trendingGrid.addEventListener("click", handleGridClick);
  basedGrid.addEventListener("click", handleGridClick);
  exploreGrid.addEventListener("click", handleGridClick);
  document.addEventListener("click", handleBounceClick, true);
  setupMouseReactiveEffects();
  setupCursorAura();

  loadRecommendations(false);
}

function buildChips(container, values, isActive, onSelect) {
  container.innerHTML = "";
  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${isActive(value) ? "active" : ""}`;
    button.textContent = formatChipLabel(value);
    button.addEventListener("click", () => onSelect(value));
    container.appendChild(button);
  });
}

function getInterestChipState(value) {
  return state.selectedInterests.has(value);
}

function getTypeChipState(value) {
  return state.selectedType === value;
}

function getMoodChipState(value) {
  return state.selectedMood === value;
}

function handleInterestToggle(interest) {
  if (state.selectedInterests.has(interest)) {
    state.selectedInterests.delete(interest);
  } else {
    state.selectedInterests.add(interest);
  }

  persistPreferences();
  buildChips(interestFilters, interestOptions, getInterestChipState, handleInterestToggle);
  render();
}

function handleTypeSelect(type) {
  state.selectedType = type;
  buildChips(typeFilters, typeOptions, getTypeChipState, handleTypeSelect);
  render();
}

function handleMoodSelect(mood) {
  state.selectedMood = mood;
  buildChips(moodFilters, moodOptions, getMoodChipState, handleMoodSelect);
  render();
}

async function loadRecommendations(forceRefresh) {
  state.loading = true;
  state.statusMessage = "Loading live recommendations from connected sources...";
  render();

  const query = buildLiveQuery();
  const tasks = Object.entries(sourceConfigs).map(async ([domain, config]) => {
    const items = await config.loader(query.primary, query.secondary);
    return items.filter(Boolean).map((item) => normalizeItem(item, domain, config.label));
  });

  const settled = await Promise.allSettled(tasks);
  const liveItems = dedupeItems(
    settled
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value)
  );

  if (liveItems.length > 0) {
    state.catalog = liveItems;
    state.statusMessage = `Live recommendations ready. ${liveItems.length} items loaded${forceRefresh ? " after refresh" : ""}.`;
  } else {
    state.catalog = fallbackCatalog.map((item) => normalizeFallback(item));
    state.statusMessage = "Live sources are unavailable right now, so fallback recommendations are showing.";
  }

  state.loading = false;
  state.lastUpdated = new Date();
  render();
}

function render() {
  const visibleCatalog = getVisibleCatalog();
  const sections = rankSections(visibleCatalog);
  const noInterestsSelected = state.selectedInterests.size === 0;

  liveStatus.textContent = state.statusMessage;
  liveCount.textContent = visibleCatalog.length;
  savedCount.textContent = state.savedIds.size;
  feedSummary.textContent = buildFeedSummary(visibleCatalog.length);
  emptyState.hidden = !noInterestsSelected;

  trendingSummary.textContent =
    sections.trending.length > 0
      ? "Most clicked content across the current feed."
      : "Click a few items and trending will start updating.";
  basedSummary.textContent =
    noInterestsSelected
      ? "Select a few interests to unlock stronger personalization."
      : "Personalized from your interests, clicks, likes, and saved items.";
  exploreSummary.textContent = "Fresh and more surprising picks outside your strongest patterns.";

  if (state.loading) {
    renderLoadingState();
    return;
  }

  renderSection(
    trendingGrid,
    sections.trending,
    "trending",
    "Nothing is trending yet. Start clicking recommendations."
  );
  renderSection(
    basedGrid,
    noInterestsSelected ? [] : sections.based,
    "based",
    "Select your interests to get started"
  );
  renderSection(
    exploreGrid,
    sections.explore,
    "explore",
    "No exploratory recommendations match the current filters."
  );

  setupMouseReactiveEffects();
}

function renderLoadingState() {
  const skeleton = Array.from({ length: 3 }, renderSkeletonCard).join("");
  trendingGrid.innerHTML = skeleton;
  basedGrid.innerHTML = skeleton;
  exploreGrid.innerHTML = skeleton;
}

function renderSkeletonCard() {
  return `
    <article class="recommendation-card loading-card">
      <div class="skeleton-block"></div>
      <div class="skeleton-block large"></div>
      <div class="skeleton-block"></div>
      <div class="skeleton-block"></div>
      <div class="skeleton-block"></div>
    </article>
  `;
}

function renderSection(container, items, section, emptyMessage) {
  if (items.length === 0) {
    container.innerHTML = renderEmptyCard(emptyMessage);
    return;
  }

  container.innerHTML = items.map((item, index) => renderCard(item, section, index)).join("");
}

function rankSections(catalog) {
  const signals = buildBehaviorSignals(catalog);

  const enriched = catalog.map((item) => {
    const base = basePersonalScore(item, signals);
    const trendingScore = getTrendingScore(item);
    const exploreScore = item.novelty * 18 + item.freshness * 12 - getHistoryPenalty(item) * 6;

    return {
      ...item,
      baseScore: base,
      trendingScore,
      exploreScore,
    };
  });

  return {
    trending: enriched
      .filter((item) => trendingEligibility(item))
      .sort((left, right) => right.trendingScore - left.trendingScore)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        explanation: getRecommendationReason(item, "trending"),
      })),
    based: enriched
      .sort((left, right) => right.baseScore - left.baseScore)
      .slice(0, 9)
      .map((item) => ({
        ...item,
        explanation: getRecommendationReason(item, "based"),
      })),
    explore: enriched
      .filter((item) => !state.savedIds.has(item.id))
      .sort((left, right) => right.exploreScore - left.exploreScore)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        explanation: getRecommendationReason(item, "explore"),
      })),
  };
}

function basePersonalScore(item, signals) {
  const interestMatches = item.topics.filter((topic) => state.selectedInterests.has(topic)).length;
  const likedTopicMatches = item.topics.reduce(
    (sum, topic) => sum + (signals.topicAffinity[topic] || 0),
    0
  );
  const typeMatch = state.selectedType === "All" || state.selectedType === item.domain ? 1 : 0.2;
  const moodMatch = state.selectedMood === "All" || item.moods.includes(state.selectedMood) ? 1 : 0.2;
  const savedBoost = state.savedIds.has(item.id) ? 8 : 0;
  const likedBoost = state.likedIds.has(item.id) ? 10 : 0;
  const dislikedPenalty = state.dislikedIds.has(item.id) ? 18 : 0;
  const clickBoost = (state.clickCounts[item.id] || 0) * 3;

  return (
    interestMatches * 18 +
    likedTopicMatches * 5 +
    (signals.domainAffinity[item.domain] || 0) * 7 +
    typeMatch * 12 +
    moodMatch * 10 +
    item.freshness * 14 +
    item.popularity * 12 +
    item.novelty * 8 +
    savedBoost +
    likedBoost +
    clickBoost -
    dislikedPenalty
  );
}

function trendingEligibility(item) {
  return getTrendingScore(item) > 0;
}

function getRecommendationReason(item, section) {
  if (section === "trending") {
    return state.clickCounts[item.id] > 0
      ? `Trending in ${item.primaryTag} with ${state.clickCounts[item.id]} recent click${state.clickCounts[item.id] === 1 ? "" : "s"}.`
      : `Trending in ${item.primaryTag}.`;
  }

  if (section === "explore") {
    return state.selectedInterests.size > 0
      ? `Explore new because you showed interest in ${firstInterest()}.`
      : `Explore new content in ${item.primaryTag}.`;
  }

  const matchedInterest = item.topics.find((topic) => state.selectedInterests.has(topic));
  if (matchedInterest) {
    return `Based on your interest in ${formatChipLabel(matchedInterest)}.`;
  }

  if (state.interactions.length > 0) {
    const recent = state.interactions[0];
    const recentItem = findCatalogItem(recent.id);
    if (recentItem) {
      return `Because you viewed ${recentItem.title}.`;
    }
  }

  return `Because you liked ${item.primaryTag}.`;
}

function getVisibleCatalog() {
  const activeCatalog = state.catalog.length > 0 ? state.catalog : fallbackCatalog.map((item) => normalizeFallback(item));

  return activeCatalog.filter((item) => {
    if (state.hiddenIds.has(item.id)) {
      return false;
    }

    if (state.selectedType !== "All" && item.domain !== state.selectedType) {
      return false;
    }

    if (state.selectedMood !== "All" && !item.moods.includes(state.selectedMood)) {
      return false;
    }

    if (!matchesSearch(item, state.searchQuery)) {
      return false;
    }

    return true;
  });
}

function matchesSearch(item, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    item.title,
    item.creator,
    item.blurb,
    item.domain,
    item.primaryTag,
    ...item.topics,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function renderCard(item, section, index = 0) {
  const typeIcon = domainIcons[item.domain] || "•";
  const badge =
    section === "trending" ? `${Math.round(item.trendingScore)} trending` : `${Math.round(item.baseScore || item.exploreScore || 0)} match`;
  const artwork = getItemImage(item);

  return `
    <article class="recommendation-card mouse-reactive" style="--card-accent: ${domainPalette[item.domain]}; --stagger: ${index * 70}ms">
      <div class="media-shell">
        <img class="card-image" src="${escapeHtml(artwork)}" alt="${escapeHtml(item.title)} artwork" loading="lazy" />
        <div class="media-overlay"></div>
        <div class="media-top">
          <span class="score-badge ${section === "trending" ? "trending" : ""}">${badge}</span>
          <span class="tag-badge">${escapeHtml(formatChipLabel(item.primaryTag))}</span>
        </div>
        <div class="media-bottom">
          <span class="type-badge">${typeIcon} ${item.domain}</span>
          <span class="media-source">${escapeHtml(item.source || "Live source")}</span>
        </div>
      </div>

      <a
        class="card-link"
        href="${escapeHtml(item.url)}"
        target="_blank"
        rel="noreferrer"
        data-card-action="open"
        data-item-id="${escapeHtml(item.id)}"
      >
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <div class="card-meta">
            <span>${escapeHtml(item.creator)}</span>
            <span>${item.duration} min</span>
          </div>
        </div>
        <p class="recommendation-copy">${escapeHtml(item.blurb)}</p>
      </a>

      <p class="card-explanation">${escapeHtml(item.explanation)}</p>

      <div class="action-row">
        <div class="action-group">
          <button class="action-button ${state.likedIds.has(item.id) ? "active" : ""}" data-action="like" data-item-id="${escapeHtml(item.id)}">👍 Like</button>
          <button class="action-button negative ${state.dislikedIds.has(item.id) ? "active" : ""}" data-action="dislike" data-item-id="${escapeHtml(item.id)}">👎 Dislike</button>
          <button class="action-button ${state.savedIds.has(item.id) ? "active" : ""}" data-action="save" data-item-id="${escapeHtml(item.id)}">💾 Save</button>
        </div>
        <button class="action-button negative" data-action="hide" data-item-id="${escapeHtml(item.id)}">Not interested</button>
      </div>
    </article>
  `;
}

function renderEmptyCard(message) {
  return `
    <article class="recommendation-card loading-card">
      <div>
        <h3>No items here yet</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    </article>
  `;
}

function handleGridClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    event.preventDefault();
    const item = findCatalogItem(actionButton.dataset.itemId);
    if (!item) {
      return;
    }

    handleItemAction(actionButton.dataset.action, item);
    return;
  }

  const openLink = event.target.closest('[data-card-action="open"]');
  if (!openLink) {
    return;
  }

  const item = findCatalogItem(openLink.dataset.itemId);
  if (!item) {
    return;
  }

  recordInteraction(item, "open");
}

function handleItemAction(action, item) {
  if (action === "like") {
    toggleInSet(state.likedIds, item.id);
    state.dislikedIds.delete(item.id);
    recordInteraction(item, "like");
  } else if (action === "dislike") {
    toggleInSet(state.dislikedIds, item.id);
    state.likedIds.delete(item.id);
    recordInteraction(item, "dislike");
  } else if (action === "save") {
    toggleInSet(state.savedIds, item.id);
    recordInteraction(item, "save");
  } else if (action === "hide") {
    state.hiddenIds.add(item.id);
    recordInteraction(item, "hide");
  }

  persistState();
  render();
}

function handleBounceClick(event) {
  const target = event.target.closest(".primary-button, .action-button, .chip, .theme-toggle");
  if (!target) {
    return;
  }

  target.classList.remove("bounce-click");
  void target.offsetWidth;
  target.classList.add("bounce-click");
}

function toggleInSet(set, value) {
  if (set.has(value)) {
    set.delete(value);
    return;
  }

  set.add(value);
}

function recordInteraction(item, action) {
  state.interactions = [
    {
      id: item.id,
      category: item.domain,
      action,
      timestamp: new Date().toISOString(),
    },
    ...state.interactions,
  ].slice(0, INTERACTION_LIMIT);

  state.clickCounts[item.id] = (state.clickCounts[item.id] || 0) + 1;
  persistState();
}

function buildBehaviorSignals(catalog) {
  const topicAffinity = {};
  const domainAffinity = {};

  state.interactions.forEach((interaction, index) => {
    const weight = Math.max(0.35, 1 - index * 0.08);
    domainAffinity[interaction.category] = (domainAffinity[interaction.category] || 0) + weight;

    const item = catalog.find((entry) => entry.id === interaction.id) || findCatalogItem(interaction.id);
    if (!item) {
      return;
    }

    item.topics.forEach((topic) => {
      topicAffinity[topic] = (topicAffinity[topic] || 0) + weight;
    });
  });

  return { topicAffinity, domainAffinity };
}

function getTrendingScore(item) {
  const clicks = state.clickCounts[item.id] || 0;
  return clicks * 10 + item.freshness * 5 + item.popularity * 4;
}

function getHistoryPenalty(item) {
  return state.dislikedIds.has(item.id) || state.hiddenIds.has(item.id) ? 2 : 0;
}

function buildFeedSummary(count) {
  const interestText =
    state.selectedInterests.size > 0
      ? `${state.selectedInterests.size} interest${state.selectedInterests.size === 1 ? "" : "s"} selected`
      : "no interests selected yet";
  const updateText = state.lastUpdated ? `Updated ${formatTime(state.lastUpdated)}.` : "";
  return `${count} items in the current feed, ${interestText}. ${updateText}`.trim();
}

function buildLiveQuery() {
  const interests = [...state.selectedInterests];

  return {
    primary: interests.slice(0, 2).join(" ") || "tech music business",
    secondary: interests.slice(0, 3).join(" ") || "podcast movie news",
  };
}

function firstInterest() {
  return formatChipLabel([...state.selectedInterests][0] || "tech");
}

function hydrateState() {
  state.interactions = readStoredJson(STORAGE_KEYS.interactions, []);
  state.clickCounts = readStoredJson(STORAGE_KEYS.clickCounts, {});
  state.likedIds = new Set(readStoredJson(STORAGE_KEYS.likedIds, []));
  state.dislikedIds = new Set(readStoredJson(STORAGE_KEYS.dislikedIds, []));
  state.savedIds = new Set(readStoredJson(STORAGE_KEYS.savedIds, []));
  state.hiddenIds = new Set(readStoredJson(STORAGE_KEYS.hiddenIds, []));
  state.selectedInterests = new Set(readStoredJson(STORAGE_KEYS.interests, []));
  state.theme = readStoredJson(STORAGE_KEYS.theme, "dark");
}

function persistPreferences() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.interests, JSON.stringify([...state.selectedInterests]));
  } catch (error) {
    // Ignore storage failures.
  }
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.interactions, JSON.stringify(state.interactions));
    window.localStorage.setItem(STORAGE_KEYS.clickCounts, JSON.stringify(state.clickCounts));
    window.localStorage.setItem(STORAGE_KEYS.likedIds, JSON.stringify([...state.likedIds]));
    window.localStorage.setItem(STORAGE_KEYS.dislikedIds, JSON.stringify([...state.dislikedIds]));
    window.localStorage.setItem(STORAGE_KEYS.savedIds, JSON.stringify([...state.savedIds]));
    window.localStorage.setItem(STORAGE_KEYS.hiddenIds, JSON.stringify([...state.hiddenIds]));
    window.localStorage.setItem(STORAGE_KEYS.interests, JSON.stringify([...state.selectedInterests]));
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(state.theme));
  } catch (error) {
    // Ignore storage failures.
  }
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  applyTheme();
  persistState();
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  themeLabel.textContent = state.theme === "light" ? "Light" : "Dark";
}

function setupMouseReactiveEffects() {
  document.querySelectorAll(".mouse-reactive, .recommendation-card").forEach((element) => {
    if (element.dataset.reactiveBound === "true") {
      return;
    }

    element.dataset.reactiveBound = "true";
    element.addEventListener("mousemove", (event) => updateReactiveTilt(element, event));
    element.addEventListener("mouseleave", () => resetReactiveTilt(element));
  });
}

function setupCursorAura() {
  if (!cursorAura || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  window.addEventListener("mousemove", (event) => {
    cursorAura.style.opacity = "1";
    cursorAura.style.transform = `translate(${event.clientX - 140}px, ${event.clientY - 140}px)`;
  });

  window.addEventListener("mouseleave", () => {
    cursorAura.style.opacity = "0";
  });
}

function updateReactiveTilt(element, event) {
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * 8;
  const rotateX = (0.5 - y) * 7;

  element.style.setProperty("--rx", `${rotateX}deg`);
  element.style.setProperty("--ry", `${rotateY}deg`);
}

function resetReactiveTilt(element) {
  element.style.setProperty("--rx", "0deg");
  element.style.setProperty("--ry", "0deg");
}

function readStoredJson(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    return fallback;
  }
}

function findCatalogItem(itemId) {
  return [...state.catalog, ...fallbackCatalog.map((item) => normalizeFallback(item))].find((item) => item.id === itemId);
}

function normalizeFallback(item) {
  const primaryTag = item.topics[0] || "tech";

  return {
    ...item,
    primaryTag,
    image: item.image || createArtwork({ title: item.title, domain: item.domain, tag: primaryTag }),
  };
}

function normalizeItem(item, domain, sourceLabel) {
  const topics = mapTopics(item.topics || []);
  const primaryTag = topics[0] || topicForDomain(domain);

  return {
    ...item,
    domain,
    source: item.source || sourceLabel,
    topics,
    moods: mapMoods(item.topics || [], domain),
    primaryTag,
    image: item.image || createArtwork({ title: item.title, domain, tag: primaryTag }),
  };
}

function getItemImage(item) {
  return item.image || createArtwork({ title: item.title, domain: item.domain, tag: item.primaryTag });
}

function createArtwork({ title, domain, tag }) {
  const palette = artworkPalette[domain] || ["#ff9f6e", "#1f6f78"];
  const initials = String(title)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="100%" stop-color="${palette[1]}"/>
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.18)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="40" fill="url(#g)"/>
      <circle cx="660" cy="90" r="130" fill="rgba(255,255,255,0.12)"/>
      <circle cx="170" cy="430" r="180" fill="rgba(0,0,0,0.12)"/>
      <rect x="44" y="44" width="712" height="432" rx="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
      <rect x="-120" y="0" width="220" height="520" fill="url(#shine)" transform="rotate(12 400 260)"/>
      <text x="74" y="106" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="26" letter-spacing="4">${escapeSvgText(
        domain.toUpperCase()
      )}</text>
      <text x="74" y="174" fill="white" font-family="Arial, sans-serif" font-size="96" font-weight="700">${escapeSvgText(
        initials || domain.charAt(0)
      )}</text>
      <text x="74" y="408" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="36" font-weight="700">${escapeSvgText(
        formatChipLabel(tag || topicForDomain(domain))
      )}</text>
      <text x="74" y="446" fill="rgba(255,255,255,0.72)" font-family="Arial, sans-serif" font-size="24">${escapeSvgText(
        String(title).slice(0, 34)
      )}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function topicForDomain(domain) {
  const defaults = {
    Video: "tech",
    Music: "music",
    Podcast: "business",
    Movie: "movies",
    News: "news",
  };

  return defaults[domain] || "tech";
}

function mapTopics(topics) {
  const mapped = [...new Set(topics.map((topic) => normalizeTopic(topic)).filter(Boolean))];
  return mapped.length > 0 ? mapped.slice(0, 4) : ["tech"];
}

function normalizeTopic(topic) {
  const value = String(topic).toLowerCase();

  if (value.includes("tech") || value.includes("software") || value.includes("ai") || value.includes("science")) {
    return "tech";
  }
  if (value.includes("business") || value.includes("startup") || value.includes("finance")) {
    return "business";
  }
  if (value.includes("sport")) {
    return "sports";
  }
  if (value.includes("music") || value.includes("song") || value.includes("album")) {
    return "music";
  }
  if (value.includes("movie") || value.includes("film") || value.includes("cinema")) {
    return "movies";
  }
  if (value.includes("news") || value.includes("story") || value.includes("politic")) {
    return "news";
  }
  if (value.includes("design") || value.includes("culture") || value.includes("art")) {
    return "design";
  }
  if (value.includes("focus")) {
    return "tech";
  }

  return "";
}

function mapMoods(topics, domain) {
  const text = `${topics.join(" ")} ${domain}`.toLowerCase();
  const moods = [];

  if (text.includes("music") || text.includes("movie") || text.includes("culture")) {
    moods.push("chill");
  }
  if (text.includes("business") || text.includes("tech") || text.includes("podcast") || text.includes("news")) {
    moods.push("focus");
  }
  if (text.includes("sports") || text.includes("video")) {
    moods.push("energetic");
  }

  return moods.length > 0 ? [...new Set(moods)] : ["focus"];
}

function dedupeItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.domain}-${String(item.title).toLowerCase()}-${String(item.creator).toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatChipLabel(value) {
  if (value === "All") {
    return "All";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clampDuration(value) {
  return Math.max(3, Math.min(180, Math.round(value || 10)));
}

function truncate(text) {
  if (!text) {
    return "Live recommendation from a connected source.";
  }

  return text.length > 130 ? `${text.slice(0, 127)}...` : text;
}

function recencyScore(input) {
  if (!input) {
    return 0.55;
  }

  const timestamp = typeof input === "number" ? input : new Date(input).getTime();
  if (Number.isNaN(timestamp)) {
    return 0.55;
  }

  const ageDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  if (ageDays <= 1) return 1;
  if (ageDays <= 7) return 0.9;
  if (ageDays <= 30) return 0.75;
  if (ageDays <= 180) return 0.62;
  return 0.45;
}

function normalizeRank(index, total, rawSignal = 0) {
  const rankScore = total > 1 ? 1 - index / total : 0.7;
  const signalScore = rawSignal > 0 ? Math.min(1, Math.log10(rawSignal + 10) / 5) : 0.55;
  return (rankScore + signalScore) / 2;
}

function noveltyFromTitle(title) {
  const hash = [...(title || "item")].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return 0.35 + (hash % 55) / 100;
}

function upscaleArtwork(url) {
  if (!url) {
    return null;
  }

  return url.replace(/([0-9]{2,4})x([0-9]{2,4})bb/g, "900x900bb");
}

function estimateReadTime(title, body) {
  const words = `${title || ""} ${body || ""}`.trim().split(/\s+/).length;
  return clampDuration(Math.max(4, Math.round(words / 180) || 6));
}

async function fetchVideos(primaryQuery, secondaryQuery) {
  const url = new URL("https://api.dailymotion.com/videos");
  url.search = new URLSearchParams({
    search: primaryQuery || secondaryQuery || "technology",
    limit: "14",
    fields: "id,title,description,url,duration,created_time,tags,channel,views_total,thumbnail_720_url,thumbnail_480_url,thumbnail_240_url",
  }).toString();

  const response = await fetch(url);
  const data = await response.json();

  return (data.list || []).map((item, index) => ({
    id: `video-${item.id}`,
    title: item.title,
    creator: item.channel || "Dailymotion creator",
    duration: clampDuration(item.duration / 60 || 12),
    freshness: recencyScore(item.created_time ? item.created_time * 1000 : null),
    popularity: normalizeRank(index, data.list.length, item.views_total),
    novelty: noveltyFromTitle(item.title),
    topics: inferTopics(`${item.title} ${item.description || ""} ${(item.tags || []).join(" ")}`),
    blurb: truncate(item.description || "Live video recommendation from Dailymotion."),
    url: item.url,
    image: item.thumbnail_720_url || item.thumbnail_480_url || item.thumbnail_240_url || null,
  }));
}

async function fetchMusic(primaryQuery, secondaryQuery) {
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({
    term: primaryQuery || secondaryQuery || "focus music",
    entity: "song",
    limit: "14",
    country: "US",
  }).toString();

  const response = await fetch(url);
  const data = await response.json();

  return (data.results || []).map((item, index) => ({
    id: `music-${item.trackId || index}`,
    title: item.trackName,
    creator: item.artistName || "Unknown artist",
    duration: clampDuration((item.trackTimeMillis || 180000) / 60000),
    freshness: recencyScore(item.releaseDate),
    popularity: normalizeRank(index, data.results.length),
    novelty: noveltyFromTitle(item.trackName),
    topics: inferTopics(`${primaryQuery} ${secondaryQuery} ${item.primaryGenreName || ""}`),
    blurb: truncate(`Genre: ${item.primaryGenreName || "Music"}${item.collectionName ? ` • Album: ${item.collectionName}` : ""}`),
    url: item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl,
    image: item.artworkUrl600 || upscaleArtwork(item.artworkUrl100 || item.artworkUrl60 || item.artworkUrl30),
  }));
}

async function fetchPodcasts(primaryQuery, secondaryQuery) {
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({
    term: primaryQuery || secondaryQuery || "business podcast",
    entity: "podcast",
    limit: "14",
    country: "US",
  }).toString();

  const response = await fetch(url);
  const data = await response.json();

  return (data.results || []).map((item, index) => ({
    id: `podcast-${item.collectionId || index}`,
    title: item.collectionName,
    creator: item.artistName || "Podcast creator",
    duration: 42,
    freshness: recencyScore(item.releaseDate),
    popularity: normalizeRank(index, data.results.length),
    novelty: noveltyFromTitle(item.collectionName),
    topics: inferTopics(`${primaryQuery} ${secondaryQuery} ${item.primaryGenreName || ""}`),
    blurb: truncate(`Podcast recommendation from ${item.artistName || "a creator"} in ${item.primaryGenreName || "spoken audio"}.`),
    url: item.collectionViewUrl,
    image: item.artworkUrl600 || upscaleArtwork(item.artworkUrl100 || item.artworkUrl60 || item.artworkUrl30),
  }));
}

async function fetchMovies(primaryQuery, secondaryQuery) {
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({
    term: primaryQuery || secondaryQuery || "documentary",
    entity: "movie",
    limit: "14",
    country: "US",
  }).toString();

  const response = await fetch(url);
  const data = await response.json();

  return (data.results || []).map((item, index) => ({
    id: `movie-${item.trackId || index}`,
    title: item.trackName,
    creator: item.artistName || "Studio release",
    duration: clampDuration((item.trackTimeMillis || 5400000) / 60000),
    freshness: recencyScore(item.releaseDate),
    popularity: normalizeRank(index, data.results.length),
    novelty: noveltyFromTitle(item.trackName),
    topics: inferTopics(`${primaryQuery} ${secondaryQuery} ${item.primaryGenreName || ""} ${item.longDescription || ""}`),
    blurb: truncate(item.longDescription || item.shortDescription || `Genre: ${item.primaryGenreName || "Movie"}`),
    url: item.trackViewUrl,
    image: item.artworkUrl600 || upscaleArtwork(item.artworkUrl100 || item.artworkUrl60 || item.artworkUrl30),
  }));
}

async function fetchNews(primaryQuery, secondaryQuery) {
  const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
  url.search = new URLSearchParams({
    query: primaryQuery || secondaryQuery || "technology",
    tags: "story",
    hitsPerPage: "14",
  }).toString();

  const response = await fetch(url);
  const data = await response.json();

  return (data.hits || [])
    .filter((item) => item.url)
    .map((item, index) => ({
      id: `news-${item.objectID}`,
      title: item.title || item.story_title || "Untitled story",
      creator: item.author || "Reporter",
      duration: estimateReadTime(item.title || item.story_title, item.story_text),
      freshness: recencyScore(item.created_at),
      popularity: normalizeRank(index, data.hits.length, item.points),
      novelty: noveltyFromTitle(item.title || item.story_title),
      topics: inferTopics(`${item.title || item.story_title || ""} ${item.story_text || ""} ${primaryQuery} ${secondaryQuery}`),
      blurb: truncate(item.story_text || "Live story surfaced from a public news feed."),
      url: item.url,
    }));
}

function inferTopics(text) {
  const normalized = String(text).toLowerCase();
  const matches = interestOptions.filter((topic) => normalized.includes(topic));
  return matches.length > 0 ? matches : ["tech"];
}

init();
