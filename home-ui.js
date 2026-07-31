// Home/overview UI logic.
function isFilterMenuOpen() {
  return !!(filterMenu && !filterMenu.classList.contains('hidden'));
}

function openFilterMenu() {
  if (!filterMenu || !toggleFiltersBtn) {
    return;
  }

  filterMenu.classList.remove('hidden');
  filterMenu.setAttribute('aria-hidden', 'false');
  toggleFiltersBtn.setAttribute('aria-expanded', 'true');
  toggleFiltersBtn.classList.add('active');
}

function closeFilterMenu() {
  if (!filterMenu || !toggleFiltersBtn) {
    return;
  }

  filterMenu.classList.add('hidden');
  filterMenu.setAttribute('aria-hidden', 'true');
  toggleFiltersBtn.setAttribute('aria-expanded', 'false');
  toggleFiltersBtn.classList.remove('active');
}

function toggleFilterMenu() {
  if (isFilterMenuOpen()) {
    closeFilterMenu();
  } else {
    openFilterMenu();
  }
}

function setupFilterGroup(groupElement, selectedSet, parseValue = (value) => value) {
  if (!groupElement) {
    return;
  }

  const checkboxes = Array.from(groupElement.querySelectorAll('input[type="checkbox"]'));
  for (const checkbox of checkboxes) {
    checkbox.checked = selectedSet.has(parseValue(checkbox.value));
    checkbox.addEventListener('change', () => {
      const value = parseValue(checkbox.value);
      if (checkbox.checked) {
        selectedSet.add(value);
      } else {
        selectedSet.delete(value);
      }

      renderGames();
      queuePersistUiViewState();
    });
  }
}

function setupRatingStarFilterGroup() {
  if (!ratingFilterStars) {
    return;
  }

  const buttons = Array.from(ratingFilterStars.querySelectorAll('[data-rating]'));
  for (const button of buttons) {
    const value = Number(button.getAttribute('data-rating'));
    button.classList.toggle('active', state.ratingFilters.has(value));
    button.setAttribute('aria-pressed', state.ratingFilters.has(value) ? 'true' : 'false');

    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.ratingFilters.has(value)) {
        state.ratingFilters.delete(value);
      } else {
        state.ratingFilters.add(value);
      }

      syncFilterMenuControls();
      renderGames();
      queuePersistUiViewState();
    });
  }
}

function syncFilterMenuControls() {
  const syncGroup = (groupElement, selectedSet, parseValue) => {
    if (!groupElement) {
      return;
    }

    const checkboxes = Array.from(groupElement.querySelectorAll('input[type="checkbox"]'));
    for (const checkbox of checkboxes) {
      checkbox.checked = selectedSet.has(parseValue(checkbox.value));
    }
  };

  syncGroup(statusFilterGroup, state.statusFilters, (value) => value);
  syncGroup(installFilterGroup, state.installFilters, (value) => value);
  syncGroup(sourceFilterGroup, state.sourceFilters, (value) => value);
  syncGroup(metaFilterGroup, state.metaFilters, (value) => value);
  syncGroup(buildStatusFilterGroup, state.buildStatusFilters, (value) => normalizeBuildStatus(value));

  if (ratingFilterStars) {
    const ratingButtons = Array.from(ratingFilterStars.querySelectorAll('[data-rating]'));
    for (const button of ratingButtons) {
      const value = Number(button.getAttribute('data-rating'));
      const active = state.ratingFilters.has(value);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }
}

function setupFilterMenu() {
  setupFilterGroup(statusFilterGroup, state.statusFilters, (value) => value);
  setupRatingStarFilterGroup();
  setupFilterGroup(installFilterGroup, state.installFilters, (value) => value);
  setupFilterGroup(sourceFilterGroup, state.sourceFilters, (value) => value);
  setupFilterGroup(metaFilterGroup, state.metaFilters, (value) => value);
  setupFilterGroup(buildStatusFilterGroup, state.buildStatusFilters, (value) => normalizeBuildStatus(value));

  toggleFiltersBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFilterMenu();
  });

  syncFilterMenuControls();
}

function applyCardSizePercent(rawPercent) {
  const percent = Math.max(70, Math.min(200, Number(rawPercent) || 100));
  state.cardSizePercent = percent;

  const minCardWidth = Math.round(240 * (percent / 100));
  const fullWidthStarSize = 40 * (percent / 100);
  document.documentElement.style.setProperty('--game-card-min-width', `${minCardWidth}px`);
  document.documentElement.style.setProperty('--overview-rating-full-star-size', `${fullWidthStarSize}px`);

  if (cardSizeSlider && Number(cardSizeSlider.value) !== percent) {
    cardSizeSlider.value = String(percent);
  }

  if (cardSizeValue) {
    cardSizeValue.textContent = `${percent}%`;
  }

  if (gridEl) {
    gridEl.classList.toggle('card-meta-tiny', percent <= 70);
    gridEl.classList.toggle('card-hide-added-line', percent < 100);
    gridEl.classList.toggle('card-overlay-meta-small', percent <= 80);
    gridEl.classList.toggle('card-overlay-meta-medium', percent > 80 && percent < 110);
  }
}

function isCardMetaOverlayMode() {
  return state.cardMetaPositionMode === 'image-bottom-overlay';
}

function isCardTitleVisible() {
  return !!state.showCardTitle;
}

function isCardTitleOverlayMode() {
  return state.cardTitlePositionMode === 'image-overlay';
}

function isCardRatingFullWidthMode() {
  return state.cardRatingWidthMode === 'full-width';
}

function createSourceBadge(game) {
  if (!state.showCardSourceBadges) {
    return null;
  }

  if (game.gameType == 'Steam') {
    const steamBadge = document.createElement('span');
    steamBadge.className = 'steam-game-badge';
    //steamBadge.src = 'images/steamlogo.png';
    steamBadge.alt = 'Steam';
    steamBadge.title = t('badge_steam_game', 'Steam-Spiel');
    steamBadge.textContent = 'steam';
    return steamBadge;
  }

  if (game.gameType == 'Manual') {
    const manualBadge = document.createElement('span');
    manualBadge.className = 'direct-game-badge';
    manualBadge.textContent = t('badge_manual_text', 'Direkt');
    manualBadge.title = t('badge_manual_added', 'Direkt hinzugefuegt');
    return manualBadge;
  }

  const archiveBadge = document.createElement('span');
  archiveBadge.className = 'archive-game-badge';
  archiveBadge.textContent = t('badge_archive_text', 'Archiv');
  archiveBadge.title = t('badge_archive_game', 'Archiv-Spiel');
  return archiveBadge;
}

function appendRepeatedMissingLabels(band, text, count = 8) {
  for (let i = 0; i < count; i += 1) {
    const label = document.createElement('span');
    label.className = 'missing-game-label';
    label.textContent = text;
    band.appendChild(label);
  }
}

function createMissingGameOverlay(game) {
  if (!game.missing || !state.showMissingGameOverlay) {
    return null;
  }

  const overlay = document.createElement('div');
  overlay.className = 'missing-game-overlay';
  overlay.title = t('badge_missing_game', 'Spiel fehlt');

  const bandA = document.createElement('span');
  bandA.className = 'missing-game-band missing-game-band-a';
  const bandB = document.createElement('span');
  bandB.className = 'missing-game-band missing-game-band-b';

  const labelText = t('badge_missing_game', 'Spiel fehlt');
  appendRepeatedMissingLabels(bandA, labelText);
  appendRepeatedMissingLabels(bandB, labelText);

  overlay.appendChild(bandA);
  overlay.appendChild(bandB);
  return overlay;
}

function createBuildStatusBadge(game) {
  if (!state.showCardBuildStatus) {
    return null;
  }

  const buildStatus = getEffectiveBuildStatus(game);
  const badge = document.createElement('span');
  badge.className = `build-status-badge build-status-${buildStatus}`;
  badge.title = `${getBuildStatusLabel(buildStatus)}`;
  badge.setAttribute('aria-label', `${t('build_status_label', 'Build Status')}: ${getBuildStatusLabel(buildStatus)}`);

  switch (buildStatus) {
    case 'completed':
      badge.textContent = '✓';
      break;
    case 'abandoned':
      badge.textContent = '✕';
      break;
    case 'on-hold':
      badge.textContent = '⏸';
      break;
    default:
      badge.textContent = '🛠️';
      break;
  }

  return badge;
}

// WebView2 sometimes defers compositing newly-set <img src> updates that happen
// outside a direct user gesture (e.g. batched IPC responses) until the next input
// event (mouse move/click), so freshly loaded covers stay invisible until then.
// Nudging two animation frames forces the pending frame to actually be presented.
function requestGridRepaint() {
  document.body.offsetWidth;
}

function applyGameImagesPatch(patch) {
  if (!patch || !patch.gameId) {
    return;
  }

  const game = state.games.find((item) => item.id === patch.gameId);
  if (!game) {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'coverImageDataUrl')) {
    game.coverImageDataUrl = patch.coverImageDataUrl || null;
    game.coverChecked = true;
    game.coverLoadRequested = false;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'imageDataUrls')) {
    game.imageDataUrls = Array.isArray(patch.imageDataUrls) ? patch.imageDataUrls.filter(Boolean) : [];
    game.imagesLoaded = true;
    game.imageLoadRequested = false;
  }
  syncGameCardThumbnail(game);
  requestGridRepaint();

  const selected = getSelectedGame();
  if (selected && selected.id === game.id && gameModal.classList.contains('open')) {
    renderDetails(selected);
  }
}

function applyGameCoversPatch(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return;
  }

  let selectedGameAffected = false;
  const selected = getSelectedGame();

  for (const entry of entries) {
    if (!entry || !entry.gameId) {
      continue;
    }

    const game = state.games.find((item) => item.id === entry.gameId);
    if (!game) {
      continue;
    }

    game.coverImageDataUrl = entry.coverImageDataUrl || null;
    game.coverChecked = true;
    game.coverLoadRequested = false;
    syncGameCardThumbnail(game);

    if (selected && selected.id === game.id) {
      selectedGameAffected = true;
    }
  }

  requestGridRepaint();

  if (selectedGameAffected && gameModal.classList.contains('open')) {
    renderDetails(selected);
  }
}

function renderGames() {
  updateClearFiltersButtonVisibility();
  state.visibleGames = getVisibleGames();
  const visibleGames = state.visibleGames;
  if (typeof renderStatusLine === 'function') {
    renderStatusLine();
  }
  const isDetailOpen = gameModal.classList.contains('open');
  const selectedGameStillExists = !!(state.selectedGameId && state.games.some((g) => g.id === state.selectedGameId));

  if (!visibleGames.length) {
    gridEl.innerHTML = '';

    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = state.games.length
      ? t('card_empty_filtered', 'Keine Spiele passen auf den aktuellen Filter.')
      : t('card_empty_none', 'Noch keine Spiele sichtbar. Lege Archive ab oder fuege einen Spielordner manuell hinzu.');
    gridEl.appendChild(empty);

    if (isDetailOpen && selectedGameStillExists) {
      renderDetails(getSelectedGame());
      return;
    }

    closeModal();
    state.selectedGameId = null;
    state.selectedImageIndex = 0;
    renderDetails(null);
    return;
  }

  if (!state.selectedGameId || !visibleGames.some((g) => g.id === state.selectedGameId)) {
    if (!(isDetailOpen && selectedGameStillExists)) {
      state.selectedGameId = visibleGames[0].id;
      state.selectedImageIndex = 0;
    }
  }

  renderGrid(visibleGames);
  updateSelectedCardStyles();

  if (isDetailOpen) {
    renderDetails(getSelectedGame());
  }
}

function hasActiveFilters() {
  return state.filterText.trim().length > 0 ||
    !isFilterSelectionNeutral(state.statusFilters, ALL_STATUS_FILTERS) ||
    !isFilterSelectionNeutral(state.ratingFilters, ALL_RATING_FILTERS) ||
    !isFilterSelectionNeutral(state.installFilters, ALL_INSTALL_FILTERS) ||
    !isFilterSelectionNeutral(state.sourceFilters, ALL_SOURCE_FILTERS) ||
    !isFilterSelectionNeutral(state.metaFilters, ALL_META_FILTERS) ||
    !isFilterSelectionNeutral(state.buildStatusFilters, ALL_BUILD_STATUS_FILTERS);
}

function updateClearFiltersButtonVisibility() {
  if (!clearFiltersBtn) {
    return;
  }

  clearFiltersBtn.classList.toggle('toolbar-clear-inactive', !hasActiveFilters());
}

function clearFilters() {
  const clearFilterSet = (targetSet) => {
    targetSet.clear();
  };

  state.filterText = '';
  clearFilterSet(state.statusFilters);
  clearFilterSet(state.ratingFilters);
  clearFilterSet(state.installFilters);
  clearFilterSet(state.sourceFilters);
  clearFilterSet(state.metaFilters);
  clearFilterSet(state.buildStatusFilters);

  if (filterInput) {
    filterInput.value = '';
  }
  syncFilterMenuControls();
  closeFilterMenu();

  renderGames();
  queuePersistUiViewState();
}

function renderGrid(visibleGames) {
  gridEl.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (const game of visibleGames) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.gameId = game.id;
    card.dataset.rating = String(normalizeRating(game.rating));
    updateCardRatingClasses(card, normalizeRating(game.rating));
    card.addEventListener('click', () => {
      selectGame(game.id, true);
    });

    const thumb = document.createElement('div');
    thumb.className = 'thumb';

    const hasCompletedBadge = normalizeStatus(game.status) === 'completed';
    const hasCloudBadge = state.enableSaveCloud && String(game.saveGamesPath || '').trim().length > 0;
    if (hasCompletedBadge) {
      const completedCorner = document.createElement('span');
      completedCorner.className = 'completed-game-corner';
        completedCorner.title = t('filter_status_completed', 'Abgeschlossen');

      const completedCheck = document.createElement('span');
      completedCheck.className = 'completed-game-corner-check';
      completedCheck.textContent = '\u2713';

      completedCorner.appendChild(completedCheck);
      thumb.appendChild(completedCorner);
    }

    if (game.isMachineTranslated) {
      const machineTranslatedBadge = document.createElement('span');
      machineTranslatedBadge.className = 'machine-translated-badge';
      if (hasCompletedBadge) {
        machineTranslatedBadge.classList.add('with-completed-corner');
      }
      if (hasCloudBadge) {
        machineTranslatedBadge.classList.add('with-cloud-badge');
      }
      machineTranslatedBadge.textContent = 'MT';
        machineTranslatedBadge.title = t('badge_machine_translated', 'Maschinell uebersetzt');
      thumb.appendChild(machineTranslatedBadge);
    }

    if (hasCloudBadge) {
      const cloudBadge = document.createElement('img');
      cloudBadge.className = 'cloud-game-badge';
      if (hasCompletedBadge) {
        cloudBadge.classList.add('with-completed-corner');
      }
      cloudBadge.src = 'images/cloud.png';
      cloudBadge.alt = 'Save Cloud';
        cloudBadge.title = t('badge_save_cloud_enabled', 'Save Cloud aktiv');
      thumb.appendChild(cloudBadge);
    }

    const sourceBadge = createSourceBadge(game);
    const buildStatusBadge = createBuildStatusBadge(game);
    thumb.classList.toggle('has-build-status-badge', !!buildStatusBadge);
    if (buildStatusBadge) {
      thumb.appendChild(buildStatusBadge);
    }
    if (sourceBadge) {
      thumb.appendChild(sourceBadge);
    }

    const missingOverlay = createMissingGameOverlay(game);
    if (missingOverlay) {
      thumb.appendChild(missingOverlay);
    }

    if (game.coverImageDataUrl) {
      const image = document.createElement('img');
      image.className = 'thumb-cover-image';
      image.alt = `${game.title} Cover`;
      image.src = game.coverImageDataUrl;
      thumb.appendChild(image);
    } else {
      const fallbackLabel = document.createElement('div');
      fallbackLabel.className = 'thumb-fallback';
      fallbackLabel.textContent = game.archiveFile;
      thumb.appendChild(fallbackLabel);
      requestGameCover(game);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = game.title;

    const sub = document.createElement('div');
    sub.className = 'sub';
    if (isCardMetaOverlayMode()) {
      sub.classList.add('card-sub-overlay');
    }
    sub.innerHTML = buildCardSubHtml(game);

    const ratingRow = renderRatingStars(game.rating, true, (value) => {
      updateGameRating(game, value);
    }, 'overview-rating');
    if (isCardRatingFullWidthMode()) {
      ratingRow.classList.add('overview-rating-full-width');
    }

    const useMetaOverlay = isCardMetaOverlayMode();
    const useTitleOverlay = isCardTitleOverlayMode();
    const showTitle = isCardTitleVisible();

    const actions = document.createElement('div');
    actions.className = 'actions';

    const startBtn = document.createElement('button');
    startBtn.className = 'secondary';
    startBtn.textContent = t('action_start', 'Starten');
    startBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (window.GameLaunchController) {
        window.GameLaunchController.triggerLaunch(game);
      }
    });

    if (game.gameType != 'Archive') {
      if (game.missing == false) {
        actions.appendChild(startBtn);
      }
    } else {
      const unpackBtn = document.createElement('button');
      unpackBtn.textContent = t('action_unpack', 'Entpacken');
      unpackBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        setStatus(t('status_unpacking_game', 'Entpacke {title} ...', { title: game.title }));
        window.BackendApi.unpackGame(game.id);
      });

      const packDeleteBtn = document.createElement('button');
      packDeleteBtn.className = 'secondary';
        packDeleteBtn.textContent = t('action_pack_delete', 'Pack/Delete');
      packDeleteBtn.addEventListener('click', async (event) => {
        event.stopPropagation();

        let selection = null;
        if (window.StandardYesNoDialog && typeof window.StandardYesNoDialog.confirm === 'function') {
          selection = await window.StandardYesNoDialog.confirm({
            title: t('packdelete_dialog_title', 'Pack/Delete Aktion'),
            message: t('packdelete_dialog_message', 'Spiel "{title}": Packen und altes Archiv ersetzen\noder nur die entpackte Version loeschen?', { title: game.title }),
            yesText: t('packdelete_dialog_yes', 'Loeschen'),
            noText: t('packdelete_dialog_no', 'Archive ersetzen'),
            yesColorScheme: 'darkred',
            noColorScheme: 'orange',
            showCancel: true,
            cancelText: t('packdelete_dialog_cancel', 'abbrechen'),
            dismissValue: null,
            cancelValue: null
          });
        } else {
          selection = window.confirm(`Spiel "${game.title}": Packen und altes Archiv ersetzen?\n\nOK = Packen + ersetzen + löschen\nAbbrechen = Nur entpackte Version löschen`);
        }

        if (selection === null) {
          setStatus(t('status_action_cancelled', 'Aktion abgebrochen.'));
          return;
        }

        if (selection === true) {
          setStatus(t('status_delete_unpacked', 'Loesche entpackten Ordner fuer {title} ...', { title: game.title }));
          window.BackendApi.deleteUnpackedGame(game.id);
          return;
        }

        setStatus(t('status_packdelete_started', 'Pack/Delete gestartet fuer {title} ...', { title: game.title }));
        window.BackendApi.packDeleteUnpackedGame(game.id);
      });

      if (!game.isUnpacked) {
        actions.appendChild(unpackBtn);
      }

      if (game.isUnpacked) {
        actions.appendChild(packDeleteBtn);
        actions.appendChild(startBtn);
      }
    }

    if (showTitle && !useTitleOverlay) {
      meta.appendChild(title);
    }
    if (!useMetaOverlay) {
      meta.appendChild(sub);
    }
    meta.appendChild(ratingRow);
    meta.appendChild(actions);

    card.appendChild(thumb);
    if (useMetaOverlay && useTitleOverlay && showTitle) {
      const overlayStack = document.createElement('div');
      overlayStack.className = 'card-meta-overlay-stack';
      sub.classList.add('card-sub-overlay-inline');
      title.classList.add('card-title-overlay-inline');
      overlayStack.appendChild(sub);
      overlayStack.appendChild(title);
      thumb.appendChild(overlayStack);
    } else {
      if (useMetaOverlay) {
        thumb.appendChild(sub);
      }

      if (showTitle && useTitleOverlay) {
        title.classList.add('card-title-overlay');
        thumb.appendChild(title);
      }
    }
    card.appendChild(meta);

    fragment.appendChild(card);
  }

  gridEl.appendChild(fragment);
  requestGridRepaint();
}

function syncGameCardThumbnail(game) {
  const card = gridEl.querySelector(`.card[data-game-id="${CSS.escape(game.id)}"]`);
  if (!card) {
    return;
  }

  const thumb = card.querySelector('.thumb');
  if (!thumb) {
    return;
  }

  const existingCoverImage = thumb.querySelector('.thumb-cover-image');
  const existingFallback = thumb.querySelector('.thumb-fallback');
  if (existingCoverImage) {
    existingCoverImage.remove();
  }
  if (existingFallback) {
    existingFallback.remove();
  }

  if (game.coverImageDataUrl) {
    const image = document.createElement('img');
    image.className = 'thumb-cover-image';
    image.alt = `${game.title} Cover`; 
    image.src = game.coverImageDataUrl;
    thumb.appendChild(image);
    return;
  }

  const fallbackLabel = document.createElement('div');
  fallbackLabel.className = 'thumb-fallback';
  fallbackLabel.textContent = game.archiveFile;
  thumb.appendChild(fallbackLabel);
}

function updateSelectedCardStyles() {
  const cards = gridEl.querySelectorAll('.card');
  for (const card of cards) {
    card.classList.toggle('selected', card.dataset.gameId === state.selectedGameId);
  }
}

function buildCardSubHtml(game) {
  const added = formatCardDateForSubline(game.added);
  const lastPlayed = formatCardDateForSubline(game.lastPlayed, t('card_never', 'nie'));
  const playedHours = formatPlayedHours(game.playedMinutes);
  const lines = [];

  if (state.showCardStatus) {
    lines.push(`<span class="sub-line sub-line-status">${escapeHtml(t('card_status', 'Status'))}: ${escapeHtml(getStatusLabel(game.status))}</span>`);
  }

  if (state.showCardAdded) {
    lines.push(`<span class="sub-line sub-line-added">${escapeHtml(t('card_added', 'Hinzugefuegt'))}: ${escapeHtml(added)}</span>`);
  }

  if (state.showCardLastPlayed) {
    if (state.runningSessions && state.runningSessions.has(game.id)) {
      lines.push(`<span class="sub-line sub-line-lastplayed sub-line-running">${escapeHtml(t('card_running', 'Laeuft'))}</span>`);
    } else {
      lines.push(`<span class="sub-line sub-line-lastplayed">${escapeHtml(t('card_last_played', 'Zuletzt gespielt'))}: ${escapeHtml(lastPlayed)}</span>`);
    }
  }

  lines.push(`<span class="sub-line sub-line-played">${escapeHtml(t('card_played', 'Gespielt'))}: ${escapeHtml(playedHours)}</span>`);
  return lines.join('');
}

function formatCardDateForSubline(value, emptyText = '-') {
  if (!value) {
    return emptyText;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return emptyText;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Calendar-based yesterday has priority over raw hour delta.
  if (parsed >= startOfYesterday && parsed < startOfToday) {
    return t('card_yesterday', 'gestern');
  }

  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    if (minutes < 60) {
      return t('card_ago_minutes', 'vor {count} minuten', { count: minutes });
    }

    const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
    return t('card_ago_hours', 'vor {count} stunden', { count: hours });
  }

  return parsed.toLocaleDateString();
}

function setupFilterTagAutocomplete() {
  if (!filterInput || !filterInput.parentElement) {
    return;
  }

  const container = filterInput.parentElement;
  container.classList.add('filter-input-host');

  const suggestionBox = document.createElement('div');
  suggestionBox.className = 'filter-tag-suggestions hidden';
  container.appendChild(suggestionBox);

  let activeSuggestions = [];
  let activeSuggestionIndex = 0;
  let replaceStart = -1;
  let replaceEnd = -1;

  const hideSuggestions = () => {
    suggestionBox.classList.add('hidden');
    suggestionBox.innerHTML = '';
    activeSuggestions = [];
    activeSuggestionIndex = 0;
    replaceStart = -1;
    replaceEnd = -1;
  };

  const setActiveSuggestionIndex = (nextIndex) => {
    if (!activeSuggestions.length) {
      activeSuggestionIndex = 0;
      return;
    }

    const maxIndex = activeSuggestions.length - 1;
    if (nextIndex < 0) {
      activeSuggestionIndex = maxIndex;
    } else if (nextIndex > maxIndex) {
      activeSuggestionIndex = 0;
    } else {
      activeSuggestionIndex = nextIndex;
    }

    const buttons = suggestionBox.querySelectorAll('.filter-tag-suggestion');
    for (let i = 0; i < buttons.length; i += 1) {
      buttons[i].classList.toggle('active', i === activeSuggestionIndex);
    }
  };

  const applySuggestion = (tag) => {
    if (!tag || replaceStart < 0 || replaceEnd < replaceStart) {
      return;
    }

    const value = filterInput.value;
    const before = value.slice(0, replaceStart);
    const afterRaw = value.slice(replaceEnd);
    const after = afterRaw.startsWith(' ') ? afterRaw.trimStart() : afterRaw;

    const filterToken = formatTagForFilter(tag);
    filterInput.value = `${before}#${filterToken} ${after}`;
    const caret = (before + `#${filterToken} `).length;
    filterInput.setSelectionRange(caret, caret);

    state.filterText = filterInput.value.trim();
    renderGames();
    hideSuggestions();
    filterInput.focus();
  };

  const renderSuggestions = () => {
    const value = filterInput.value;
    const caret = filterInput.selectionStart ?? value.length;
    const left = value.slice(0, caret);

    const match = left.match(/(?:^|\s)(#[^\s]*)$/);
    if (!match) {
      hideSuggestions();
      return;
    }

    const token = match[1] || '';
    if (!token.startsWith('#')) {
      hideSuggestions();
      return;
    }

    const tokenStart = left.length - token.length;
    const tokenEnd = caret;
    const query = normalizeFilterTagToken(token);
    const suggestions = getBestTagSuggestions(query, [], 8);
    if (!suggestions.length) {
      hideSuggestions();
      return;
    }

    replaceStart = tokenStart;
    replaceEnd = tokenEnd;
    activeSuggestions = suggestions;
    activeSuggestionIndex = 0;
    suggestionBox.innerHTML = '';

    for (let i = 0; i < suggestions.length; i += 1) {
      const tag = suggestions[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-tag-suggestion';
      btn.classList.toggle('active', i === 0);
      btn.textContent = `#${formatTagForFilter(tag)}`;
      btn.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });
      btn.addEventListener('mouseenter', () => {
        setActiveSuggestionIndex(i);
      });
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        applySuggestion(tag);
      });
      suggestionBox.appendChild(btn);
    }

    suggestionBox.classList.remove('hidden');
  };

  filterInput.addEventListener('input', () => {
    renderSuggestions();
  });

  filterInput.addEventListener('focus', () => {
    renderSuggestions();
  });

  filterInput.addEventListener('click', () => {
    renderSuggestions();
  });

  filterInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && activeSuggestions.length) {
      event.preventDefault();
      applySuggestion(activeSuggestions[activeSuggestionIndex] || activeSuggestions[0]);
      return;
    }

    if (event.key === 'ArrowDown') {
      if (!activeSuggestions.length) {
        renderSuggestions();
      }

      if (activeSuggestions.length) {
        event.preventDefault();
        setActiveSuggestionIndex(activeSuggestionIndex + 1);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!activeSuggestions.length) {
        renderSuggestions();
      }

      if (activeSuggestions.length) {
        event.preventDefault();
        setActiveSuggestionIndex(activeSuggestionIndex - 1);
      }
      return;
    }

    if (event.key === 'Escape') {
      hideSuggestions();
    }
  });

  filterInput.addEventListener('blur', () => {
    window.setTimeout(() => {
      hideSuggestions();
    }, 120);
  });
}

function syncGameCardContent(game) {
  const card = gridEl.querySelector(`.card[data-game-id="${CSS.escape(game.id)}"]`);
  if (!card) {
    return;
  }

  const title = card.querySelector('.title');
  if (title) {
    title.textContent = game.title;
  }

  const sub = card.querySelector('.sub');
  if (sub) {
    sub.innerHTML = buildCardSubHtml(game);
  }

  const thumb = card.querySelector('.thumb');
  if (thumb) {
    const existingBadge = thumb.querySelector('.machine-translated-badge');
    if (game.isMachineTranslated && !existingBadge) {
      const badge = document.createElement('span');
      badge.className = 'machine-translated-badge';
      badge.textContent = 'MT';
      badge.title = t('badge_machine_translated', 'Maschinell uebersetzt');
      thumb.appendChild(badge);
    }

    if (!game.isMachineTranslated && existingBadge) {
      existingBadge.remove();
    }

    thumb.querySelector('.direct-game-badge')?.remove();
    thumb.querySelector('.steam-game-badge')?.remove();
    thumb.querySelector('.archive-game-badge')?.remove();
    thumb.querySelector('.build-status-badge')?.remove();

    const sourceBadge = createSourceBadge(game);
    const buildStatusBadge = createBuildStatusBadge(game);
    thumb.classList.toggle('has-build-status-badge', !!buildStatusBadge);
    if (buildStatusBadge) {
      thumb.appendChild(buildStatusBadge);
    }
    if (sourceBadge) {
      thumb.appendChild(sourceBadge);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
