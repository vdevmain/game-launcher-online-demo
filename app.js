class LauncherAppBootstrap {
  constructor(doc) {
    this.doc = doc;
  }

  bindStickyHeaderEffects() {
    const applyStickyHeaderProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const progress = Math.max(0, Math.min(1, scrollTop / 56));
      document.documentElement.style.setProperty('--sticky-header-progress', progress.toFixed(3));
      document.body.classList.toggle('sticky-header-active', scrollTop > 1);
    };

    let stickyHeaderRafPending = false;
    const scheduleStickyHeaderProgress = () => {
      if (stickyHeaderRafPending) {
        return;
      }
      stickyHeaderRafPending = true;
      window.requestAnimationFrame(() => {
        stickyHeaderRafPending = false;
        applyStickyHeaderProgress();
      });
    };

    window.addEventListener('scroll', scheduleStickyHeaderProgress, { passive: true });
    applyStickyHeaderProgress();
  }

  bindPrimaryActions() {
    this.doc.getElementById('saveBtn').addEventListener('click', saveSettings);
    this.doc.getElementById('refreshBtn').addEventListener('click', async () => {
      setStatus(t('settings_status_refreshing', 'Fuehre komplettes Neuladen durch...'));
      const result = await window.BackendApi.callAsync('refresh', {});
      if (result.ok && typeof reloadAllGameImages === 'function') {
        reloadAllGameImages();
      }
    });
  }

  bindSettingsActions() {
    toggleSettingsBtn?.addEventListener('click', toggleSettingsPanel);
    closeSettingsBtn?.addEventListener('click', closeSettingsPanel);
    settingsBackdrop?.addEventListener('click', closeSettingsPanel);

    addManualGameBtn?.addEventListener('click', addManualGame);
    addArchiveGameBtn?.addEventListener('click', addArchiveGame);
    syncSteamGamesBtn?.addEventListener('click', syncSteamGames);
    cancelSteamSyncBtn?.addEventListener('click', cancelSteamSync);
    convertImagesToWebpBtn?.addEventListener('click', () => {
      setStatus(t('settings_migration_webp_running', 'Konvertiere Bilder zu WebP...'));
      window.BackendApi.convertImagesToWebp();
    });
    checkSaveGamePathsBtn?.addEventListener('click', () => {
      setStatus(t('settings_migration_save_paths_running', 'Pruefe Save-Datei-Pfade...'));
      window.BackendApi.checkSaveGamePaths();
    });
    loadAllMetadataFromUrlBtn?.addEventListener('click', () => {
      setStatus(t('settings_migration_metadata_running', 'Lade Metadaten von URL neu...'));
      window.BackendApi.loadAllMetadataFromUrl();
    });
    jobCancelBtn?.addEventListener('click', () => {
      if (!state.activeJob || state.activeJobCancelRequested) {
        return;
      }
      state.activeJobCancelRequested = true;
      setJobCancelButtonState(true, true);
      window.BackendApi.cancelJob(state.activeJob);
    });
    syncAllSaveGamesBtn?.addEventListener('click', () => {
      setStatus(t('status_syncing_all_saves', 'Synchronisiere Save-Games...'));
      window.BackendApi.syncAllGameSaves();
    });
    cardAspectRatioModeInput?.addEventListener('change', () => {
      setCardAspectRatioMode(cardAspectRatioModeInput.value);
      renderGames();
      onSettingsFieldChanged();
    });
    cardImageFitModeInput?.addEventListener('change', () => {
      setCardImageFitMode(cardImageFitModeInput.value);
      renderGames();
      onSettingsFieldChanged();
    });
    cardMetaPositionModeInput?.addEventListener('change', () => {
      state.cardMetaPositionMode = normalizeCardMetaPositionMode(cardMetaPositionModeInput.value);
      renderGames();
      onSettingsFieldChanged();
    });
    cardTitlePositionModeInput?.addEventListener('change', () => {
      state.cardTitlePositionMode = normalizeCardTitlePositionMode(cardTitlePositionModeInput.value);
      renderGames();
      onSettingsFieldChanged();
    });
    cardRatingWidthModeInput?.addEventListener('change', () => {
      state.cardRatingWidthMode = normalizeCardRatingWidthMode(cardRatingWidthModeInput.value);
      renderGames();
      onSettingsFieldChanged();
    });
    enableSteamGamesInput?.addEventListener('change', onSettingsFieldChanged);
    sourceInput?.addEventListener('input', onSettingsFieldChanged);
    exportInput?.addEventListener('input', onSettingsFieldChanged);
    metadataInput?.addEventListener('input', onSettingsFieldChanged);
    protonCommandInput?.addEventListener('input', onSettingsFieldChanged);
    protonCompatDataRootInput?.addEventListener('input', onSettingsFieldChanged);
    useSharedProtonCompatDataRootInput?.addEventListener('change', onSettingsFieldChanged);
    steamFolderInput?.addEventListener('input', onSettingsFieldChanged);
    enableSaveCloudInput?.addEventListener('change', onSettingsFieldChanged);
    saveCloudFolderInput?.addEventListener('input', onSettingsFieldChanged);
    f95CookieHeaderInput?.addEventListener('input', onSettingsFieldChanged);
    vndbTagContentInput?.addEventListener('change', onSettingsFieldChanged);
    vndbTagSexualInput?.addEventListener('change', onSettingsFieldChanged);
    vndbTagTechnicalInput?.addEventListener('change', onSettingsFieldChanged);
    vndbTagSpoilerLevelInput?.addEventListener('change', onSettingsFieldChanged);
    vndbTagDisplayModeInput?.addEventListener('change', onSettingsFieldChanged);
    languageSelect?.addEventListener('change', () => {
      applyLanguage(languageSelect.value);
      onSettingsFieldChanged();
    });
    showCardStatusInput?.addEventListener('change', () => {
      state.showCardStatus = !!showCardStatusInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    showCardLastPlayedInput?.addEventListener('change', () => {
      state.showCardLastPlayed = !!showCardLastPlayedInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    showCardAddedInput?.addEventListener('change', () => {
      state.showCardAdded = !!showCardAddedInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    
    fetchCoversOnImportInput?.addEventListener('change', () => {
      state.fetchCoversOnImport = !!fetchCoversOnImportInput.checked;
      onSettingsFieldChanged();
    });
    fetchImagesOnImportInput?.addEventListener('change', () => {
      state.fetchImagesOnImport = !!fetchImagesOnImportInput.checked;
      onSettingsFieldChanged();
    });

    convertImagesToWebpInput?.addEventListener('change', () => {
      state.convertImagesToWebp = !!convertImagesToWebpInput.checked;
      applyConvertImagesToWebpVisibility();
      onSettingsFieldChanged();
    });
    showCardSourceBadgesInput?.addEventListener('change', () => {
      state.showCardSourceBadges = !!showCardSourceBadgesInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    showCardBuildStatusInput?.addEventListener('change', () => {
      state.showCardBuildStatus = !!showCardBuildStatusInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    showMissingGameOverlayInput?.addEventListener('change', () => {
      state.showMissingGameOverlay = !!showMissingGameOverlayInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    showCardTitleInput?.addEventListener('change', () => {
      state.showCardTitle = !!showCardTitleInput.checked;
      renderGames();
      onSettingsFieldChanged();
    });
    manualGamePathInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addManualGame();
      }
    });
  }

  bindFilterActions() {
    clearFiltersBtn?.addEventListener('click', clearFilters);

    filterInput?.addEventListener('input', () => {
      state.filterText = filterInput.value.trim();
      renderGames();
      queuePersistUiViewState();
    });

    sortSelect?.addEventListener('change', () => {
      state.sortBy = sortSelect.value;
      if (state.sortBy === 'random' && typeof regenerateRandomOrder === 'function') {
        regenerateRandomOrder();
      }
      renderGames();
      queuePersistUiViewState();
    });

    cardSizeSlider?.addEventListener('input', () => {
      applyCardSizePercent(cardSizeSlider.value);
      renderGames();
      queuePersistUiViewState();
    });

    setupFilterTagAutocomplete();
    setupFilterMenu();
    applyCardSizePercent(state.cardSizePercent);
  }

  bindModalActions() {
    modalBackdrop?.addEventListener('click', closeModal);
    modalCloseBtn?.addEventListener('click', closeModal);
  }

  bindGlobalActions() {
    this.doc.addEventListener('keydown', (event) => {
      if (event.key === 'F4') {
        event.preventDefault();
        window.BackendApi.toggleFullscreen();
        return;
      }

      if (event.key === 'Escape' && isFilterMenuOpen()) {
        event.preventDefault();
        closeFilterMenu();
        return;
      }

      if (event.key === 'Escape' && gameModal.classList.contains('open')) {
        closeModal();
        return;
      }

      if (event.key === 'Escape' && settingsPage && settingsPage.classList.contains('open')) {
        closeSettingsPanel();
      }
    });

    this.doc.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    window.addEventListener('beforeunload', () => {
      if (window.BackendApi && typeof window.BackendApi.saveUiViewState === 'function') {
        window.BackendApi.saveUiViewState(getUiViewStateSnapshot());
      }
      queuePersistUiViewState();
    });
  }

  init() {
    this.bindPrimaryActions();
    this.bindSettingsActions();
    this.bindFilterActions();
    this.bindModalActions();
    this.bindGlobalActions();
    this.bindStickyHeaderEffects();

    // window.InitialSettings is delivered synchronously via backend://initial-settings.js
    // (embedded before any other script runs), so applying it here reflects the persisted
    // settings on the very first paint instead of flashing defaults until the async
    // loadState() response arrives ~50ms later.
    if (window.InitialSettings) {
      state.lastLoadedSettings = createSettingsSnapshot(window.InitialSettings);
      applySettingsSnapshot(state.lastLoadedSettings);
    }

    if (window.InitialUiViewState) {
      applyUiViewStateFromBackend(window.InitialUiViewState);
    }

    //window.BackendApi.loadUiViewState();
    loadState();
  }
}

new LauncherAppBootstrap(document).init();



//custom hide code from ai
const grid = document.querySelector("#grid");

const visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        entry.target.style.visibility = entry.isIntersecting ? "visible" : "hidden";
    }
}, {
    root: null,
    rootMargin: "175px",
    threshold: 0
});

const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // nur Elemente
                visibilityObserver.observe(node);
            }
        }
        for (const node of mutation.removedNodes) {
            if (node.nodeType === 1) {
                visibilityObserver.unobserve(node);
            }
        }
    }
});

function init() {
    for (const card of grid.children) {
        visibilityObserver.observe(card);
    }
    mutationObserver.observe(grid, { childList: true });
}
init();