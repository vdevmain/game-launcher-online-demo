// Settings UI functions.
function updateSaveButtonVisibility() {
  const saveBtn = document.getElementById('saveBtn');
  if (!saveBtn) {
    return;
  }

  const baseline = state.lastLoadedSettings;
  const current = getCurrentSettingsSnapshotFromInputs();
  state.settingsDirty = !baseline || !areSettingsSnapshotsEqual(current, baseline);
  saveBtn.classList.toggle('hidden', !state.settingsDirty);
}

function applySteamSectionState() {
  const steamEnabled = !!(enableSteamGamesInput && enableSteamGamesInput.checked);
  state.useSteam = steamEnabled;

  if (steamFolderInput) {
    steamFolderInput.disabled = !steamEnabled;
  }

  steamSourceFilterOption?.classList.toggle('hidden', !steamEnabled);

  if (syncSteamGamesBtn) {
    syncSteamGamesBtn.disabled = !steamEnabled || state.steamSyncRunning;
    syncSteamGamesBtn.classList.remove('hidden');
  }

  if (!steamEnabled && !state.steamSyncRunning) {
    setSteamSyncCancelButtonState(false, false);
    hideSteamSyncProgress();
  } else {
    setSteamSyncCancelButtonState(state.steamSyncRunning, state.steamSyncCancelRequested);
    if (steamSyncProgress) {
      steamSyncProgress.classList.toggle('hidden', !state.steamSyncRunning);
    }
  }
}

function applyConvertImagesToWebpVisibility() {
  migrationWebpAction?.classList.toggle('hidden', !state.convertImagesToWebp);
}

function applyF95ZoneTabVisibility() {
  if (!settingsPage) {
    return;
  }

  const f95TabButton = settingsPage.querySelector('.settings-tab-btn[data-tab="f95zone"]');
  const f95TabPanel = settingsPage.querySelector('.settings-tab-panel[data-tab="f95zone"]');
  const isVisible = !!state.useF95Zone;

  f95TabButton?.classList.toggle('hidden', !isVisible);
  f95TabPanel?.classList.toggle('hidden', !isVisible);

  if (!isVisible) {
    f95TabPanel?.classList.remove('active');
    f95TabPanel?.setAttribute('aria-hidden', 'true');
  }
}

function applySettingsSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  state.useSteam = !!snapshot.useSteam;
  state.useF95Zone = !!snapshot.useF95Zone;
  state.vndbUseContentTags = !Object.prototype.hasOwnProperty.call(snapshot, 'vndbUseContentTags') || !!snapshot.vndbUseContentTags;
  state.vndbUseSexualContentTags = !Object.prototype.hasOwnProperty.call(snapshot, 'vndbUseSexualContentTags') || !!snapshot.vndbUseSexualContentTags;
  state.vndbUseTechnicalTags = !Object.prototype.hasOwnProperty.call(snapshot, 'vndbUseTechnicalTags') || !!snapshot.vndbUseTechnicalTags;
  state.vndbTagSpoilerLevel = normalizeVndbTagSpoilerLevel(snapshot.vndbTagSpoilerLevel);
  state.vndbTagDisplayMode = normalizeVndbTagDisplayMode(snapshot.vndbTagDisplayMode);
  state.enableSaveCloud = !!snapshot.enableSaveCloud;
  state.saveCloudFolder = String(snapshot.saveCloudFolder || '');
  state.language = String(snapshot.language || state.language || 'eng').trim().toLowerCase();
  state.cardMetaPositionMode = normalizeCardMetaPositionMode(snapshot.cardMetaPositionMode);
  state.cardTitlePositionMode = normalizeCardTitlePositionMode(snapshot.cardTitlePositionMode);
  state.cardRatingWidthMode = normalizeCardRatingWidthMode(snapshot.cardRatingWidthMode);
  state.showCardSourceBadges = !Object.prototype.hasOwnProperty.call(snapshot, 'showCardSourceBadges') || !!snapshot.showCardSourceBadges;
  state.showCardBuildStatus = !!snapshot.showCardBuildStatus;
  state.showMissingGameOverlay = !Object.prototype.hasOwnProperty.call(snapshot, 'showMissingGameOverlay') || !!snapshot.showMissingGameOverlay;
  state.showCardTitle = !Object.prototype.hasOwnProperty.call(snapshot, 'showCardTitle') || !!snapshot.showCardTitle;
  state.showCardStatus = !Object.prototype.hasOwnProperty.call(snapshot, 'showCardStatus') || !!snapshot.showCardStatus;
  state.showCardLastPlayed = !Object.prototype.hasOwnProperty.call(snapshot, 'showCardLastPlayed') || !!snapshot.showCardLastPlayed;
  state.showCardAdded = !Object.prototype.hasOwnProperty.call(snapshot, 'showCardAdded') || !!snapshot.showCardAdded;
  state.convertImagesToWebp = !!snapshot.convertImagesToWebp;

  state.fetchCoversOnImport = !!snapshot.fetchCoversOnImport;
  state.fetchImagesOnImport = !!snapshot.fetchImagesOnImport;

  sourceInput.value = snapshot.sourceFolder || '';
  exportInput.value = snapshot.exportFolder || '';
  metadataInput.value = snapshot.metadataFolder || '';

  if (protonCommandInput) {
    protonCommandInput.value = snapshot.protonCommand || '';
  }

  if (protonCompatDataRootInput) {
    protonCompatDataRootInput.value = snapshot.protonCompatDataRoot || '';
  }

  if (useSharedProtonCompatDataRootInput) {
    useSharedProtonCompatDataRootInput.checked = !!snapshot.useSharedProtonCompatDataRoot;
  }

  if (enableSteamGamesInput) {
    enableSteamGamesInput.checked = state.useSteam;
  }

  if (steamFolderInput) {
    steamFolderInput.value = snapshot.steamFolder || '';
  }

  if (enableSaveCloudInput) {
    enableSaveCloudInput.checked = state.enableSaveCloud;
  }

  if (saveCloudFolderInput) {
    saveCloudFolderInput.value = state.saveCloudFolder;
  }

  if (languageSelect) {
    languageSelect.value = resolveLanguageCode(state.language);
  }
  applyLanguage(state.language);

  if (cardMetaPositionModeInput) {
    cardMetaPositionModeInput.value = state.cardMetaPositionMode;
  }

  if (cardTitlePositionModeInput) {
    cardTitlePositionModeInput.value = state.cardTitlePositionMode;
  }

  if (cardRatingWidthModeInput) {
    cardRatingWidthModeInput.value = state.cardRatingWidthMode;
  }

  if (showCardSourceBadgesInput) {
    showCardSourceBadgesInput.checked = !!state.showCardSourceBadges;
  }

  if (showCardBuildStatusInput) {
    showCardBuildStatusInput.checked = !!state.showCardBuildStatus;
  }

  if (showMissingGameOverlayInput) {
    showMissingGameOverlayInput.checked = !!state.showMissingGameOverlay;
  }

  if (showCardTitleInput) {
    showCardTitleInput.checked = !!state.showCardTitle;
  }

  if (showCardStatusInput) {
    showCardStatusInput.checked = !!state.showCardStatus;
  }

  if (showCardLastPlayedInput) {
    showCardLastPlayedInput.checked = !!state.showCardLastPlayed;
  }

  if (showCardAddedInput) {
    showCardAddedInput.checked = !!state.showCardAdded;
  }
  if (fetchCoversOnImportInput) {
    fetchCoversOnImportInput.checked = !!state.fetchCoversOnImport;
  }
  if (fetchImagesOnImportInput) {
    fetchImagesOnImportInput.checked = !!state.fetchImagesOnImport;
  }

  if (convertImagesToWebpInput) {
    convertImagesToWebpInput.checked = !!state.convertImagesToWebp;
  }

  applyConvertImagesToWebpVisibility();

  if (f95CookieHeaderInput) {
    f95CookieHeaderInput.value = snapshot.f95CookieHeader || '';
  }

  if (vndbTagContentInput) {
    vndbTagContentInput.checked = !!state.vndbUseContentTags;
  }

  if (vndbTagSexualInput) {
    vndbTagSexualInput.checked = !!state.vndbUseSexualContentTags;
  }

  if (vndbTagTechnicalInput) {
    vndbTagTechnicalInput.checked = !!state.vndbUseTechnicalTags;
  }

  if (vndbTagSpoilerLevelInput) {
    vndbTagSpoilerLevelInput.value = String(state.vndbTagSpoilerLevel);
  }

  if (vndbTagDisplayModeInput) {
    vndbTagDisplayModeInput.value = normalizeVndbTagDisplayMode(state.vndbTagDisplayMode);
  }

  if (!state.useSteam) {
    state.sourceFilters.delete('steam');
  }

  applyF95ZoneTabVisibility();

  const configuredCardAspectRatioMode = normalizeCardAspectRatioMode(snapshot.cardAspectRatioMode);
  if (cardAspectRatioModeInput) {
    cardAspectRatioModeInput.value = configuredCardAspectRatioMode;
  }
  setCardAspectRatioMode(configuredCardAspectRatioMode);

  const configuredCardImageFitMode = normalizeCardImageFitMode(snapshot.cardImageFitMode);
  if (cardImageFitModeInput) {
    cardImageFitModeInput.value = configuredCardImageFitMode;
  }
  setCardImageFitMode(configuredCardImageFitMode);

  if (syncSteamGamesBtn && !state.steamSyncRunning) {
    syncSteamGamesBtn.textContent = t('settings_sync_steam', 'Sync Steam Spiele');
  }

  if (!state.steamSyncRunning) {
    state.steamSyncCancelRequested = false;
  }

  applySteamSectionState();
  renderGames();
  updateSaveButtonVisibility();
}

function renderSettingsGameLists() {
  renderExtraGamesList();
  renderArchiveGamesList();
}

function renderGroupedGameList(config) {
  const container = config?.container;
  if (!container) {
    return;
  }

  const items = Array.isArray(config?.items) ? config.items : [];
  const groupBy = typeof config?.groupBy === 'function' ? config.groupBy : () => t('settings_group_entries', 'Eintraege');
  const openGroupsStateKey = String(config?.openGroupsStateKey || 'extraGamesOpenGroups');
  const emptyText = String(config?.emptyText || t('settings_group_empty', 'Keine Eintraege vorhanden.'));
  const sortItems = typeof config?.sortItems === 'function' ? config.sortItems : null;
  const getTitle = typeof config?.getTitle === 'function' ? config.getTitle : () => t('settings_group_entry', 'Eintrag');
  const getPath = typeof config?.getPath === 'function' ? config.getPath : () => '';
  const getCoverUrl = typeof config?.getCoverUrl === 'function' ? config.getCoverUrl : () => '';
  const getMissingText = typeof config?.getMissingText === 'function' ? config.getMissingText : () => '';
  const actions = Array.isArray(config?.actions) ? config.actions : [];

  container.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'extra-game-item';
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  const grouped = new Map();
  for (const item of items) {
    const groupPath = String(groupBy(item) || t('settings_group_no_group', 'Ohne Gruppe'));
    if (!grouped.has(groupPath)) {
      grouped.set(groupPath, []);
    }
    grouped.get(groupPath).push(item);
  }

  if (!(state[openGroupsStateKey] instanceof Set)) {
    state[openGroupsStateKey] = new Set();
  }

  state[openGroupsStateKey] = new Set(
    Array.from(state[openGroupsStateKey]).filter((groupPath) => grouped.has(groupPath))
  );

  const groupKeys = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
  groupKeys.forEach((groupPath) => {
    const details = document.createElement('details');
    details.className = 'extra-game-group';
    details.open = state[openGroupsStateKey].has(groupPath);
    details.addEventListener('toggle', () => {
      if (details.open) {
        state[openGroupsStateKey].add(groupPath);
      } else {
        state[openGroupsStateKey].delete(groupPath);
      }
    });

    const summary = document.createElement('summary');
    summary.className = 'extra-game-group-summary';

    const icon = document.createElement('span');
    icon.className = 'extra-game-group-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▸';

    const label = document.createElement('span');
    label.className = 'extra-game-group-label';
    label.textContent = `${groupPath} (${grouped.get(groupPath).length})`;

    summary.appendChild(icon);
    summary.appendChild(label);
    details.appendChild(summary);

    const list = document.createElement('div');
    list.className = 'extra-game-group-list';

    const groupedItems = sortItems ? sortItems(grouped.get(groupPath), groupPath) : grouped.get(groupPath);
    groupedItems.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'extra-game-item';

      const top = document.createElement('div');
      top.className = 'extra-game-top';

      const left = document.createElement('div');
      left.className = 'extra-game-head';

      const coverUrl = String(getCoverUrl(item) || '').trim();
      if (coverUrl) {
        const cover = document.createElement('img');
        cover.className = 'extra-game-cover';
        cover.src = coverUrl;
        cover.alt = `${getTitle(item)} ${t('settings_cover_label', 'Cover')}`;
        left.appendChild(cover);
      }

      const labels = document.createElement('div');
      labels.className = 'extra-game-labels';

      const title = document.createElement('div');
      title.className = 'extra-game-title';
      title.textContent = getTitle(item);
      labels.appendChild(title);

      const pathValue = String(getPath(item) || '').trim();
      if (pathValue) {
        const path = document.createElement('div');
        path.className = 'extra-game-path';
        path.textContent = pathValue;
        labels.appendChild(path);
      }

      left.appendChild(labels);
      top.appendChild(left);

      if (actions.length) {
        const actionWrap = document.createElement('div');
        actionWrap.className = 'extra-game-actions';
        actions.forEach((actionBuilder) => {
          const button = actionBuilder(item);
          if (button instanceof HTMLElement) {
            actionWrap.appendChild(button);
          }
        });
        top.appendChild(actionWrap);
      }

      row.appendChild(top);

      const missingText = String(getMissingText(item) || '').trim();
      if (missingText) {
        const missing = document.createElement('div');
        missing.className = 'extra-game-missing';
        missing.textContent = missingText;
        row.appendChild(missing);
      }

      list.appendChild(row);
    });

    details.appendChild(list);
    container.appendChild(details);
  });
}

function renderExtraGamesList() {
  const manualByPath = new Map(
    state.games
      .filter((game) => game.gameType == 'Manual' && game.gamePath)
      .map((game) => [normalizePathKey(game.gamePath), game])
  );

  renderGroupedGameList({
    container: extraGamesList,
    items: state.extraGames,
    openGroupsStateKey: 'extraGamesOpenGroups',
    emptyText: t('settings_extra_empty', 'Noch keine manuell hinzugefuegten Spiele.'),
    groupBy: (item) => getParentFolderName(item.gamePath) || t('settings_extra_no_parent', 'Ohne Ueberordner'),
    sortItems: (items) => items.slice().sort((a, b) => a.gamePath.localeCompare(b.gamePath)),
    getTitle: (item) => {
      const manualGame = manualByPath.get(normalizePathKey(item.gamePath));
      return manualGame?.title || getLeafName(item.gamePath) || t('settings_extra_game_folder', 'Spielordner');
    },
    getPath: (item) => item.gamePath,
    getCoverUrl: (item) => {
      const manualGame = manualByPath.get(normalizePathKey(item.gamePath));
      return manualGame?.coverImageDataUrl || '';
    },
    getMissingText: (item) => (item.exists ? '' : t('settings_extra_folder_unavailable', 'Ordner derzeit nicht verfuegbar')),
    actions: [
      (item) => {
        const manualGame = manualByPath.get(normalizePathKey(item.gamePath));
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'secondary extra-game-edit';
        editBtn.textContent = t('settings_action_edit', 'Bearbeiten');
        editBtn.disabled = !manualGame;
        editBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          openEditForExtraGame(item.gamePath);
        });
        return editBtn;
      },
      (item) => {
        const manualGame = manualByPath.get(normalizePathKey(item.gamePath));
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'secondary extra-game-remove';
        removeBtn.textContent = t('settings_action_remove', 'Entfernen');
        removeBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          removeExtraGame(item.gamePath, manualGame?.title);
        });
        return removeBtn;
      }
    ]
  });
}

function renderArchiveGamesList() {
  const archiveGames = state.games
    .filter((game) => game.gameType == 'Archive')
    .map((game) => ({
      id: game.id,
      title: String(game.title || ''),
      archiveFile: String(game.archiveFile || ''),
      coverImageDataUrl: String(game.coverImageDataUrl || '')
    }));

  renderGroupedGameList({
    container: archiveGamesList,
    items: archiveGames,
    openGroupsStateKey: 'archiveGamesOpenGroups',
    emptyText: t('settings_archive_empty', 'Noch keine Archive-Spiele gefunden.'),
    groupBy: (item) => getParentFolderName(item.archiveFile) || t('settings_archive_group_name', 'Archive'),
    sortItems: (items) => items.slice().sort((a, b) => a.title.localeCompare(b.title)),
    getTitle: (item) => item.title || getLeafName(item.archiveFile) || t('settings_archive_game', 'Archiv-Spiel'),
    getPath: (item) => item.archiveFile,
    getCoverUrl: (item) => item.coverImageDataUrl,
    getMissingText: () => '',
    actions: [
      (item) => {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'secondary extra-game-edit';
        editBtn.textContent = t('settings_action_edit', 'Bearbeiten');
        editBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          openEditForGameId(item.id);
        });
        return editBtn;
      }
    ]
  });
}

function showSteamSyncProgress(message, percent, etaText) {
  if (!steamSyncProgress) {
    return;
  }

  const clampedPercent = Math.max(0, Math.min(100, Number(percent) || 0));
  steamSyncProgress.classList.remove('hidden');
  steamSyncProgress.setAttribute('aria-hidden', 'false');

  if (steamSyncProgressBar) {
    steamSyncProgressBar.style.width = `${clampedPercent}%`;
  }

  if (steamSyncProgressPercent) {
    steamSyncProgressPercent.textContent = `${clampedPercent}%`;
  }

  if (steamSyncProgressMessage) {
    steamSyncProgressMessage.textContent = message || t('settings_sync_running', 'Steam-Sync laeuft...');
  }

  if (steamSyncProgressEta) {
    steamSyncProgressEta.textContent = etaText || t('settings_sync_eta_unknown', 'ETA --');
  }
}

function hideSteamSyncProgress() {
  if (!steamSyncProgress) {
    return;
  }

  steamSyncProgress.classList.add('hidden');
  steamSyncProgress.setAttribute('aria-hidden', 'true');

  if (steamSyncProgressBar) {
    steamSyncProgressBar.style.width = '0%';
  }

  if (steamSyncProgressPercent) {
    steamSyncProgressPercent.textContent = '';
  }

  if (steamSyncProgressMessage) {
    steamSyncProgressMessage.textContent = '';
  }

  if (steamSyncProgressEta) {
    steamSyncProgressEta.textContent = '';
  }
}

function setSteamSyncButtonState(isRunning) {
  if (!syncSteamGamesBtn) {
    return;
  }

  syncSteamGamesBtn.classList.toggle('hidden', !state.useSteam);
  syncSteamGamesBtn.disabled = !!isRunning;
  syncSteamGamesBtn.textContent = isRunning
    ? t('settings_sync_running', 'Steam-Sync laeuft...')
    : t('settings_sync_steam', 'Sync Steam Spiele');
}

function setSteamSyncCancelButtonState(isRunning, cancelRequested) {
  if (!cancelSteamSyncBtn) {
    return;
  }

  cancelSteamSyncBtn.classList.toggle('hidden', !state.useSteam || !isRunning);
  cancelSteamSyncBtn.disabled = !isRunning || !!cancelRequested;
  cancelSteamSyncBtn.textContent = cancelRequested
    ? t('settings_sync_cancel_requested', 'Abbruch angefordert...')
    : t('settings_cancel_steam_sync', 'Steam-Sync abbrechen');
}

function setActiveSettingsTab(tabKey) {
  if (!settingsPage) {
    return;
  }

  const tabButtons = Array.from(settingsPage.querySelectorAll('.settings-tab-btn'));
  const visibleTabButtons = tabButtons.filter((button) => !button.classList.contains('hidden'));
  const tabPanels = Array.from(settingsPage.querySelectorAll('.settings-tab-panel'));
  const visibleTabPanels = tabPanels.filter((panel) => !panel.classList.contains('hidden'));
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  const hasTarget = visibleTabButtons.some((button) => button.dataset.tab === tabKey);
  const resolvedTabKey = hasTarget
    ? tabKey
    : String((visibleTabButtons[0] || tabButtons[0]).dataset.tab || 'general');

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === resolvedTabKey;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isHidden = panel.classList.contains('hidden');
    const isActive = !isHidden && panel.dataset.tab === resolvedTabKey;
    panel.classList.toggle('active', isActive);
    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  visibleTabPanels.forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
  });
}

function initializeSettingsTabs() {
  if (!settingsPage) {
    return;
  }

  const tabButtons = Array.from(settingsPage.querySelectorAll('.settings-tab-btn'));
  if (!tabButtons.length) {
    return;
  }

  tabButtons.forEach((button) => {
    if (button.dataset.tabInitialized === 'true') {
      return;
    }

    button.dataset.tabInitialized = 'true';
    button.addEventListener('click', () => {
      setActiveSettingsTab(button.dataset.tab);
    });

    button.addEventListener('keydown', (event) => {
      const visibleButtons = tabButtons.filter((item) => !item.classList.contains('hidden'));
      const currentIndex = visibleButtons.indexOf(button);
      if (currentIndex < 0) {
        return;
      }

      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % visibleButtons.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + visibleButtons.length) % visibleButtons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = visibleButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextButton = visibleButtons[nextIndex];
      setActiveSettingsTab(nextButton.dataset.tab);
      nextButton.focus();
    });
  });

  applyF95ZoneTabVisibility();
  const visibleButtons = tabButtons.filter((button) => !button.classList.contains('hidden'));
  const initiallySelected = visibleButtons.find((button) => button.getAttribute('aria-selected') === 'true');
  setActiveSettingsTab(initiallySelected?.dataset.tab || visibleButtons[0]?.dataset.tab || tabButtons[0].dataset.tab);
}

function toggleSettingsPanel() {
  if (!settingsPage) {
    return;
  }

  if (settingsPage.classList.contains('open')) {
    closeSettingsPanel();
  } else {
    openSettingsPanel();
    renderSettingsGameLists();
  }
}

function openSettingsPanel() {
  if (!settingsPage) {
    return;
  }

  initializeSettingsTabs();
  settingsPage.classList.add('open');
  settingsPage.setAttribute('aria-hidden', 'false');
  document.body.classList.add('settings-page-open');
  toggleSettingsBtn.setAttribute('aria-expanded', 'true');
}

function closeSettingsPanel() {
  if (!settingsPage) {
    return;
  }

  if (typeof revertUnsavedSettingsChanges === 'function') {
    revertUnsavedSettingsChanges();
  }

  settingsPage.classList.remove('open');
  settingsPage.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('settings-page-open');
  toggleSettingsBtn.setAttribute('aria-expanded', 'false');
}