// Home/overview business logic.
function applyGamePatch(patch) {
  if (!patch || !patch.gameId) {
    return;
  }

  const game = state.games.find((item) => item.id === patch.gameId);
  if (!game) {
    return;
  }

  const previous = {
    title: game.title,
    url: game.url,
    description: game.description,
    isMachineTranslated: !!game.isMachineTranslated,
    tags: normalizeTagList(game.tags),
    status: normalizeStatus(game.status),
    buildStatus: normalizeBuildStatus(game.buildStatus),
    rating: normalizeRating(game.rating),
    gameType: String(game.gameType || '').trim(),
    isUnpacked: !!game.isUnpacked,
    gamePath: game.gamePath,
    playedMinutes: normalizePlayedMinutes(game.playedMinutes),
    added: game.added,
    lastPlayed: game.lastPlayed,
    archiveFile: game.archiveFile
  };

  if (Object.prototype.hasOwnProperty.call(patch, 'status')) {
    game.status = normalizeStatus(patch.status);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'buildStatus')) {
    game.buildStatus = normalizeBuildStatus(patch.buildStatus);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'rating')) {
    game.rating = normalizeRating(patch.rating);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'playedMinutes')) {
    game.playedMinutes = normalizePlayedMinutes(patch.playedMinutes);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'lastPlayed')) {
    game.lastPlayed = patch.lastPlayed || null;
  }

  if (state.runningSessions.has(game.id) &&
      (Object.prototype.hasOwnProperty.call(patch, 'playedMinutes') || Object.prototype.hasOwnProperty.call(patch, 'lastPlayed'))) {
    markGameSessionStopped(game.id);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
    game.title = String(patch.title || '').trim() || game.title;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'url')) {
    game.url = String(patch.url || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'description')) {
    game.description = String(patch.description || '');
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'isMachineTranslated')) {
    game.isMachineTranslated = !!patch.isMachineTranslated;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'tags')) {
    game.tags = normalizeTagList(patch.tags);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'saveGamesPath')) {
    game.saveGamesPath = String(patch.saveGamesPath || '');
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'saveGamesFileFilter')) {
    game.saveGamesFileFilter = String(patch.saveGamesFileFilter || '');
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'executableRelativePath')) {
    game.executableRelativePath = String(patch.executableRelativePath || '');
  }

  if (shouldRebuildGameListForPatch(previous, game)) {
    renderGames();
    return;
  }

  syncGameCardContent(game);
  syncGameCard(game);

  const selected = getSelectedGame();
  if (selected && selected.id === game.id && gameModal.classList.contains('open')) {
    syncDetailPanelFromGame(game);
  }
}

function shouldRebuildGameListForPatch(previous, game) {
  const previousMatch = matchesCurrentFilters(previous);
  const nextMatch = matchesCurrentFilters(game);
  if (previousMatch !== nextMatch) {
    return true;
  }

  if (!nextMatch) {
    return false;
  }

  if ((state.sortBy === 'title-asc' || state.sortBy === 'title-desc') && safeText(previous.title) !== safeText(game.title)) {
    return true;
  }

  if (state.sortBy === 'lastplayed-desc' && toDateValue(previous.lastPlayed) !== toDateValue(game.lastPlayed)) {
    return true;
  }

  if (state.sortBy === 'playedhours-desc' || state.sortBy === 'playedhours-asc') {
    if (normalizePlayedMinutes(previous.playedMinutes) !== normalizePlayedMinutes(game.playedMinutes)) {
      return true;
    }
  }

  return false;
}

function matchesCurrentFilters(gameLike) {
  const parsedFilter = parseFilterQuery(state.filterText);
  return passesSelectedFilters(gameLike, parsedFilter);
}

function isGameReady(gameLike) {
  return !!(gameLike && (gameLike.gameType == 'Manual' ||gameLike.gameType == 'Steam' || gameLike.isUnpacked));
}

function getInstallBucket(gameLike) {
  return ((isGameReady(gameLike) && gameLike.missing == false) ? 'ready' : 'not-installed');
}

function getSourceBucket(gameLike) {
  if (gameLike && gameLike.gameType === 'Steam') {
    return 'steam';
  }

  return gameLike && gameLike.gameType == 'Manual' ? 'extra' : 'archive';
}

function passesSelectedFilters(gameLike, parsedFilter) {
  const normalizedStatus = normalizeStatus(gameLike.status);
  if (state.statusFilters.size > 0 && !state.statusFilters.has(normalizedStatus)) {
    return false;
  }

  const normalizedRating = normalizeRating(gameLike.rating);
  if (state.ratingFilters.size > 0 && !state.ratingFilters.has(normalizedRating)) {
    return false;
  }

  if (state.installFilters.size > 0 && !state.installFilters.has(getInstallBucket(gameLike))) {
    return false;
  }

  if (state.sourceFilters.size > 0 && !state.sourceFilters.has(getSourceBucket(gameLike))) {
    return false;
  }

  if (state.metaFilters.size > 0) {
    const hasUrl = String(gameLike.url || '').trim().length > 0;
    const hasTags = normalizeTagList(gameLike.tags).length > 0;
    const hasSaveLocation = String(gameLike.saveGamesPath || '').trim().length > 0;

    if (state.metaFilters.has('no-url') && hasUrl) {
      return false;
    }

    if (state.metaFilters.has('no-tags') && hasTags) {
      return false;
    }

    if (state.metaFilters.has('no-save-location') && hasSaveLocation) {
      return false;
    }
  }

  if (state.buildStatusFilters.size > 0) {
    const effectiveBuildStatus = getEffectiveBuildStatus(gameLike);
    if (!state.buildStatusFilters.has(effectiveBuildStatus)) {
      return false;
    }
  }

  if (!parsedFilter.hasAnyTerm) {
    return true;
  }

  const gameTags = normalizeTagList(gameLike.tags).map((tag) => tag.toLowerCase());
  for (const requiredTag of parsedFilter.tagTerms) {
    if (!gameTags.includes(requiredTag)) {
      return false;
    }
  }

  for (const excludedTag of parsedFilter.excludedTagTerms || []) {
    if (gameTags.includes(excludedTag)) {
      return false;
    }
  }

  const searchText = [gameLike.title, gameLike.description, gameLike.archiveFile, gameLike.url, gameLike.gamePath]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const requiredTextTerm of parsedFilter.textTerms) {
    if (!searchText.includes(requiredTextTerm)) {
      return false;
    }
  }

  for (const excludedTextTerm of parsedFilter.excludedTextTerms || []) {
    if (searchText.includes(excludedTextTerm)) {
      return false;
    }
  }

  return true;
}

function isEveryFilterSelected(selectedSet, allValues) {
  if (!selectedSet || selectedSet.size !== allValues.length) {
    return false;
  }

  for (const value of allValues) {
    if (!selectedSet.has(value)) {
      return false;
    }
  }

  return true;
}

function isFilterSelectionNeutral(selectedSet, allValues) {
  return selectedSet.size === 0 || isEveryFilterSelected(selectedSet, allValues);
}

// Cover requests are batched instead of sent one-by-one: the overview grid can request
// covers for hundreds of cards during a single render, and one IPC round-trip per game
// (JSON (de)serialization + message-loop overhead) made the overview noticeably slow.
// Requests made within the same tick (e.g. all cards rendered during renderGrid) are
// coalesced into a single backend call - the response only carries lightweight URLs, so
// there's no benefit in splitting it into smaller chunks.
const pendingCoverRequestIds = new Set();
let coverRequestFlushTimer = null;


function requestGameCover(game) {
  if (!game || !game.id || game.coverImageDataUrl || game.coverLoadRequested || game.coverChecked) {
    return;
  }

  game.coverLoadRequested = true;
  pendingCoverRequestIds.add(game.id);
  scheduleCoverRequestFlush();
}

function scheduleCoverRequestFlush() {
  if (coverRequestFlushTimer !== null) {
    return;
  }

  coverRequestFlushTimer = window.setTimeout(flushPendingCoverRequests, 100);
}

function flushPendingCoverRequests() {
  coverRequestFlushTimer = null;
  if (pendingCoverRequestIds.size === 0) {
    return;
  }

  const gameIds = Array.from(pendingCoverRequestIds);
  pendingCoverRequestIds.clear();

  window.BackendApi.loadGameCovers(gameIds);
}

function requestGameImages(game) {
  if (!game || !game.id || game.imagesLoaded || game.imageLoadRequested) {
    return;
  }

  game.imageLoadRequested = true;
  window.BackendApi.loadGameImages(game.id);
}

// Requests covers for every game that doesn't have one yet. requestGameCover/
// flushPendingCoverRequests take care of batching the actual backend calls.
// Visible (filtered/sorted) games are requested first, in display order, so
// cards fill in top-to-bottom instead of in random insertion order.
function loadAllGameCovers() {
  const visible = Array.isArray(state.visibleGames) ? state.visibleGames : getVisibleGames();
  const seen = new Set(visible.map((game) => game.id));
  const rest = state.games.filter((game) => !seen.has(game.id));

  for (const game of visible.concat(rest)) {
    requestGameCover(game);
  }
}

// Clears the per-game cover/gallery cache flags and re-requests them, e.g. after a full
// backend refresh where the images on disk may have changed.
function reloadAllGameImages() {
  for (const game of state.games) {
    game.coverChecked = false;
    game.coverLoadRequested = false;
    game.coverImageDataUrl = null;
    game.imagesLoaded = false;
    game.imageLoadRequested = false;
    game.imageDataUrls = [];
  }

  if (typeof renderGames === 'function') {
    renderGames();
  }

  loadAllGameCovers();

  const selected = getSelectedGame();
  if (selected) {
    requestGameImages(selected);
  }
}

function getSelectedGame() {
  return state.games.find((game) => game.id === state.selectedGameId) || null;
}

function getVisibleGames() {
  const parsedFilter = parseFilterQuery(state.filterText);

  const filtered = state.games.filter((game) => {
    return passesSelectedFilters(game, parsedFilter);
  });

  if (state.sortBy === 'random') {
    if (!state.randomOrder || state.randomOrder.size === 0) {
      regenerateRandomOrder();
    } else {
      ensureRandomOrder();
    }
  }

  const sorted = [...filtered].sort((a, b) => compareGames(a, b, state.sortBy));
  return sorted;
}

function regenerateRandomOrder() {
  state.randomOrder = new Map();
  ensureRandomOrder();
}

function ensureRandomOrder() {
  if (!state.randomOrder) {
    state.randomOrder = new Map();
  }

  for (const game of state.games) {
    if (!state.randomOrder.has(game.id)) {
      state.randomOrder.set(game.id, Math.random());
    }
  }
}

function normalizeStatus(status) {
  if (status === 'completed' || status === 'in-progress' || status === 'not-started'|| status === 'abandoned') {
    return status;
  }

  return 'not-started';
}

function normalizeBuildStatus(buildStatus) {
  const value = String(buildStatus || '').trim().toLowerCase();
  if (value === 'completed' || value === 'abandoned' || value === 'on-hold' || value === 'in-progress') {
    return value;
  }

  if (value === 'onhold') {
    return 'on-hold';
  }

  if (value === 'in progress') {
    return 'in-progress';
  }

  return '';
}

function getEffectiveBuildStatus(gameLike) {
  return normalizeBuildStatus(gameLike?.buildStatus) || 'completed';
}

function getBuildStatusLabel(buildStatus) {
  switch (getEffectiveBuildStatus({ buildStatus })) {
    case 'completed':
      return t('build_status_completed', 'Completed');
    case 'abandoned':
      return t('build_status_abandoned', 'Abandoned');
    case 'on-hold':
      return t('build_status_on_hold', 'On Hold');
    default:
      return t('build_status_in_progress', 'In Progress');
  }
}

function normalizeRating(rating) {
  const numeric = Number(rating);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.trunc(numeric)));
}

function normalizePlayedMinutes(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.trunc(numeric));
}

function normalizeCardAspectRatioMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  if (mode === 'portrait-3-4' || mode === 'steam-standard' || mode === 'landscape-4-3' || mode === 'square-1-1'|| mode === 'landscape-16-9') {
    return mode;
  }

  return 'landscape-4-3';
}

function normalizeCardImageFitMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  if (mode === 'cover' || mode === 'contain') {
    return mode;
  }

  return 'cover';
}

function setCardAspectRatioMode(mode) {
  const normalizedMode = normalizeCardAspectRatioMode(mode);
  state.cardAspectRatioMode = normalizedMode;

  if (gridEl) {
    gridEl.dataset.cardAspect = normalizedMode;
  }
}

function setCardImageFitMode(mode) {
  const normalizedMode = normalizeCardImageFitMode(mode);
  state.cardImageFitMode = normalizedMode;

  if (gridEl) {
    gridEl.dataset.cardImageFit = normalizedMode;
  }
}

const ALLOWED_SORT_OPTIONS = new Set([
  'lastplayed-desc',
  'rating-desc',
  'rating-asc',
  'playedhours-desc',
  'playedhours-asc',
  'title-asc',
  'title-desc',
  'added-desc',
  'added-asc',
  'random'
]);

let persistUiViewStateTimer = null;

function normalizeSortBy(sortBy) {
  const normalized = String(sortBy || '').trim();
  return ALLOWED_SORT_OPTIONS.has(normalized) ? normalized : 'lastplayed-desc';
}

function getUiViewStateSnapshot() {
  return {
    sortBy: normalizeSortBy(state.sortBy),
    cardSizePercent: Math.max(70, Math.min(200, Number(state.cardSizePercent) || 100)),
    filterText: String(state.filterText || '').trim(),
    statusFilters: Array.from(state.statusFilters || []),
    ratingFilters: Array.from(state.ratingFilters || []),
    installFilters: Array.from(state.installFilters || []),
    sourceFilters: Array.from(state.sourceFilters || []),
    metaFilters: Array.from(state.metaFilters || []),
    buildStatusFilters: Array.from(state.buildStatusFilters || [])
  };
}

function applyUiViewStateFromBackend(rawState) {
  const viewState = rawState || {};

  state.sortBy = normalizeSortBy(viewState.sortBy);
  state.cardSizePercent = Math.max(70, Math.min(200, Number(viewState.cardSizePercent) || 100));
  state.filterText = String(viewState.filterText || '').trim();

  const normalizeStringFilterSet = (rawValues, allowedValues) => {
    const next = new Set();
    const allowed = new Set(allowedValues);
    if (!Array.isArray(rawValues)) {
      return next;
    }

    for (const rawValue of rawValues) {
      const value = String(rawValue || '').trim();
      if (allowed.has(value)) {
        next.add(value);
      }
    }
    return next;
  };

  const normalizeRatingFilterSet = (rawValues) => {
    const next = new Set();
    if (!Array.isArray(rawValues)) {
      return next;
    }

    for (const rawValue of rawValues) {
      const value = Number(rawValue);
      if (Number.isInteger(value) && value >= 0 && value <= 5) {
        next.add(value);
      }
    }
    return next;
  };

  const syncSetValues = (targetSet, nextSet) => {
    targetSet.clear();
    for (const value of nextSet) {
      targetSet.add(value);
    }
  };

  syncSetValues(state.statusFilters, normalizeStringFilterSet(viewState.statusFilters, ALL_STATUS_FILTERS));
  syncSetValues(state.ratingFilters, normalizeRatingFilterSet(viewState.ratingFilters));
  syncSetValues(state.installFilters, normalizeStringFilterSet(viewState.installFilters, ALL_INSTALL_FILTERS));
  syncSetValues(state.sourceFilters, normalizeStringFilterSet(viewState.sourceFilters, ALL_SOURCE_FILTERS));
  syncSetValues(state.metaFilters, normalizeStringFilterSet(viewState.metaFilters, ALL_META_FILTERS));
  syncSetValues(state.buildStatusFilters, normalizeStringFilterSet(viewState.buildStatusFilters, ALL_BUILD_STATUS_FILTERS));

  if (sortSelect) {
    sortSelect.value = state.sortBy;
  }

  if (filterInput) {
    filterInput.value = state.filterText;
  }

  if (typeof applyCardSizePercent === 'function') {
    applyCardSizePercent(state.cardSizePercent);
  }

  if (typeof syncFilterMenuControls === 'function') {
    syncFilterMenuControls();
  }

  if (typeof renderGames === 'function' && Array.isArray(state.games) && state.games.length > 0) {
    renderGames();
  }
}

function resetUiFiltersToDefault() {
  state.filterText = '';
  state.statusFilters.clear();
  state.ratingFilters.clear();
  state.installFilters.clear();
  state.sourceFilters.clear();
  state.metaFilters.clear();
  state.buildStatusFilters.clear();

  if (filterInput) {
    filterInput.value = '';
  }

  if (typeof syncFilterMenuControls === 'function') {
    syncFilterMenuControls();
  }
}

function ensureUiFiltersStillValid() {
  if (!Array.isArray(state.games) || state.games.length === 0) {
    return;
  }

  const visibleGames = getVisibleGames();
  if (visibleGames.length > 0) {
    return;
  }

  const hasFilterText = String(state.filterText || '').trim().length > 0;
  const hasStructuredFilters = state.statusFilters.size > 0 ||
    state.ratingFilters.size > 0 ||
    state.installFilters.size > 0 ||
    state.sourceFilters.size > 0 ||
    state.metaFilters.size > 0 ||
    state.buildStatusFilters.size > 0;
  if (!hasFilterText && !hasStructuredFilters) {
    return;
  }

  //do i need this?
  //resetUiFiltersToDefault();
  if (typeof renderGames === 'function') {
    renderGames();
  }
  setStatus(t('status_filters_reset', 'Gespeicherte Filter waren nicht mehr gueltig und wurden zurueckgesetzt.'));
  queuePersistUiViewState();
}

function queuePersistUiViewState() {
  if (!window.BackendApi || typeof window.BackendApi.saveUiViewState !== 'function') {
    return;
  }

  if (persistUiViewStateTimer) {
    window.clearTimeout(persistUiViewStateTimer);
  }

  persistUiViewStateTimer = window.setTimeout(() => {
    persistUiViewStateTimer = null;
    window.BackendApi.saveUiViewState(getUiViewStateSnapshot());
  }, 180);
}

function formatPlayedHours(playedMinutes) {
  const hours = normalizePlayedMinutes(playedMinutes) / 60;
  return `${hours.toFixed(1)} h`;
}

function getStatusLabel(status) {
  switch (normalizeStatus(status)) {
    case 'completed':
      return t('filter_status_completed', 'Abgeschlossen');
    case 'in-progress':
      return t('filter_status_in_progress', 'Playing');
    default:
      return t('filter_status_not_started', 'Noch nicht gestartet');
  }
}

function compareGames(a, b, sortBy) {
  switch (sortBy) {
    case 'title-desc':
      return safeText(b.title).localeCompare(safeText(a.title));
    case 'rating-desc':
      return normalizeRating(b.rating) - normalizeRating(a.rating);
    case 'rating-asc':
      return normalizeRating(a.rating) - normalizeRating(b.rating);
    case 'playedhours-desc':
      return normalizePlayedMinutes(b.playedMinutes) - normalizePlayedMinutes(a.playedMinutes);
    case 'playedhours-asc':
      return normalizePlayedMinutes(a.playedMinutes) - normalizePlayedMinutes(b.playedMinutes);
    case 'added-desc':
      return toDateValue(b.added) - toDateValue(a.added);
    case 'added-asc':
      return toDateValue(a.added) - toDateValue(b.added);
    case 'lastplayed-desc':
      return toDateValue(b.lastPlayed) - toDateValue(a.lastPlayed);
    case 'random':
      return (state.randomOrder?.get(a.id) ?? 0) - (state.randomOrder?.get(b.id) ?? 0);
    case 'title-asc':
    default:
      return safeText(a.title).localeCompare(safeText(b.title));
  }
}

function toDateValue(dateLike) {
  if (!dateLike) {
    return 0;
  }

  const value = new Date(dateLike).getTime();
  return Number.isFinite(value) ? value : 0;
}

function safeText(value) {
  return String(value || '');
}

function normalizeFilterTagToken(token) {
  return String(token || '')
    .trim()
    .replace(/^#+/, '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function formatTagForFilter(tag) {
  return String(tag || '').trim().replace(/\s+/g, '_');
}

function parseFilterQuery(query) {
  const textTerms = [];
  const excludedTextTerms = [];
  const tagTerms = [];
  const excludedTagTerms = [];
  const source = String(query || '').trim();

  if (!source) {
    return {
      textTerms,
      excludedTextTerms,
      tagTerms,
      excludedTagTerms,
      hasAnyTerm: false
    };
  }

  const tokenRegex = /(-?)"([^"]+)"|(\S+)/g;
  let match;
  while ((match = tokenRegex.exec(source)) !== null) {
    const quotedNegation = match[1] === '-';
    const quotedToken = match[2];
    const plainToken = match[3];

    if (quotedToken !== undefined) {
      const normalizedQuoted = String(quotedToken || '').trim().toLowerCase();
      if (!normalizedQuoted) {
        continue;
      }

      if (quotedNegation) {
        excludedTextTerms.push(normalizedQuoted);
      } else {
        textTerms.push(normalizedQuoted);
      }
      continue;
    }

    const token = String(plainToken || '').trim();
    if (!token) {
      continue;
    }

    if (token.startsWith('#') && token.length > 1) {
      const parsedTag = normalizeFilterTagToken(token);
      if (parsedTag) {
        tagTerms.push(parsedTag);
      }
      continue;
    }

    if (token.startsWith('-#') && token.length > 2) {
      const parsedExcludedTag = normalizeFilterTagToken(token.slice(1));
      if (parsedExcludedTag) {
        excludedTagTerms.push(parsedExcludedTag);
      }
      continue;
    }

    textTerms.push(token.toLowerCase());
  }

  return {
    textTerms,
    excludedTextTerms,
    tagTerms,
    excludedTagTerms,
    hasAnyTerm: textTerms.length > 0 || excludedTextTerms.length > 0 || tagTerms.length > 0 || excludedTagTerms.length > 0
  };
}
