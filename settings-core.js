// Settings business logic.
function saveSettings() {
  setStatus(t('status_settings_saved', 'Speichere Einstellungen...'));
  const selectedCardAspectRatioMode = normalizeCardAspectRatioMode(
    cardAspectRatioModeInput ? cardAspectRatioModeInput.value : state.cardAspectRatioMode
  );
  const selectedCardImageFitMode = normalizeCardImageFitMode(
    cardImageFitModeInput ? cardImageFitModeInput.value : state.cardImageFitMode
  );
  const selectedCardMetaPositionMode = normalizeCardMetaPositionMode(
    cardMetaPositionModeInput ? cardMetaPositionModeInput.value : state.cardMetaPositionMode
  );
  const selectedCardTitlePositionMode = normalizeCardTitlePositionMode(
    cardTitlePositionModeInput ? cardTitlePositionModeInput.value : state.cardTitlePositionMode
  );
  const selectedCardRatingWidthMode = normalizeCardRatingWidthMode(
    cardRatingWidthModeInput ? cardRatingWidthModeInput.value : state.cardRatingWidthMode
  );

  setCardAspectRatioMode(selectedCardAspectRatioMode);
  setCardImageFitMode(selectedCardImageFitMode);
  state.cardMetaPositionMode = selectedCardMetaPositionMode;
  state.cardTitlePositionMode = selectedCardTitlePositionMode;
  state.cardRatingWidthMode = selectedCardRatingWidthMode;

  const normalizedVndbTagSpoilerLevel = normalizeVndbTagSpoilerLevel(
    vndbTagSpoilerLevelInput ? vndbTagSpoilerLevelInput.value : state.vndbTagSpoilerLevel
  );
  const normalizedVndbTagDisplayMode = normalizeVndbTagDisplayMode(
    vndbTagDisplayModeInput ? vndbTagDisplayModeInput.value : state.vndbTagDisplayMode
  );

  window.BackendApi.saveSettings({
    sourceFolder: sourceInput.value.trim(),
    exportFolder: exportInput.value.trim(),
    metadataFolder: metadataInput.value.trim(),
    protonCommand: protonCommandInput ? protonCommandInput.value.trim() : '',
    protonCompatDataRoot: protonCompatDataRootInput ? protonCompatDataRootInput.value.trim() : '',
    useSharedProtonCompatDataRoot: !!(useSharedProtonCompatDataRootInput && useSharedProtonCompatDataRootInput.checked),
    useSteam: !!(enableSteamGamesInput && enableSteamGamesInput.checked),
    steamFolder: steamFolderInput ? steamFolderInput.value.trim() : '',
    enableSaveCloud: !!(enableSaveCloudInput && enableSaveCloudInput.checked),
    saveCloudFolder: saveCloudFolderInput ? saveCloudFolderInput.value.trim() : '',
    useF95Zone: !!state.useF95Zone,
    f95CookieHeader: f95CookieHeaderInput ? f95CookieHeaderInput.value.trim() : '',
    vndbUseContentTags: !!(vndbTagContentInput && vndbTagContentInput.checked),
    vndbUseSexualContentTags: !!(vndbTagSexualInput && vndbTagSexualInput.checked),
    vndbUseTechnicalTags: !!(vndbTagTechnicalInput && vndbTagTechnicalInput.checked),
    vndbTagSpoilerLevel: normalizedVndbTagSpoilerLevel,
    vndbTagDisplayMode: normalizedVndbTagDisplayMode,
    cardAspectRatioMode: selectedCardAspectRatioMode,
    cardImageFitMode: selectedCardImageFitMode,
    cardMetaPositionMode: selectedCardMetaPositionMode,
    cardTitlePositionMode: selectedCardTitlePositionMode,
    cardRatingWidthMode: selectedCardRatingWidthMode,
    language: String(languageSelect?.value || state.language || 'eng').trim().toLowerCase(),
    showCardSourceBadges: !!(showCardSourceBadgesInput && showCardSourceBadgesInput.checked),
    showCardBuildStatus: !!(showCardBuildStatusInput && showCardBuildStatusInput.checked),
    showMissingGameOverlay: !!(showMissingGameOverlayInput && showMissingGameOverlayInput.checked),
    showCardTitle: !!(showCardTitleInput && showCardTitleInput.checked),
    showCardStatus: !!(showCardStatusInput && showCardStatusInput.checked),
    showCardLastPlayed: !!(showCardLastPlayedInput && showCardLastPlayedInput.checked),
    showCardAdded: !!(showCardAddedInput && showCardAddedInput.checked),
    fetchCoversOnImport: !!(fetchCoversOnImportInput && fetchCoversOnImportInput.checked),
    fetchImagesOnImport: !!(fetchImagesOnImportInput && fetchImagesOnImportInput.checked),
    convertImagesToWebp: !!(convertImagesToWebpInput && convertImagesToWebpInput.checked)
  });
}

function normalizeVndbTagSpoilerLevel(rawValue) {
  const numeric = Number.parseInt(String(rawValue ?? '').trim(), 10);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(2, numeric));
}

function normalizeVndbTagDisplayMode(rawValue) {
  const value = String(rawValue || '').trim().toLowerCase();
  return value === 'all' ? 'all' : 'summary';
}

function normalizeCardMetaPositionMode(rawValue) {
  const value = String(rawValue || '').trim().toLowerCase();
  return value === 'image-bottom-overlay' ? 'image-bottom-overlay' : 'below-image';
}

function normalizeCardTitlePositionMode(rawValue) {
  const value = String(rawValue || '').trim().toLowerCase();
  return value === 'image-overlay' ? 'image-overlay' : 'below-image';
}

function normalizeCardRatingWidthMode(rawValue) {
  const value = String(rawValue || '').trim().toLowerCase();
  return value === 'full-width' ? 'full-width' : 'compact';
}

function syncSteamGames() {
  if (state.steamSyncRunning) {
    return;
  }

  if (!state.useSteam) {
    setStatus(t('settings_steam_enable_required', "Aktiviere zuerst 'useSteam' in settings.json und speichere die Einstellungen."), true);
    return;
  }

  state.steamSyncRunning = true;
  state.steamSyncCancelRequested = false;
  setSteamSyncButtonState(true);
  setSteamSyncCancelButtonState(true, false);
  showSteamSyncProgress(
    t('settings_steam_sync_starting', 'Steam-Sync wird gestartet...'),
    0,
    t('settings_steam_sync_eta_pending', 'ETA --')
  );
  setStatus(t('settings_steam_sync_running', 'Synchronisiere Steam-Spiele...'));
  window.BackendApi.syncSteamGames();
}

function cancelSteamSync() {
  if (!state.steamSyncRunning || state.steamSyncCancelRequested) {
    return;
  }

  state.steamSyncCancelRequested = true;
  setSteamSyncCancelButtonState(true, true);
  setStatus(t('settings_steam_sync_cancel_requested', 'Abbruch angefordert. Das aktuelle Spiel wird noch fertig verarbeitet...'));
  window.BackendApi.cancelSteamSync();
}

function getCurrentSettingsSnapshotFromInputs() {
  return {
    sourceFolder: String(sourceInput?.value || '').trim(),
    exportFolder: String(exportInput?.value || '').trim(),
    metadataFolder: String(metadataInput?.value || '').trim(),
    protonCommand: String(protonCommandInput?.value || '').trim(),
    protonCompatDataRoot: String(protonCompatDataRootInput?.value || '').trim(),
    useSharedProtonCompatDataRoot: !!(useSharedProtonCompatDataRootInput && useSharedProtonCompatDataRootInput.checked),
    useSteam: !!(enableSteamGamesInput && enableSteamGamesInput.checked),
    steamFolder: String(steamFolderInput?.value || '').trim(),
    useF95Zone: !!state.useF95Zone,
    f95CookieHeader: String(f95CookieHeaderInput?.value || '').trim(),
    vndbUseContentTags: !!(vndbTagContentInput && vndbTagContentInput.checked),
    vndbUseSexualContentTags: !!(vndbTagSexualInput && vndbTagSexualInput.checked),
    vndbUseTechnicalTags: !!(vndbTagTechnicalInput && vndbTagTechnicalInput.checked),
    vndbTagSpoilerLevel: normalizeVndbTagSpoilerLevel(vndbTagSpoilerLevelInput ? vndbTagSpoilerLevelInput.value : state.vndbTagSpoilerLevel),
    vndbTagDisplayMode: normalizeVndbTagDisplayMode(vndbTagDisplayModeInput ? vndbTagDisplayModeInput.value : state.vndbTagDisplayMode),
    enableSaveCloud: !!(enableSaveCloudInput && enableSaveCloudInput.checked),
    saveCloudFolder: String(saveCloudFolderInput?.value || '').trim(),
    cardAspectRatioMode: normalizeCardAspectRatioMode(cardAspectRatioModeInput ? cardAspectRatioModeInput.value : state.cardAspectRatioMode),
    cardImageFitMode: normalizeCardImageFitMode(cardImageFitModeInput ? cardImageFitModeInput.value : state.cardImageFitMode),
    cardMetaPositionMode: normalizeCardMetaPositionMode(cardMetaPositionModeInput ? cardMetaPositionModeInput.value : state.cardMetaPositionMode),
    cardTitlePositionMode: normalizeCardTitlePositionMode(cardTitlePositionModeInput ? cardTitlePositionModeInput.value : state.cardTitlePositionMode),
    cardRatingWidthMode: normalizeCardRatingWidthMode(cardRatingWidthModeInput ? cardRatingWidthModeInput.value : state.cardRatingWidthMode),
    language: String(languageSelect?.value || state.language || 'eng').trim().toLowerCase(),
    showCardSourceBadges: !!(showCardSourceBadgesInput && showCardSourceBadgesInput.checked),
    showCardBuildStatus: !!(showCardBuildStatusInput && showCardBuildStatusInput.checked),
    showMissingGameOverlay: !!(showMissingGameOverlayInput && showMissingGameOverlayInput.checked),
    showCardTitle: !!(showCardTitleInput && showCardTitleInput.checked),
    showCardStatus: !!(showCardStatusInput && showCardStatusInput.checked),
    showCardLastPlayed: !!(showCardLastPlayedInput && showCardLastPlayedInput.checked),
    showCardAdded: !!(showCardAddedInput && showCardAddedInput.checked),
    fetchCoversOnImport: !!(fetchCoversOnImportInput && fetchCoversOnImportInput.checked),
    fetchImagesOnImport: !!(fetchImagesOnImportInput && fetchImagesOnImportInput.checked),

    convertImagesToWebp: !!(convertImagesToWebpInput && convertImagesToWebpInput.checked)
  };
}

function areSettingsSnapshotsEqual(left, right) {
  if (!left || !right) {
    return false;
  }

  const keys = [
    'sourceFolder',
    'exportFolder',
    'metadataFolder',
    'protonCommand',
    'protonCompatDataRoot',
    'useSharedProtonCompatDataRoot',
    'useSteam',
    'steamFolder',
    'useF95Zone',
    'f95CookieHeader',
    'vndbUseContentTags',
    'vndbUseSexualContentTags',
    'vndbUseTechnicalTags',
    'vndbTagSpoilerLevel',
    'vndbTagDisplayMode',
    'enableSaveCloud',
    'saveCloudFolder',
    'cardAspectRatioMode',
    'cardImageFitMode',
    'cardMetaPositionMode',
    'cardTitlePositionMode',
    'cardRatingWidthMode',
    'language',
    'showCardSourceBadges',
    'showCardBuildStatus',
    'showMissingGameOverlay',
    'showCardTitle',
    'showCardStatus',
    'showCardLastPlayed',
    'showCardAdded',

    'fetchCoversOnImport',
    'fetchImagesOnImport',

    'convertImagesToWebp'
  ];

  for (const key of keys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}

function onSettingsFieldChanged() {
  applySteamSectionState();
  updateSaveButtonVisibility();
}

function createSettingsSnapshot(settings) {
  const raw = settings || {};
  const useSteam = !!(Object.prototype.hasOwnProperty.call(raw, 'useSteam')
    ? raw.useSteam
    : raw.enableSteamGames);

  return {
    sourceFolder: String(raw.sourceFolder || ''),
    exportFolder: String(raw.exportFolder || ''),
    metadataFolder: String(raw.metadataFolder || ''),
    protonCommand: String(raw.protonCommand || ''),
    protonCompatDataRoot: String(raw.protonCompatDataRoot || ''),
    useSharedProtonCompatDataRoot: !!(Object.prototype.hasOwnProperty.call(raw, 'useSharedProtonCompatDataRoot')
      ? raw.useSharedProtonCompatDataRoot
      : raw.UseSharedProtonCompatDataRoot),
    useSteam,
    steamFolder: String(raw.steamFolder || ''),
    useF95Zone: !!raw.useF95Zone,
    f95CookieHeader: String(raw.f95CookieHeader || ''),
    vndbUseContentTags: !Object.prototype.hasOwnProperty.call(raw, 'vndbUseContentTags') || !!raw.vndbUseContentTags,
    vndbUseSexualContentTags: !Object.prototype.hasOwnProperty.call(raw, 'vndbUseSexualContentTags') || !!raw.vndbUseSexualContentTags,
    vndbUseTechnicalTags: !Object.prototype.hasOwnProperty.call(raw, 'vndbUseTechnicalTags') || !!raw.vndbUseTechnicalTags,
    vndbTagSpoilerLevel: normalizeVndbTagSpoilerLevel(raw.vndbTagSpoilerLevel),
    vndbTagDisplayMode: normalizeVndbTagDisplayMode(raw.vndbTagDisplayMode),
    enableSaveCloud: !!raw.enableSaveCloud,
    saveCloudFolder: String(raw.saveCloudFolder || ''),
    cardAspectRatioMode: normalizeCardAspectRatioMode(raw.cardAspectRatioMode),
    cardImageFitMode: normalizeCardImageFitMode(raw.cardImageFitMode),
    cardMetaPositionMode: normalizeCardMetaPositionMode(raw.cardMetaPositionMode),
    cardTitlePositionMode: normalizeCardTitlePositionMode(raw.cardTitlePositionMode),
    cardRatingWidthMode: normalizeCardRatingWidthMode(raw.cardRatingWidthMode),
    language: String(raw.language || 'eng').trim().toLowerCase(),
    showCardSourceBadges: !Object.prototype.hasOwnProperty.call(raw, 'showCardSourceBadges') || !!raw.showCardSourceBadges,
    showCardBuildStatus: !!raw.showCardBuildStatus,
    showMissingGameOverlay: !Object.prototype.hasOwnProperty.call(raw, 'showMissingGameOverlay') || !!raw.showMissingGameOverlay,
    showCardTitle: !Object.prototype.hasOwnProperty.call(raw, 'showCardTitle') || !!raw.showCardTitle,
    showCardStatus: !Object.prototype.hasOwnProperty.call(raw, 'showCardStatus') || !!raw.showCardStatus,
    showCardLastPlayed: !Object.prototype.hasOwnProperty.call(raw, 'showCardLastPlayed') || !!raw.showCardLastPlayed,
    showCardAdded: !Object.prototype.hasOwnProperty.call(raw, 'showCardAdded') || !!raw.showCardAdded,
    
    fetchCoversOnImport: !!raw.fetchCoversOnImport,
    fetchImagesOnImport: !!raw.fetchImagesOnImport,

    convertImagesToWebp: !!raw.convertImagesToWebp
  };
}

function revertUnsavedSettingsChanges() {
  if (!state.lastLoadedSettings) {
    return;
  }

  applySettingsSnapshot(state.lastLoadedSettings);

  if (manualGamePathInput) {
    manualGamePathInput.value = '';
  }

  renderGames();
  setStatus(t('settings_local_changes_discarded', 'Lokale Aenderungen verworfen.'));
}

function addManualGame() {
  if (!manualGamePathInput) {
    return;
  }

  const gamePath = manualGamePathInput.value.trim();
  if (!gamePath) {
    setStatus(t('settings_manual_game_path_required', 'Bitte einen Spielordner eingeben.'), true);
    manualGamePathInput.focus();
    return;
  }

  setStatus(t('settings_manual_game_add_running', 'Fuege manuelles Spiel hinzu...'));
  window.BackendApi.addExtraGame(gamePath);
  manualGamePathInput.value = '';
}

function addArchiveGame() {
  setStatus(t('settings_archive_select_zip', 'Waehle eine ZIP-Datei aus...'));
  window.BackendApi.addArchiveGame();
}

function replaceArchiveForGame(gameId) {
  const game = state.games.find((item) => item.id === gameId);
  if (!game) {
    setStatus(t('settings_game_not_found', 'Spiel wurde nicht gefunden.'), true);
    return;
  }

  if (game.gameType != 'Archive') {
    setStatus(t('settings_archive_only_replace_allowed', 'Nur Archive-Spiele koennen ein neues ZIP erhalten.'), true);
    return;
  }

  setStatus(t('settings_archive_replace_select_zip', 'Waehle neue ZIP-Datei fuer {title} aus...', { title: game.title }));
  window.BackendApi.replaceArchiveForGame(game.id);
}

async function confirmRemoveManualGame(title, gamePath) {
  const displayTitle = String(title || gamePath || '');
  const message = t(
    'detail_remove_game_message',
    'Willst du "{title}" wirklich aus der Liste entfernen?\n\n{path}\n\nHinweis: Dies loescht nicht die Metadaten oder das Spiel selbst.',
    { title: displayTitle, path: gamePath }
  );

  if (window.StandardYesNoDialog && typeof window.StandardYesNoDialog.confirm === 'function') {
    return window.StandardYesNoDialog.confirm({
      title: t('detail_remove_game_title', 'Spiel entfernen?'),
      message,
      yesText: t('settings_remove_extra_yes', 'Ja, entfernen'),
      noText: t('settings_remove_extra_no', 'Nein'),
      yesColorScheme: 'darkred',
      noColorScheme: 'blue'
    });
  }

  return window.confirm(message);
}

async function removeExtraGame(gamePath, title) {
  if (!gamePath) {
    return;
  }

  const confirmed = await confirmRemoveManualGame(title, gamePath);
  if (!confirmed) {
    setStatus(t('settings_remove_extra_cancelled', 'Entfernen abgebrochen.'));
    return;
  }

  setStatus(t('settings_remove_extra_running', 'Entferne manuelles Spiel...'));
  window.BackendApi.removeExtraGame(gamePath);
}

async function removeGameFromDetail(gameId) {
  const game = state.games.find((item) => item.id === gameId);
  if (!game || game.gameType != 'Manual') {
    return;
  }

  const gamePath = String(game.gamePath || '');
  if (!gamePath) {
    return;
  }

  const confirmed = await confirmRemoveManualGame(game.title, gamePath);
  if (!confirmed) {
    setStatus(t('settings_remove_extra_cancelled', 'Entfernen abgebrochen.'));
    return;
  }

  setStatus(t('detail_remove_game_running', 'Entferne {title}...', { title: game.title }));
  if (game.gameType == 'Steam') {
    window.BackendApi.removeSteamGame(gamePath);
  } else {
    window.BackendApi.removeExtraGame(gamePath);
  }

  if (typeof closeModal === 'function') {
    closeModal();
  }
}

  function openEditForGameId(gameId) {
    const game = state.games.find((item) => item.id === gameId);
    if (!game) {
      setStatus(t('settings_open_game_failed', 'Spiel konnte nicht geoeffnet werden.'), true);
      return;
    }

    closeSettingsPanel();
    state.returnToSettingsAfterDetailClose = true;
    state.selectedGameId = game.id;
    state.selectedImageIndex = 0;
    state.detailEditGameId = game.id;
    updateSelectedCardStyles();
    openModalWindow();
    renderDetails(game);
  }

function openEditForExtraGame(gamePath) {
  const key = normalizePathKey(gamePath);
  const game = state.games.find((item) => item.gameType == 'Manual' && normalizePathKey(item.gamePath) === key);
  if (!game) {
    setStatus(t('settings_open_game_failed', 'Spiel konnte nicht geoeffnet werden.'), true);
    return;
  }

    openEditForGameId(game.id);
}