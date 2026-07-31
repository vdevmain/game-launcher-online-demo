// Core backend/state orchestration (home/settings/detail logic lives in dedicated files).
function handleBackendMessage(msg) {
  try {
    if (msg.notification)
    {
      // Backend sends the NotificationType enum as "Info"/"Warning"/"Error" (PascalCase);
      // showTopNotification expects lowercase to match its CSS classes / auto-hide check.
      showTopNotification(msg.notification.message, String(msg.notification.type ?? 'info').toLowerCase());
    }

    if (Object.prototype.hasOwnProperty.call(msg, 'ok') && !msg.ok) {
      if (state.steamSyncRunning) {
        state.steamSyncRunning = false;
        state.steamSyncCancelRequested = false;
        state.activeJob = null;
        state.activeJobTitle = '';
        state.activeJobOperation = '';
        setSteamSyncButtonState(false);
        setSteamSyncCancelButtonState(false, false);
        hideSteamSyncProgress();
      } else if (state.activeJob) {
        state.activeJob = null;
        state.activeJobTitle = '';
        state.activeJobOperation = '';
        state.activeJobCancelRequested = false;
        hideJobOverlay();
      }

      setStatus(msg.error || 'Unbekannter Fehler', true);
      return;
    }

    if (msg.kind === 'jobStarted' || msg.kind === 'jobProgress' || msg.kind === 'jobCompleted' || msg.kind === 'jobFailed') {
      handleJobMessage(msg);
      return;
    }

    if (msg.kind === 'saveCloudLaunchPreflightCompleted' || msg.kind === 'saveCloudLaunchPreflightFailed') {
      window.GameLaunchController?.handleSaveCloudPreflightMessage(msg);
      return;
    }

    if (msg.data && msg.data.uiViewState) {
      applyUiViewStateFromBackend(msg.data.uiViewState);
      return;
    }

    if (msg.data && msg.data.settings && Array.isArray(msg.data.games)) {
      applyState(msg.data);
      return;
    }

    if (msg.data && msg.data.updatedGame) {
      applyGamePatch(msg.data.updatedGame);
    }

    if (msg.data && msg.data.gameImages) {
      applyGameImagesPatch(msg.data.gameImages);
    }

    if (msg.data && Array.isArray(msg.data.gameCovers)) {
      applyGameCoversPatch(msg.data.gameCovers);
    }

    if (msg.data && (msg.data.updatedGame || msg.data.gameImages || Array.isArray(msg.data.gameCovers))) {
      if (msg.data.imported && msg.data.imported.message) {
        setStatus(msg.data.imported.message);
      }
      return;
    }

    if (msg.data && Object.prototype.hasOwnProperty.call(msg.data, 'cancelRequested')) {
      if (state.activeJobOperation === 'steam-sync') {
        if (msg.data.cancelRequested) {
          state.steamSyncCancelRequested = true;
          setSteamSyncCancelButtonState(true, true);
          setStatus(msg.data.message || 'Abbruch angefordert. Der aktuelle Eintrag wird noch beendet.');
        } else {
          state.steamSyncCancelRequested = false;
          setSteamSyncCancelButtonState(state.steamSyncRunning, false);
          setStatus(msg.data.message || 'Kein laufender Steam-Sync gefunden.');
        }
      } else {
        state.activeJobCancelRequested = !!msg.data.cancelRequested;
        setJobCancelButtonState(!!state.activeJob, state.activeJobCancelRequested);
        setStatus(msg.data.message || (state.activeJobCancelRequested ? 'Abbruch angefordert...' : 'Kein laufender Job gefunden.'));
      }
      return;
    }

    if (msg.data && msg.data.saveSync) {
      setStatus(msg.data.saveSync.message || 'Save-Sync abgeschlossen.');
      return;
    }

    if (window.GameLaunchController && window.GameLaunchController.handleResponse(msg.data)) {
      return;
    }

    if (msg.data && msg.data.queued) {
      setStatus(`${msg.data.title || 'Job'} wird im Hintergrund ausgefuehrt...`);
    }
  } finally {
    console.log('message handled from backend', new Date());
  }
}

window.BackendApi.bindMessageHandler(
  handleBackendMessage,
  () => {
    setStatus(t('status_invalid_response', 'Ungueltige Antwort vom Backend.'), true);
  }
);

function handleJobMessage(msg) {
  if (msg.kind === 'jobStarted') {
    state.activeJob = msg.jobId;
    state.activeJobTitle = msg.title || 'Bitte warten';
    state.activeJobOperation = msg.operation || '';
    state.activeJobCancelRequested = false;

    if (state.activeJobOperation === 'steam-sync') {
      state.steamSyncRunning = true;
      state.steamSyncCancelRequested = false;
      setSteamSyncButtonState(true);
      setSteamSyncCancelButtonState(true, false);
      showSteamSyncProgress(msg.message || 'Steam-Sync gestartet...', 0, 'ETA --');
      setStatus('Steam-Sync laeuft...');
      return;
    }

    showJobOverlay(msg.title || 'Bitte warten', msg.message || 'Operation gestartet...', 0, 0, 'ETA --');
    return;
  }

  if (msg.kind === 'jobProgress') {
    if (state.activeJob && msg.jobId !== state.activeJob) {
      return;
    }

    if (state.activeJobOperation === 'steam-sync') {
      const baseMessage = msg.message || 'Steam-Sync laeuft...';
      const displayMessage = state.steamSyncCancelRequested
        ? `${baseMessage} (Abbruch nach aktuellem Spiel)`
        : baseMessage;

      showSteamSyncProgress(
        displayMessage,
        Number(msg.percent || 0),
        Number.isFinite(Number(msg.etaSeconds)) ? `ETA ${formatSeconds(Number(msg.etaSeconds))}` : 'ETA --'
      );
      return;
    }

    showJobOverlay(
      msg.title || state.activeJobTitle || 'Bitte warten',
      msg.message || 'Operation laeuft...',
      Number(msg.percent || 0),
      Number(msg.elapsedSeconds || 0),
      Number.isFinite(Number(msg.etaSeconds)) ? `ETA ${formatSeconds(Number(msg.etaSeconds))}` : 'ETA --'
    );
    return;
  }

  if (msg.kind === 'jobCompleted') {
    if (state.activeJob && msg.jobId !== state.activeJob) {
      return;
    }

    if (state.activeJobOperation === 'steam-sync') {
      state.steamSyncRunning = false;
      state.steamSyncCancelRequested = false;
      setSteamSyncButtonState(false);
      setSteamSyncCancelButtonState(false, false);
      hideSteamSyncProgress();
      setStatus(msg.message || 'Steam-Sync abgeschlossen.');
      state.activeJob = null;
      state.activeJobTitle = '';
      state.activeJobOperation = '';
      loadState('Aktualisiere Ansicht...');
      return;
    }

    setStatus(msg.message || 'Vorgang abgeschlossen.');
    hideJobOverlay();
    state.activeJob = null;
    state.activeJobTitle = '';
    state.activeJobOperation = '';
    state.activeJobCancelRequested = false;
    if (msg.refresh !== false) {
      loadState('Aktualisiere Ansicht...');
    }
    return;
  }

  if (msg.kind === 'jobFailed') {
    if (state.activeJob && msg.jobId !== state.activeJob) {
      return;
    }

    if (state.activeJobOperation === 'steam-sync') {
      state.steamSyncRunning = false;
      state.steamSyncCancelRequested = false;
      setSteamSyncButtonState(false);
      setSteamSyncCancelButtonState(false, false);
      hideSteamSyncProgress();
      state.activeJob = null;
      state.activeJobTitle = '';
      state.activeJobOperation = '';
      setStatus(msg.error || msg.message || 'Steam-Sync fehlgeschlagen.', true);
      return;
    }

    hideJobOverlay();
    state.activeJob = null;
    state.activeJobTitle = '';
    state.activeJobOperation = '';
    state.activeJobCancelRequested = false;
    setStatus(msg.error || msg.message || 'Job fehlgeschlagen.', true);
  }
}

function loadState(statusText = null) {
  setStatus(statusText || t('status_loading', 'Lade Daten...'));
  window.BackendApi.loadState();
}

function updateExtraGamesFromState() {
  state.extraGames = state.games
    .filter((g) => g.gameType == 'Manual')
    .map((g) => ({ gamePath: g.metadata?.extractedFolder ?? g.gamePath, exists: !g.missing }));
}

function applyState(data) {
  
  state.isLinux = !!data.isLinux;
  state.lastLoadedSettings = createSettingsSnapshot(data.settings);
  applySettingsSnapshot(state.lastLoadedSettings);

  const previousImageCacheById = new Map(
    state.games.map((game) => [
      game.id,
      {
        coverImageDataUrl: game.coverImageDataUrl || null,
        imageDataUrls: Array.isArray(game.imageDataUrls) ? game.imageDataUrls.filter(Boolean) : [],
        coverChecked: !!game.coverChecked,
        imagesLoaded: !!game.imagesLoaded
      }
    ])
  );

  state.games = data.games.map((game) => {
    const previousImageCache = previousImageCacheById.get(game.id) || null;
    const cachedCover = previousImageCache?.coverImageDataUrl || null;
    const cachedImages = previousImageCache?.imageDataUrls || [];

    return {
      ...game,
      gameType: String(game.gameType || '').trim(),
      gamePath: String(game.gamePath || ''),
      status: normalizeStatus(game.status),
      buildStatus: normalizeBuildStatus(game.buildStatus),
      rating: normalizeRating(game.rating),
      playedMinutes: normalizePlayedMinutes(game.playedMinutes),
      isMachineTranslated: !!game.isMachineTranslated,
      saveGamesPath: String(game.saveGamesPath || ''),
      saveGamesFileFilter: String(game.saveGamesFileFilter || ''),
      tags: normalizeTagList(game.tags),
      coverImageDataUrl: cachedCover,
      imageDataUrls: cachedImages,
      coverChecked: previousImageCache ? !!previousImageCache.coverChecked : false,
      coverLoadRequested: false,
      imagesLoaded: previousImageCache ? !!previousImageCache.imagesLoaded : false,
      imageLoadRequested: false
    };
  });
  updateExtraGamesFromState();
  if (typeof renderSettingsGameLists === 'function') {
    renderSettingsGameLists();
  } else {
    renderExtraGamesList();
  }

  if (state.selectedGameId && !state.games.some((g) => g.id === state.selectedGameId)) {
    state.selectedGameId = null;
    state.selectedImageIndex = 0;
    closeModal();
  }

  renderGames();
  ensureUiFiltersStillValid();
  loadAllGameCovers();

  if (!state.games.length) {
    setStatus(t('status_no_games_found', 'Keine Spiele gefunden. Bitte Einstellungen pruefen oder manuelle Spielordner hinzufuegen.'));
  } else {
    setStatus(t('status_games_loaded', '{count} Spiel(e) geladen.', { count: state.games.length }));
  }
}

function normalizePathKey(path) {
  return String(path || '').trim().toLowerCase();
}

function getParentFolderName(path) {
  const source = String(path || '').trim().replace(/[\\/]+$/, '');
  if (!source) {
    return '';
  }

  const match = source.match(/^(.*)[\\/][^\\/]+$/);
  if (!match) {
    return '';
  }

  const parentPath = match[1];
  const parts = parentPath.split(/[\\/]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

function getLeafName(path) {
  const source = String(path || '').trim().replace(/[\\/]+$/, '');
  if (!source) {
    return '';
  }

  const parts = source.split(/[\\/]/);
  return parts[parts.length - 1] || source;
}

window.__launcherApp = {
  setStatus,
  loadState,
  renderGames,
  markGameSessionStarted,
  markGameSessionStopped,
  state,
  getGameById: (gameId) => state.games.find((game) => game.id === gameId) || null
};
