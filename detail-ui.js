// Detail modal UI functions.
function renderDetails(game) {
  detailPanel.innerHTML = '';

  if (!game) {
    detailPanel.classList.remove('detail-edit-mode');
    detailPanel.classList.add('empty-detail');
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    empty.textContent = t('detail_empty_hint', 'Spiel anklicken, um Bilder-Slider und Beschreibung zu sehen.');
    detailPanel.appendChild(empty);
    return;
  }

  detailPanel.classList.remove('empty-detail');
  const isEditMode = state.detailEditGameId === game.id;
  detailPanel.classList.toggle('detail-edit-mode', isEditMode);

  let commitEdit = null;
  const cancelEdit = () => {
    state.detailEditGameId = null;
    renderDetails(game);
  };

  const topRow = document.createElement('div');
  topRow.className = 'detail-top-row';

  const title = document.createElement('h2');
  title.className = 'detail-title';
  title.textContent = game.title;

  const topActions = document.createElement('div');
  topActions.className = 'detail-top-actions';

  if (isEditMode) {
    const saveInlineBtn = document.createElement('button');
    saveInlineBtn.className = 'detail-inline-action detail-inline-text-action detail-inline-save';
    saveInlineBtn.type = 'button';
    saveInlineBtn.textContent = t('detail_btn_save', 'Speichern');
    saveInlineBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (typeof commitEdit === 'function') {
        commitEdit();
      }
    });

    const cancelInlineBtn = document.createElement('button');
    cancelInlineBtn.className = 'secondary detail-inline-action detail-inline-text-action detail-inline-cancel';
    cancelInlineBtn.type = 'button';
    cancelInlineBtn.textContent = t('detail_btn_cancel', 'Abbrechen');
    cancelInlineBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      cancelEdit();
    });

    topActions.appendChild(saveInlineBtn);
    topActions.appendChild(cancelInlineBtn);
  } else {
    const editBtn = document.createElement('button');
    editBtn.className = 'secondary detail-inline-action detail-inline-edit';
    editBtn.type = 'button';
    editBtn.textContent = '✎';
    editBtn.title = t('detail_btn_edit_title', 'Bearbeiten');
    editBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      state.detailEditGameId = game.id;
      renderDetails(game);
    });

    topActions.appendChild(editBtn);
  }

    const gameFolderBtn = document.createElement('button');
    gameFolderBtn.className = 'secondary detail-inline-action detail-inline-game-folder';
    gameFolderBtn.type = 'button';
    gameFolderBtn.textContent = '📂';
    gameFolderBtn.title = t('detail_btn_open_game_folder_title', 'Spielordner öffnen');
    gameFolderBtn.setAttribute('aria-label', t('detail_btn_open_game_folder_title', 'Spielordner öffnen'));
    gameFolderBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const targetGameId = state.selectedGameId || game.id;
      const currentGame = state.games.find((item) => item.id === targetGameId) || game;
      setStatus(t('detail_status_open_game_folder', 'Oeffne Spielordner fuer {title}...', { title: currentGame.title }));
      window.BackendApi.openFolder('$gameFolder', currentGame.id);
    });
    
  const appDataFolderBtn = document.createElement('button');
  appDataFolderBtn.className = 'secondary detail-inline-action detail-inline-appdata-folder';
  appDataFolderBtn.type = 'button';
  appDataFolderBtn.textContent = t('detail_btn_open_appdata_folder', 'AppData');
  appDataFolderBtn.title = t('detail_btn_open_appdata_folder_title', 'AppData-Ordner öffnen');
  appDataFolderBtn.setAttribute('aria-label', t('detail_btn_open_appdata_folder_title', 'AppData-Ordner öffnen'));
  const startProgramIsExe = /\.exe$/i.test(String(game.executableRelativePath || ''));
  appDataFolderBtn.classList.toggle('hidden', !!(state.isLinux && !startProgramIsExe));
  appDataFolderBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const targetGameId = state.selectedGameId || game.id;
    const currentGame = state.games.find((item) => item.id === targetGameId) || game;
    setStatus(t('detail_status_open_appdata_folder', 'Oeffne AppData-Ordner fuer {title}...', { title: currentGame.title }));
    window.BackendApi.openFolder('$appData', currentGame.id);
  });

  const metaFolderBtn = document.createElement('button');
  metaFolderBtn.className = 'secondary detail-inline-action detail-inline-meta-folder';
  metaFolderBtn.type = 'button';
  const metaFolderIcon = document.createElement('img');
  metaFolderIcon.src = 'images/meta-data.png';
  metaFolderIcon.alt = '';
  metaFolderIcon.setAttribute('aria-hidden', 'true');
  metaFolderBtn.appendChild(metaFolderIcon);
  metaFolderBtn.title = t('detail_btn_open_meta_folder_title', 'Meta-Ordner öffnen');
  metaFolderBtn.setAttribute('aria-label', t('detail_btn_open_meta_folder_title', 'Meta-Ordner öffnen'));
  metaFolderBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const targetGameId = state.selectedGameId || game.id;
    const currentGame = state.games.find((item) => item.id === targetGameId) || game;
    setStatus(t('detail_status_open_meta_folder', 'Oeffne Meta-Ordner fuer {title}...', { title: currentGame.title }));
    window.BackendApi.openFolder('$metaFolder', currentGame.id);
  });

  const saveFolderBtn = document.createElement('button');
  saveFolderBtn.className = 'secondary detail-inline-action detail-inline-save-folder';
  saveFolderBtn.type = 'button';
  saveFolderBtn.textContent = '💾';
  saveFolderBtn.title = t('detail_btn_open_save_folder_title', 'Savegame-Ordner öffnen');
  saveFolderBtn.setAttribute('aria-label', t('detail_btn_open_save_folder_title', 'Savegame-Ordner öffnen'));
  saveFolderBtn.classList.toggle('hidden', !String(game.saveGamesPath || '').trim());
  saveFolderBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const targetGameId = state.selectedGameId || game.id;
    const currentGame = state.games.find((item) => item.id === targetGameId) || game;
    setStatus(t('detail_status_open_save_folder', 'Oeffne Savegame-Ordner fuer {title}...', { title: currentGame.title }));
    window.BackendApi.openFolder('$saveFolder', currentGame.id);
  });
  const syncSavesBtn = document.createElement('button');
  syncSavesBtn.className = 'secondary detail-inline-action detail-inline-sync-saves';
  syncSavesBtn.type = 'button';
  const syncIcon = document.createElement('img');
  syncIcon.src = 'images/cloud.png';
  syncIcon.alt = '';
  syncIcon.setAttribute('aria-hidden', 'true');
  syncSavesBtn.appendChild(syncIcon);

  syncSavesBtn.title = t('detail_btn_sync_saves_title', 'Spielstaende in die Save Cloud kopieren');
  syncSavesBtn.setAttribute('aria-label', t('detail_btn_sync_saves_title', 'Spielstaende in die Save Cloud kopieren'));
  syncSavesBtn.classList.toggle('hidden', !(state.enableSaveCloud && String(game.saveGamesPath || '').trim()));
  syncSavesBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    setStatus(t('detail_status_sync_saves', 'Synchronisiere Spielstaende fuer {title}...', { title: game.title }));
    window.BackendApi.syncGameSaves(game.id);
  });
  if ((game.gameType == 'Archive' && !game.isUnpacked) || game.missing )
  {
    gameFolderBtn.style.display="none";
    appDataFolderBtn.style.display="none";
    saveFolderBtn.style.display="none";
    syncSavesBtn.style.display="none";
  }


  const replaceArchiveBtn = document.createElement('button');
  replaceArchiveBtn.className = 'secondary detail-inline-action detail-inline-replace-archive';
  replaceArchiveBtn.type = 'button';
  replaceArchiveBtn.textContent = 'ZIP';
  replaceArchiveBtn.title = t('detail_btn_replace_archive_title', 'Neue Archivdatei hochladen');
  replaceArchiveBtn.setAttribute('aria-label', t('detail_btn_replace_archive_title', 'Neue Archivdatei hochladen'));
  replaceArchiveBtn.classList.toggle('hidden', game.gameType != 'Archive');
  replaceArchiveBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    replaceArchiveForGame(game.id);
  });

  const removeGameBtn = document.createElement('button');
  removeGameBtn.className = 'secondary detail-inline-action detail-inline-text-action detail-inline-remove-game';
  removeGameBtn.type = 'button';
  removeGameBtn.textContent = t('detail_btn_remove_game', 'Entfernen');
  removeGameBtn.title = t('detail_btn_remove_game_title', 'Spiel aus der Liste entfernen');
  removeGameBtn.setAttribute('aria-label', t('detail_btn_remove_game_title', 'Spiel aus der Liste entfernen'));
  removeGameBtn.classList.toggle('hidden', game.gameType != 'Manual');
  removeGameBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const targetGameId = state.selectedGameId || game.id;
    const currentGame = state.games.find((item) => item.id === targetGameId) || game;
    removeGameFromDetail(currentGame.id);
  });

  const closeInlineBtn = document.createElement('button');
  closeInlineBtn.className = 'secondary detail-inline-close';
  closeInlineBtn.type = 'button';
  closeInlineBtn.setAttribute('aria-label', t('detail_btn_close', 'Schliessen'));
  closeInlineBtn.textContent = '×';
  closeInlineBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    closeModal();
  });

  topActions.appendChild(gameFolderBtn);
  topActions.appendChild(appDataFolderBtn);
  topActions.appendChild(metaFolderBtn);
  topActions.appendChild(saveFolderBtn);
  topActions.appendChild(syncSavesBtn);
  topActions.appendChild(replaceArchiveBtn);
  topActions.appendChild(removeGameBtn);
  topActions.appendChild(closeInlineBtn);
  topRow.appendChild(title);
  topRow.appendChild(topActions);

  const metaHighlights = document.createElement('div');
  metaHighlights.className = 'detail-meta-row';

  const lastPlayed = game.lastPlayed ? new Date(game.lastPlayed).toLocaleString() : t('detail_meta_never_played', 'Noch nicht gespielt');
  const lastPlayedChip = document.createElement('div');
  lastPlayedChip.className = 'detail-meta-item';
  lastPlayedChip.textContent = `${t('detail_meta_last_played', 'Zuletzt gespielt')}: ${lastPlayed}`;

  const playedHoursChip = document.createElement('div');
  playedHoursChip.className = 'detail-meta-item detail-played-hours-chip';
  playedHoursChip.textContent = `${t('detail_meta_played', 'Gespielt')}: ${formatPlayedHours(game.playedMinutes)}`;

  /*
  const statusChip = document.createElement('div');
  statusChip.className = 'detail-meta-item detail-status-chip';
  statusChip.textContent = `${t('detail_meta_status', 'Status')}: ${getStatusLabel(game.status)}`;
*/
  const ratingWrap = document.createElement('div');
  ratingWrap.className = 'detail-meta-item detail-rating-inline';

  const ratingLabel = document.createElement('span');
  ratingLabel.className = 'detail-status-label';
  ratingLabel.textContent = `${t('detail_meta_rating', 'Bewertung')}:`;

  ratingWrap.appendChild(ratingLabel);
  ratingWrap.appendChild(renderRatingStars(game.rating, true, (value) => {
    updateGameRating(game, value);
    renderDetails(game);
  }, 'detail-rating-row'));

  metaHighlights.appendChild(lastPlayedChip);
  metaHighlights.appendChild(playedHoursChip);
  //metaHighlights.appendChild(statusChip);
  metaHighlights.appendChild(ratingWrap);

  const statusControl = document.createElement('div');
  statusControl.className = 'detail-meta-item detail-status-inline';

  const statusLabel = document.createElement('label');
  statusLabel.className = 'detail-status-label';
  statusLabel.setAttribute('for', 'detailStatusSelect');
  statusLabel.textContent = `${t('detail_meta_change_status', 'Status ändern')}:`;

  const statusSelect = document.createElement('select');
  statusSelect.id = 'detailStatusSelect';
  statusSelect.className = 'detail-status-select';
  statusSelect.innerHTML = `
    <option value="not-started">${t('filter_status_not_started', 'Noch nicht gestartet')}</option>
    <option value="in-progress">${t('filter_status_in_progress', 'Playing')}</option>
    <option value="completed">${t('filter_status_completed', 'Abgeschlossen')}</option>
    <option value="abandoned">${t('filter_status_abandoned', 'Abgebrochen')}</option>
  `;
  statusSelect.value = normalizeStatus(game.status);
  statusSelect.addEventListener('change', (event) => {
    event.stopPropagation();
    const newStatus = normalizeStatus(statusSelect.value);
    game.status = newStatus;
    setStatus(t('detail_status_saving_status', 'Speichere Status fuer {title}...', { title: game.title }));
    window.BackendApi.updateGameDetails({ gameId: game.id, status: newStatus });
    renderGames();
  });

  statusControl.appendChild(statusLabel);
  statusControl.appendChild(statusSelect);
  metaHighlights.appendChild(statusControl);

  const buildStatusControl = document.createElement('div');
  buildStatusControl.className = 'detail-meta-item detail-status-inline';

  const buildStatusLabel = document.createElement('label');
  buildStatusLabel.className = 'detail-status-label';
  buildStatusLabel.setAttribute('for', 'detailBuildStatusSelect');
  buildStatusLabel.textContent = `${t('build_status_label', 'Build Status')}:`;

  const buildStatusSelect = document.createElement('select');
  buildStatusSelect.id = 'detailBuildStatusSelect';
  buildStatusSelect.className = 'detail-status-select';
  buildStatusSelect.innerHTML = `
    <option value="in-progress">${t('build_status_in_progress', 'In Progress')}</option>
    <option value="on-hold">${t('build_status_on_hold', 'On Hold')}</option>
    <option value="abandoned">${t('build_status_abandoned', 'Abandoned')}</option>
    <option value="completed">${t('build_status_completed', 'Completed')}</option>
  `;
  buildStatusSelect.value = getEffectiveBuildStatus(game);
  buildStatusSelect.addEventListener('change', (event) => {
    event.stopPropagation();
    const nextBuildStatus = normalizeBuildStatus(buildStatusSelect.value) || 'completed';
    game.buildStatus = nextBuildStatus;
    setStatus(t('detail_status_saving_build_status', 'Speichere Build-Status fuer {title}...', { title: game.title }));
    window.BackendApi.updateGameDetails({ gameId: game.id, buildStatus: nextBuildStatus });
    syncGameCardContent(game);
  });

  buildStatusControl.appendChild(buildStatusLabel);
  buildStatusControl.appendChild(buildStatusSelect);
  metaHighlights.appendChild(buildStatusControl);

  const startProgramControl = document.createElement('div');
  startProgramControl.className = 'detail-meta-item detail-status-inline';

  const startProgramPickHeaderBtn = document.createElement('button');
  startProgramPickHeaderBtn.type = 'button';
  startProgramPickHeaderBtn.className = 'secondary';
  startProgramPickHeaderBtn.textContent = t('detail_pick_start_program_btn', 'Startprogramm auswaehlen');
  startProgramPickHeaderBtn.title = t('detail_pick_start_program_btn_title', 'Startprogramm aus gefundenen Dateien auswaehlen');
  startProgramPickHeaderBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openStartProgramCandidatePicker(game);
  });

  startProgramControl.appendChild(startProgramPickHeaderBtn);
  metaHighlights.appendChild(startProgramControl);

  const description = document.createElement('div');
  description.className = 'detail-description';
  let mediaField = null;

  const images = [];
  if (game.coverImageDataUrl) {
    images.push(game.coverImageDataUrl);
  }

  const sliderImages = Array.isArray(game.imageDataUrls) ? game.imageDataUrls : [];
  for (const sliderImage of sliderImages) {
    if (!sliderImage) {
      continue;
    }

    if (game.coverImageDataUrl && sliderImage === game.coverImageDataUrl) {
      continue;
    }

    images.push(sliderImage);
  }

  if (!game.imagesLoaded) {
    requestGameImages(game);
  }

  const slider = document.createElement('div');
  slider.className = 'slider';

  if (!images.length) {
    const noImage = document.createElement('div');
    noImage.className = 'slider-empty';
    noImage.textContent = game.imageLoadRequested
      ? t('detail_slider_loading', 'Bilder werden geladen...')
      : t('detail_slider_empty', 'Keine Bilder gefunden (erwartet: image1, image2, image3 ...).');
    slider.appendChild(noImage);
  } else {
    const maxIndex = images.length - 1;
    state.selectedImageIndex = Math.max(0, Math.min(state.selectedImageIndex, maxIndex));
    if (!state.detailThumbScrollLeftByGameId || typeof state.detailThumbScrollLeftByGameId !== 'object') {
      state.detailThumbScrollLeftByGameId = {};
    }
    const thumbScrollKey = String(game.id || '');

    const frame = document.createElement('div');
    frame.className = 'slider-frame';

    const image = document.createElement('img');
    image.src = images[state.selectedImageIndex];
    image.alt = t('detail_slider_image_alt', '{title} Bild {index}', {
      title: game.title,
      index: state.selectedImageIndex + 1
    });
    frame.appendChild(image);

    const frameCounter = document.createElement('span');
    frameCounter.className = 'slider-frame-counter';
    frameCounter.textContent = `${state.selectedImageIndex + 1}/${images.length}`;
    frame.appendChild(frameCounter);

    const navigationRow = document.createElement('div');
    navigationRow.className = 'slider-nav-row';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'secondary slider-nav-btn';
    prev.textContent = '◀';
    prev.title = t('detail_slider_prev_title', 'Vorheriges Bild');
    prev.setAttribute('aria-label', t('detail_slider_prev_title', 'Vorheriges Bild'));
    prev.disabled = state.selectedImageIndex <= 0;
    prev.addEventListener('click', (event) => {
      event.stopPropagation();
      if (thumbScrollKey) {
        state.detailThumbScrollLeftByGameId[thumbScrollKey] = thumbs.scrollLeft;
      }
      state.selectedImageIndex = Math.max(0, state.selectedImageIndex - 1);
      renderDetails(game);
    });

    const thumbs = document.createElement('div');
    thumbs.className = 'slider-thumbs';
    thumbs.addEventListener('scroll', () => {
      if (!thumbScrollKey) {
        return;
      }

      state.detailThumbScrollLeftByGameId[thumbScrollKey] = thumbs.scrollLeft;
    }, { passive: true });

    for (let i = 0; i < images.length; i += 1) {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = 'slider-thumb';
      thumbBtn.classList.toggle('active', i === state.selectedImageIndex);
      thumbBtn.setAttribute('aria-label', t('detail_slider_thumb_aria', 'Bild {index} auswaehlen', { index: i + 1 }));

      const thumbImg = document.createElement('img');
      thumbImg.src = images[i];
      thumbImg.alt = t('detail_slider_thumb_alt', '{title} Vorschau {index}', { title: game.title, index: i + 1 });
      thumbBtn.appendChild(thumbImg);

      thumbBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (thumbScrollKey) {
          state.detailThumbScrollLeftByGameId[thumbScrollKey] = thumbs.scrollLeft;
        }
        state.selectedImageIndex = i;
        renderDetails(game);
      });

      thumbs.appendChild(thumbBtn);
    }

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'secondary slider-nav-btn';
    next.textContent = '▶';
    next.title = t('detail_slider_next_title', 'Naechstes Bild');
    next.setAttribute('aria-label', t('detail_slider_next_title', 'Naechstes Bild'));
    next.disabled = state.selectedImageIndex >= maxIndex;
    next.addEventListener('click', (event) => {
      event.stopPropagation();
      if (thumbScrollKey) {
        state.detailThumbScrollLeftByGameId[thumbScrollKey] = thumbs.scrollLeft;
      }
      state.selectedImageIndex = Math.min(maxIndex, state.selectedImageIndex + 1);
      renderDetails(game);
    });

    navigationRow.appendChild(prev);
    navigationRow.appendChild(thumbs);
    navigationRow.appendChild(next);

    slider.appendChild(frame);
    slider.appendChild(navigationRow);

    requestAnimationFrame(() => {
      if (thumbScrollKey) {
        const savedScroll = Number(state.detailThumbScrollLeftByGameId[thumbScrollKey] || 0);
        if (Number.isFinite(savedScroll) && savedScroll > 0) {
          thumbs.scrollLeft = savedScroll;
        }
      }

      const activeThumb = thumbs.querySelector('.slider-thumb.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      }

      if (thumbScrollKey) {
        state.detailThumbScrollLeftByGameId[thumbScrollKey] = thumbs.scrollLeft;
      }
    });
  }

  detailPanel.appendChild(topRow);
  detailPanel.appendChild(metaHighlights);

  if (!isEditMode) {
    const descriptionText = document.createElement('p');
    descriptionText.className = 'detail-description-text';
    descriptionText.textContent = game.description || t('detail_no_description', 'Keine Beschreibung hinterlegt.');

    const urlRead = document.createElement('div');
    urlRead.className = 'detail-tags-read detail-url-read';
    const urlReadLabel = document.createElement('span');
    urlReadLabel.className = 'detail-status-label';
    urlReadLabel.textContent = `${t('detail_field_url', 'URL')}:`;
    urlRead.appendChild(urlReadLabel);

    const urlReadValue = document.createElement('span');
    urlReadValue.className = 'detail-tag-empty detail-url-value';
    urlReadValue.textContent = String(game.url || '').trim() || t('detail_not_set', 'Nicht gesetzt');
    urlRead.appendChild(urlReadValue);

    if (String(game.url || '').trim()) {
      urlReadValue.textContent = String(game.url || '').trim();
      urlReadValue.className = 'detail-url-link';
      urlReadValue.title = t('detail_open_url_title', 'URL im Standardbrowser öffnen');
      urlReadValue.setAttribute('role', 'link');
      urlReadValue.tabIndex = 0;

      const openUrl = (event) => {
        event.stopPropagation();
        setStatus(t('detail_status_open_url', 'Oeffne URL fuer {title}...', { title: game.title }));
        window.BackendApi.openExternalUrl(String(game.url || '').trim());
      };

      urlReadValue.addEventListener('click', openUrl);
      urlReadValue.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openUrl(event);
        }
      });
    }

    const tagsRead = document.createElement('div');
    tagsRead.className = 'detail-tags-read';
    tagsRead.dataset.detailSection = 'tags';
    const tagsReadLabel = document.createElement('span');
    tagsReadLabel.className = 'detail-status-label';
    tagsReadLabel.textContent = `${t('detail_tags', 'Tags')}:`;
    tagsRead.appendChild(tagsReadLabel);

    const normalizedTags = normalizeTagList(game.tags);
    if (!normalizedTags.length) {
      const emptyTags = document.createElement('span');
      emptyTags.className = 'detail-tag-empty';
      emptyTags.textContent = t('detail_no_tags', 'Keine Tags');
      tagsRead.appendChild(emptyTags);
    } else {
      for (const tag of normalizedTags) {
        const chip = document.createElement('span');
        chip.className = 'detail-tag-chip';
        chip.textContent = tag;
        tagsRead.appendChild(chip);
      }
    }

    const savePathRead = document.createElement('div');
    savePathRead.className = 'detail-tags-read';
    const savePathReadLabel = document.createElement('span');
    savePathReadLabel.className = 'detail-status-label';
    savePathReadLabel.textContent = `${t('detail_savegames', 'Spielstaende')}:`;
    savePathRead.appendChild(savePathReadLabel);

    const savePathReadValue = document.createElement('span');
    savePathReadValue.className = 'detail-tag-empty';
    savePathReadValue.textContent = String(game.saveGamesPath || '').trim() || t('detail_not_set', 'Nicht gesetzt');
    savePathRead.appendChild(savePathReadValue);

    description.appendChild(urlRead);
    description.appendChild(tagsRead);
    description.appendChild(savePathRead);
    description.appendChild(descriptionText);
  } else {
    const detailEditor = document.createElement('div');
    detailEditor.className = 'detail-editor';

    const nameField = document.createElement('div');
    nameField.className = 'detail-edit-field';

    const nameLabel = document.createElement('label');
    nameLabel.className = 'detail-status-label';
    nameLabel.setAttribute('for', 'detailNameInput');
    nameLabel.textContent = t('detail_field_name', 'Name');

    const nameInput = document.createElement('input');
    nameInput.id = 'detailNameInput';
    nameInput.type = 'text';
    nameInput.value = game.title || '';
    nameInput.maxLength = 200;

    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);

    const startProgramField = document.createElement('div');
    startProgramField.className = 'detail-edit-field';

    const startProgramInput = document.createElement('file-input');
    startProgramInput.setAttribute('input-id', 'detailStartProgramInput');
    startProgramInput.setAttribute('pick-id', 'detailStartProgramPickBtn');
    startProgramInput.setAttribute('label', t('detail_field_start_program', 'Startprogramm'));
    startProgramInput.setAttribute('placeholder', t('detail_start_program_placeholder', 'z.B. game.exe'));

    startProgramField.appendChild(startProgramInput);

    const urlField = document.createElement('div');
    urlField.className = 'detail-edit-field';

    const urlLabel = document.createElement('label');
    urlLabel.className = 'detail-status-label';
    urlLabel.setAttribute('for', 'detailUrlInput');
    urlLabel.textContent = t('detail_field_url', 'URL');

    const urlInput = document.createElement('input');
    urlInput.id = 'detailUrlInput';
    urlInput.type = 'text';
    urlInput.value = game.url || '';
    urlInput.placeholder = t('detail_url_placeholder', 'https://...');

    urlField.appendChild(urlLabel);
    urlField.appendChild(urlInput);

    const importF95Btn = document.createElement('button');
    importF95Btn.type = 'button';
    importF95Btn.className = 'secondary detail-import-f95-btn';
    importF95Btn.textContent = t('detail_import_f95_btn', 'Metadaten von URL laden');
    importF95Btn.title = t('detail_import_f95_title', 'Titel, Beschreibung, Tags und Bilder von einer F95-Thread-URL laden');
    importF95Btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const sourceUrl = urlInput.value.trim();
      if (!sourceUrl) {
        setStatus(t('detail_error_enter_f95_url', 'Bitte zuerst eine F95-URL im URL-Feld eintragen.'), true);
        urlInput.focus();
        return;
      }

      setStatus(t('detail_status_loading_metadata', 'Lade Metadaten fuer {title}...', { title: game.title }));
      window.BackendApi.importFromUrl(game.id, sourceUrl);
    });

    urlField.appendChild(importF95Btn);

    const machineToggleField = document.createElement('div');
    machineToggleField.className = 'detail-machine-toggle';

    const machineTranslatedCheckbox = document.createElement('input');
    machineTranslatedCheckbox.id = 'detailMachineTranslated';
    machineTranslatedCheckbox.type = 'checkbox';
    machineTranslatedCheckbox.checked = !!game.isMachineTranslated;

    const machineTranslatedLabel = document.createElement('label');
    machineTranslatedLabel.setAttribute('for', 'detailMachineTranslated');
    machineTranslatedLabel.textContent = t('detail_machine_translated', 'Maschinell uebersetzt');

    machineToggleField.appendChild(machineTranslatedCheckbox);
    machineToggleField.appendChild(machineTranslatedLabel);

    mediaField = document.createElement('div');
    mediaField.className = 'detail-edit-field detail-media-editor';

    const mediaLabel = document.createElement('label');
    mediaLabel.className = 'detail-status-label';
    mediaLabel.textContent = t('detail_media_label', 'Bilder');

    const mediaHint = document.createElement('div');
    mediaHint.className = 'detail-media-hint';
    const existingGalleryCount = Array.isArray(game.imageDataUrls)
      ? game.imageDataUrls.filter(Boolean).length
      : 0;
    mediaHint.textContent = t('detail_media_hint', 'Cover und Zusatzbilder bearbeiten (aktuell {count} Zusatzbild(er)).', { count: existingGalleryCount });

    const parsePositiveImageIndex = (rawValue) => {
      const parsed = Number.parseInt(String(rawValue || '').trim(), 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
      }

      return parsed;
    };

    const coverRow = document.createElement('div');
    coverRow.className = 'detail-media-row';

    const coverTitle = document.createElement('div');
    coverTitle.className = 'detail-media-row-title';
    coverTitle.textContent = t('detail_media_cover', 'Cover');

    const coverPickBtn = document.createElement('button');
    coverPickBtn.type = 'button';
    coverPickBtn.className = 'secondary';
    coverPickBtn.textContent = t('detail_media_pick_file', 'Datei waehlen');
    coverPickBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setStatus(t('detail_status_choose_cover_file', 'Waehle Cover-Datei fuer {title}...', { title: game.title }));
      window.BackendApi.updateGameImage({
        gameId: game.id,
        target: 'cover',
        sourceType: 'file'
      });
    });

    const coverUrlInput = document.createElement('input');
    coverUrlInput.type = 'text';
    coverUrlInput.placeholder = t('detail_cover_url_placeholder', 'https://.../cover.jpg');

    const coverUrlBtn = document.createElement('button');
    coverUrlBtn.type = 'button';
    coverUrlBtn.className = 'secondary';
    coverUrlBtn.textContent = t('detail_media_load_url', 'Von URL laden');
    coverUrlBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const imageUrl = coverUrlInput.value.trim();
      if (!imageUrl) {
        setStatus(t('detail_error_enter_cover_url', 'Bitte eine Cover-URL angeben.'), true);
        coverUrlInput.focus();
        return;
      }

      setStatus(t('detail_status_loading_cover', 'Lade Cover fuer {title}...', { title: game.title }));
      window.BackendApi.updateGameImage({
        gameId: game.id,
        target: 'cover',
        sourceType: 'url',
        imageUrl
      });
    });

    coverRow.appendChild(coverTitle);
    coverRow.appendChild(coverPickBtn);
    coverRow.appendChild(coverUrlInput);
    coverRow.appendChild(coverUrlBtn);

    const galleryRow = document.createElement('div');
    galleryRow.className = 'detail-media-row';

    const galleryTitle = document.createElement('div');
    galleryTitle.className = 'detail-media-row-title';
    galleryTitle.textContent = t('detail_media_gallery_title', 'Zusatzbilder (image1, image2, ...)');

    const galleryIndexInput = document.createElement('input');
    galleryIndexInput.type = 'number';
    galleryIndexInput.min = '1';
    galleryIndexInput.step = '1';
    galleryIndexInput.placeholder = t('detail_media_slot_placeholder', 'Slot (auto)');
    galleryIndexInput.title = t('detail_media_slot_title', 'Leer = naechstes freies imageN. Mit Zahl = imageN ersetzen.');

    const galleryPickBtn = document.createElement('button');
    galleryPickBtn.type = 'button';
    galleryPickBtn.className = 'secondary';
    galleryPickBtn.textContent = t('detail_media_add_file', 'Datei hinzufuegen');
    galleryPickBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const imageIndex = parsePositiveImageIndex(galleryIndexInput.value);
      setStatus(t('detail_status_choose_gallery_file', 'Waehle Zusatzbild fuer {title}...', { title: game.title }));

      const payload = {
        gameId: game.id,
        target: 'gallery',
        sourceType: 'file'
      };

      if (imageIndex !== null) {
        payload.imageIndex = imageIndex;
      }

      window.BackendApi.updateGameImage(payload);
    });

    const galleryUrlInput = document.createElement('input');
    galleryUrlInput.type = 'text';
    galleryUrlInput.placeholder = t('detail_gallery_url_placeholder', 'https://.../image.png');

    const galleryUrlBtn = document.createElement('button');
    galleryUrlBtn.type = 'button';
    galleryUrlBtn.className = 'secondary';
    galleryUrlBtn.textContent = t('detail_media_add_url', 'URL hinzufuegen');
    galleryUrlBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const imageUrl = galleryUrlInput.value.trim();
      if (!imageUrl) {
        setStatus(t('detail_error_enter_image_url', 'Bitte eine Bild-URL angeben.'), true);
        galleryUrlInput.focus();
        return;
      }

      const imageIndex = parsePositiveImageIndex(galleryIndexInput.value);
      const payload = {
        gameId: game.id,
        target: 'gallery',
        sourceType: 'url',
        imageUrl
      };

      if (imageIndex !== null) {
        payload.imageIndex = imageIndex;
      }

      setStatus(t('detail_status_loading_gallery', 'Lade Zusatzbild fuer {title}...', { title: game.title }));
      window.BackendApi.updateGameImage(payload);
    });

    galleryRow.appendChild(galleryTitle);
    galleryRow.appendChild(galleryIndexInput);
    galleryRow.appendChild(galleryPickBtn);
    galleryRow.appendChild(galleryUrlInput);
    galleryRow.appendChild(galleryUrlBtn);

    mediaField.appendChild(mediaLabel);
    mediaField.appendChild(mediaHint);
    mediaField.appendChild(coverRow);
    mediaField.appendChild(galleryRow);

    const tagsField = document.createElement('div');
    tagsField.className = 'detail-edit-field';

    const tagsLabel = document.createElement('label');
    tagsLabel.className = 'detail-status-label';
    tagsLabel.setAttribute('for', 'detailTagInput');
    tagsLabel.textContent = t('detail_tags', 'Tags');

    const tagsEditor = document.createElement('div');
    tagsEditor.className = 'detail-tags-editor';

    const tagsInputRow = document.createElement('div');
    tagsInputRow.className = 'detail-tags-input-row';

    const tagsInput = document.createElement('input');
    tagsInput.id = 'detailTagInput';
    tagsInput.type = 'text';
    tagsInput.placeholder = t('detail_tags_input_placeholder', 'Tag eingeben und Enter druecken');

    const tagsSuggestionBox = document.createElement('div');
    tagsSuggestionBox.className = 'detail-tag-suggestions hidden';

    const addTagBtn = document.createElement('button');
    addTagBtn.type = 'button';
    addTagBtn.className = 'secondary';
    addTagBtn.textContent = t('detail_tags_add_button', 'Tag +');

    const tagsChipList = document.createElement('div');
    tagsChipList.className = 'detail-tags-chips';

    let currentTags = normalizeTagList(game.tags);
    let activeSuggestions = [];
    let activeSuggestionIndex = 0;

    const hideTagSuggestions = () => {
      tagsSuggestionBox.classList.add('hidden');
      tagsSuggestionBox.innerHTML = '';
      activeSuggestions = [];
      activeSuggestionIndex = 0;
    };

    const setActiveTagSuggestionIndex = (nextIndex) => {
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

      const buttons = tagsSuggestionBox.querySelectorAll('.detail-tag-suggestion');
      for (let i = 0; i < buttons.length; i += 1) {
        buttons[i].classList.toggle('active', i === activeSuggestionIndex);
      }
    };

    const applyTagSuggestion = (entry) => {
      if (!entry || !entry.value) {
        return;
      }

      tryAddTag(entry.value, true);
      tagsInput.focus();
    };

    const renderTagSuggestions = () => {
      const query = normalizeTagQuery(tagsInput.value);
      const knownSuggestions = getBestTagSuggestions(query, currentTags, 8);

      activeSuggestions = [];
      if (query) {
        activeSuggestions.push({
          value: query,
          isCreate: true
        });
      }

      for (const suggestion of knownSuggestions) {
        activeSuggestions.push({
          value: suggestion,
          isCreate: false
        });
      }

      activeSuggestionIndex = 0;

      tagsSuggestionBox.innerHTML = '';
      if (!activeSuggestions.length) {
        hideTagSuggestions();
        return;
      }

      for (let i = 0; i < activeSuggestions.length; i += 1) {
        const suggestion = activeSuggestions[i];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'detail-tag-suggestion';
        button.classList.toggle('active', i === 0);
        button.textContent = suggestion.isCreate
          ? t('detail_tags_suggestion_new', '+ Neues Tag: {tag}', { tag: suggestion.value })
          : suggestion.value;
        button.addEventListener('mousedown', (event) => {
          event.preventDefault();
        });
        button.addEventListener('mouseenter', () => {
          setActiveTagSuggestionIndex(i);
        });
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          applyTagSuggestion(suggestion);
        });
        tagsSuggestionBox.appendChild(button);
      }

      tagsSuggestionBox.classList.remove('hidden');
    };

    const renderEditableTags = () => {
      tagsChipList.innerHTML = '';
      if (!currentTags.length) {
        const emptyHint = document.createElement('span');
        emptyHint.className = 'detail-tag-empty';
        emptyHint.textContent = t('detail_tags_none_yet', 'Noch keine Tags');
        tagsChipList.appendChild(emptyHint);
        return;
      }

      for (const tag of currentTags) {
        const chip = document.createElement('span');
        chip.className = 'detail-tag-chip';
        chip.textContent = tag;

        const removeTagBtn = document.createElement('button');
        removeTagBtn.type = 'button';
        removeTagBtn.className = 'detail-tag-remove';
        removeTagBtn.textContent = '×';
        removeTagBtn.setAttribute('aria-label', t('detail_tag_remove_aria', 'Tag {tag} entfernen', { tag }));
        removeTagBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          currentTags = currentTags.filter((t) => t.toLowerCase() !== tag.toLowerCase());
          renderEditableTags();
        });

        chip.appendChild(removeTagBtn);
        tagsChipList.appendChild(chip);
      }
    };

    const tryAddTag = (forcedValue = '', keepTypingSpace = false) => {
      const values = forcedValue
        ? normalizeTagList([forcedValue])
        : parseTagsFromInput(tagsInput.value);

      if (!values.length) {
        return;
      }

      currentTags = normalizeTagList([...currentTags, ...values]);

      tagsInput.value = keepTypingSpace ? ' ' : '';
      renderEditableTags();
      renderTagSuggestions();
    };

    addTagBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      tryAddTag();
      tagsInput.focus();
    });

    tagsInput.addEventListener('input', () => {
      renderTagSuggestions();
    });

    tagsInput.addEventListener('focus', () => {
      renderTagSuggestions();
    });

    tagsInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const hasCommaInput = tagsInput.value.includes(',');
        const typedTags = parseTagsFromInput(tagsInput.value);

        if (hasCommaInput || typedTags.length > 1) {
          tryAddTag('', true);
        } else {
          const query = normalizeTagQuery(tagsInput.value);
          if (query && activeSuggestions.length) {
            const selected = activeSuggestions[activeSuggestionIndex] || activeSuggestions[0];
            const exact = activeSuggestions.find((entry) => !entry.isCreate && entry.value.toLowerCase() === query.toLowerCase());
            if (exact && activeSuggestionIndex === 0) {
              applyTagSuggestion(exact);
            } else {
              applyTagSuggestion(selected);
            }
          } else {
            tryAddTag('', true);
          }
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        if (!activeSuggestions.length) {
          renderTagSuggestions();
        }

        if (activeSuggestions.length) {
          event.preventDefault();
          setActiveTagSuggestionIndex(activeSuggestionIndex + 1);
        }
        return;
      }

      if (event.key === 'ArrowUp') {
        if (!activeSuggestions.length) {
          renderTagSuggestions();
        }

        if (activeSuggestions.length) {
          event.preventDefault();
          setActiveTagSuggestionIndex(activeSuggestionIndex - 1);
        }
        return;
      }

      if (event.key === 'Escape') {
        hideTagSuggestions();
        return;
      }

      if (event.key === ',') {
        event.preventDefault();
        const parsed = parseTagsFromInput(tagsInput.value);
        if (parsed.length) {
          tryAddTag('', true);
        } else {
          tagsInput.value = '';
        }
        return;
      }
    });

    tagsInput.addEventListener('blur', () => {
      window.setTimeout(() => {
        hideTagSuggestions();
      }, 120);
    });

    tagsInputRow.appendChild(tagsInput);
    tagsInputRow.appendChild(addTagBtn);
    tagsEditor.appendChild(tagsInputRow);
    tagsEditor.appendChild(tagsSuggestionBox);
    tagsEditor.appendChild(tagsChipList);

    tagsField.appendChild(tagsLabel);
    tagsField.appendChild(tagsEditor);

    const descriptionField = document.createElement('div');
    descriptionField.className = 'detail-edit-field';

    const playedHoursField = document.createElement('div');
    playedHoursField.className = 'detail-edit-field';

    const savePathField = document.createElement('div');
    savePathField.className = 'detail-edit-field';

    const savePathLabel = document.createElement('label');
    savePathLabel.className = 'detail-status-label';
    savePathLabel.setAttribute('for', 'detailSaveGamesPathInput');
    savePathLabel.textContent = t('detail_save_path_label', 'Spielstaende (relativ oder absolut)');

    const savePathInput = document.createElement('folder-input');
    savePathInput.className = 'detail-save-path-folder-input';
    savePathInput.setAttribute('no-label', 'true');
    savePathInput.setAttribute('input-id', 'detailSaveGamesPathInput');
    savePathInput.setAttribute('pick-id', 'detailSaveGamesPathPickBtn');
    savePathInput.setAttribute('open-id', 'detailSaveGamesPathOpenBtn');
    savePathInput.setAttribute('game-id', String(game.id || ''));
    savePathInput.setAttribute('status-label-key', 'detail_save_path_label');
    savePathInput.setAttribute('status-label', t('detail_save_path_label', 'Spielstaende (relativ oder absolut)'));
    savePathInput.setAttribute('placeholder', t('detail_save_path_placeholder', 'z.B. save oder C:\\Users\\...'));
    savePathInput.setAttribute('value', String(game.saveGamesPath || ''));

    savePathField.appendChild(savePathLabel);
    savePathField.appendChild(savePathInput);

    const saveFileFilterField = document.createElement('div');
    saveFileFilterField.className = 'detail-edit-field';

    const saveFileFilterLabel = document.createElement('label');
    saveFileFilterLabel.className = 'detail-status-label';
    saveFileFilterLabel.setAttribute('for', 'detailSaveGamesFileFilterInput');
    saveFileFilterLabel.textContent = t('detail_save_file_filter_label', 'Dateifilter fuer Spielstaende (optional)');

    const saveFileFilterInput = document.createElement('input');
    saveFileFilterInput.id = 'detailSaveGamesFileFilterInput';
    saveFileFilterInput.type = 'text';
    saveFileFilterInput.value = String(game.saveGamesFileFilter || '');
    saveFileFilterInput.placeholder = t('detail_save_file_filter_placeholder', 'Nur Dateien im Save-Ordner; * und ? erlaubt, mehrere mit ; z.B. Save*.rvdat2;global.rvdat2');

    saveFileFilterField.appendChild(saveFileFilterLabel);
    saveFileFilterField.appendChild(saveFileFilterInput);

    const playedHoursLabel = document.createElement('label');
    playedHoursLabel.className = 'detail-status-label';
    playedHoursLabel.setAttribute('for', 'detailPlayedHoursInput');
    playedHoursLabel.textContent = t('detail_played_hours_label', 'Gespielte Stunden');

    const playedHoursInput = document.createElement('input');
    playedHoursInput.id = 'detailPlayedHoursInput';
    playedHoursInput.type = 'number';
    playedHoursInput.min = '0';
    playedHoursInput.step = '0.1';
    playedHoursInput.value = (normalizePlayedMinutes(game.playedMinutes) / 60).toFixed(1);

    playedHoursField.appendChild(playedHoursLabel);
    playedHoursField.appendChild(playedHoursInput);

    const descriptionLabel = document.createElement('label');
    descriptionLabel.className = 'detail-status-label';
    descriptionLabel.setAttribute('for', 'detailDescriptionInput');
    descriptionLabel.textContent = t('detail_description_label', 'Beschreibung');

    const descriptionInput = document.createElement('textarea');
    descriptionInput.id = 'detailDescriptionInput';
    descriptionInput.className = 'detail-description-input';
    descriptionInput.value = game.description || '';
    descriptionInput.placeholder = t('detail_no_description', 'Keine Beschreibung hinterlegt.');

    descriptionField.appendChild(descriptionLabel);
    descriptionField.appendChild(descriptionInput);

    commitEdit = () => {
      const previous = {
        title: String(game.title || ''),
        url: String(game.url || ''),
        description: String(game.description || ''),
        isMachineTranslated: !!game.isMachineTranslated,
        buildStatus: normalizeBuildStatus(game.buildStatus) || 'completed',
        saveGamesPath: String(game.saveGamesPath || '').trim(),
        saveGamesFileFilter: String(game.saveGamesFileFilter || ''),
        tags: normalizeTagList(game.tags),
        playedMinutes: normalizePlayedMinutes(game.playedMinutes),
        executableRelativePath: String(game.executableRelativePath || '').trim()
      };

      const nextTitle = nameInput.value.trim();
      if (!nextTitle) {
        setStatus(t('detail_error_name_empty', 'Der Name darf nicht leer sein.'), true);
        nameInput.focus();
        return;
      }

      tryAddTag();

      const nextDescription = descriptionInput.value;
      const nextUrl = urlInput.value.trim();
      const nextMachineTranslated = !!machineTranslatedCheckbox.checked;
      const nextBuildStatus = normalizeBuildStatus(buildStatusSelect.value) || 'completed';
      const nextSaveGamesPath = String(document.getElementById('detailSaveGamesPathInput')?.value || '').trim();
      const nextSaveGamesFileFilter = String(saveFileFilterInput.value || '')
        .split(';')
        .map((pattern) => pattern.trim())
        .filter(Boolean)
        .join(';');
      const invalidSavePattern = nextSaveGamesFileFilter
        .split(';')
        .find((pattern) => pattern === '.' || pattern === '..' || pattern.includes('/') || pattern.includes('\\'));
      if (invalidSavePattern) {
        setStatus(t('detail_error_save_file_filter_invalid', 'Dateifilter duerfen nur Dateinamen mit * und ? enthalten, keine Unterordner.'), true);
        saveFileFilterInput.focus();
        return;
      }
      const nextPlayedHours = Number(playedHoursInput.value);
      if (!Number.isFinite(nextPlayedHours) || nextPlayedHours < 0) {
        setStatus(t('detail_error_played_hours_invalid', 'Bitte einen gueltigen Wert fuer gespielte Stunden angeben.'), true);
        playedHoursInput.focus();
        return;
      }
      const nextPlayedMinutes = Math.max(0, Math.round(nextPlayedHours * 60));
      const nextExecutableRelativePath = String(document.getElementById('detailStartProgramInput')?.value || '').trim();

      game.title = nextTitle;
      game.url = nextUrl;
      game.description = nextDescription;
      game.isMachineTranslated = nextMachineTranslated;
      game.buildStatus = nextBuildStatus;
      game.saveGamesPath = nextSaveGamesPath;
      game.saveGamesFileFilter = nextSaveGamesFileFilter;
      game.tags = normalizeTagList(currentTags);
      game.playedMinutes = nextPlayedMinutes;
      game.executableRelativePath = nextExecutableRelativePath;

      const patchPayload = { gameId: game.id };
      if (nextTitle !== previous.title) {
        patchPayload.title = nextTitle;
      }
      if (nextUrl !== previous.url) {
        patchPayload.url = nextUrl;
      }
      if (nextDescription !== previous.description) {
        patchPayload.description = nextDescription;
      }
      if (nextMachineTranslated !== previous.isMachineTranslated) {
        patchPayload.isMachineTranslated = nextMachineTranslated;
      }
      if (nextBuildStatus !== previous.buildStatus) {
        patchPayload.buildStatus = nextBuildStatus;
      }
      if (nextSaveGamesPath !== previous.saveGamesPath) {
        patchPayload.saveGamesPath = nextSaveGamesPath;
      }
      if (nextSaveGamesFileFilter !== previous.saveGamesFileFilter) {
        patchPayload.saveGamesFileFilter = nextSaveGamesFileFilter;
      }
      if (nextPlayedMinutes !== previous.playedMinutes) {
        patchPayload.playedMinutes = nextPlayedMinutes;
      }
      if (nextExecutableRelativePath !== previous.executableRelativePath) {
        patchPayload.executableRelativePath = nextExecutableRelativePath;
      }
      if (JSON.stringify(game.tags) !== JSON.stringify(previous.tags)) {
        patchPayload.tags = game.tags;
      }

      if (Object.keys(patchPayload).length > 1) {
        setStatus(t('detail_status_saving_details', 'Speichere Details fuer {title}...', { title: game.title }));
        window.BackendApi.updateGameDetails(patchPayload);
      }

      state.detailEditGameId = null;
      renderGames();
      renderDetails(game);
    };

    detailEditor.appendChild(nameField);
    detailEditor.appendChild(startProgramField);
    detailEditor.appendChild(urlField);
    detailEditor.appendChild(machineToggleField);
    detailEditor.appendChild(savePathField);
    detailEditor.appendChild(saveFileFilterField);
    detailEditor.appendChild(tagsField);
    detailEditor.appendChild(playedHoursField);
    detailEditor.appendChild(descriptionField);

    renderEditableTags();
    description.appendChild(detailEditor);
  }

  if (isEditMode && mediaField) {
    const mediaSplit = document.createElement('div');
    mediaSplit.className = 'detail-media-split';

    const mediaPanel = document.createElement('div');
    mediaPanel.className = 'detail-media-panel';
    mediaPanel.appendChild(mediaField);

    mediaSplit.appendChild(slider);
    mediaSplit.appendChild(mediaPanel);
    detailPanel.appendChild(mediaSplit);
  } else {
    detailPanel.appendChild(slider);
  }

  detailPanel.appendChild(description);

  if (isEditMode) {
    const startProgramInputEl = document.getElementById('detailStartProgramInput');
    if (startProgramInputEl) {
      startProgramInputEl.value = String(game.executableRelativePath || '');
    }

    const startProgramPickBtn = document.getElementById('detailStartProgramPickBtn');
    startProgramPickBtn?.addEventListener('click', async (event) => {
      event.stopPropagation();
      if (!startProgramInputEl) {
        return;
      }

      try {
        const result = await window.BackendApi.pickFile(startProgramInputEl.value, game.id, '$executables');
        if (!result || result.cancelled) {
          return;
        }

        const selectedPath = String(result.path || '').trim();
        if (selectedPath) {
          startProgramInputEl.value = selectedPath;
        }
      } catch (error) {
        setStatus(error?.message || t('detail_error_pick_file', 'Datei konnte nicht ausgewaehlt werden.'), true);
      }
    });
  }

  const archiveFileRow = document.createElement('div');
  archiveFileRow.className = 'detail-archive-row';
  if (game.gameType != 'Archive') {
    archiveFileRow.title = game.gamePath || '-';
    archiveFileRow.textContent = `${t('detail_archive_row_manual', 'Spielordner')}: ${game.gamePath || '-'}`;
  } else {
    archiveFileRow.title = game.archiveFile || '-';
    archiveFileRow.textContent = `${t('detail_archive_row_archive', 'Archivdatei')}: ${game.archiveFile || '-'}`;
  }
  detailPanel.appendChild(archiveFileRow);
}

function syncDetailPanelFromGame(game) {
  const panel = detailPanel;
  if (!panel || !panel.childElementCount) {
    return;
  }

  const title = panel.querySelector('.detail-title');
  if (title) {
    title.textContent = game.title;
  }

  const statusChip = panel.querySelector('.detail-status-chip');
  if (statusChip) {
    statusChip.textContent = `${t('detail_meta_status', 'Status')}: ${getStatusLabel(game.status)}`;
  }

  const playedHoursChip = panel.querySelector('.detail-played-hours-chip');
  if (playedHoursChip) {
    playedHoursChip.textContent = `${t('detail_meta_played', 'Gespielt')}: ${formatPlayedHours(game.playedMinutes)}`;
  }

  const statusSelect = panel.querySelector('#detailStatusSelect');
  if (statusSelect) {
    statusSelect.value = normalizeStatus(game.status);
  }

  const buildStatusSelect = panel.querySelector('#detailBuildStatusSelect');
  if (buildStatusSelect) {
    buildStatusSelect.value = getEffectiveBuildStatus(game);
  }

  const startProgramInput = panel.querySelector('#detailStartProgramInput');
  if (startProgramInput) {
    startProgramInput.value = String(game.executableRelativePath || '');
  }

  const appDataFolderBtn = panel.querySelector('.detail-inline-appdata-folder');
  if (appDataFolderBtn) {
    const startProgramIsExe = /\.exe$/i.test(String(game.executableRelativePath || ''));
    appDataFolderBtn.classList.toggle('hidden', !!(state.isLinux && !startProgramIsExe));
  }

  const urlBtn = panel.querySelector('.detail-url-button');
  if (urlBtn) {
    urlBtn.classList.toggle('hidden', !game.url);
  }

  const detailDescriptionText = panel.querySelector('.detail-description-text');
  if (detailDescriptionText) {
    detailDescriptionText.textContent = game.description || t('detail_no_description', 'Keine Beschreibung hinterlegt.');
  }

  const tagsRead = panel.querySelector('.detail-tags-read[data-detail-section="tags"]');
  if (tagsRead) {
    const oldNodes = Array.from(tagsRead.querySelectorAll('.detail-tag-chip, .detail-tag-empty'));
    oldNodes.forEach((node) => node.remove());

    const normalizedTags = normalizeTagList(game.tags);
    if (!normalizedTags.length) {
      const emptyTags = document.createElement('span');
      emptyTags.className = 'detail-tag-empty';
      emptyTags.textContent = t('detail_no_tags', 'Keine Tags');
      tagsRead.appendChild(emptyTags);
    } else {
      for (const tag of normalizedTags) {
        const chip = document.createElement('span');
        chip.className = 'detail-tag-chip';
        chip.textContent = tag;
        tagsRead.appendChild(chip);
      }
    }
  }

  const rating = normalizeRating(game.rating);
  const ratingRows = panel.querySelectorAll('.detail-rating-row, .detail-rating-row.rating-row');
  ratingRows.forEach((row) => {
    row.classList.remove('rating-row-golden', 'rating-row-level-1', 'rating-row-level-2', 'rating-row-level-3', 'rating-row-level-4', 'rating-row-level-5');
    if (rating === 5) {
      row.classList.add('rating-row-golden');
    } else if (rating > 0) {
      row.classList.add(`rating-row-level-${rating}`);
    }

    const stars = row.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      star.classList.toggle('active', index + 1 <= rating);
    });
  });
}

function renderRatingStars(ratingValue, interactive, onChange, extraClass = '') {
  const currentRating = normalizeRating(ratingValue);
  const row = document.createElement('div');
  row.className = `rating-row ${extraClass}`.trim();

  if (currentRating === 5) {
    row.classList.add('rating-row-golden');
  } else if (currentRating > 0) {
    row.classList.add(`rating-row-level-${currentRating}`);
  }

  for (let value = 1; value <= 5; value += 1) {
    const star = document.createElement(interactive ? 'button' : 'span');
    if (interactive) {
      star.type = 'button';
    }
    star.className = 'rating-star';
    if (value <= currentRating) {
      star.classList.add('active');
    }

    if (interactive) {
      star.title = t('detail_star_title', '{value} Stern{plural}', {
        value,
        plural: value === 1 ? '' : 'e'
      });
      star.addEventListener('pointerdown', (event) => event.stopPropagation());
      star.addEventListener('mousedown', (event) => event.stopPropagation());
      star.addEventListener('mouseup', (event) => event.stopPropagation());
      star.addEventListener('click', (event) => {
        event.stopPropagation();
        onChange(value);
      });
    }
    star.textContent = '★';
    row.appendChild(star);
  }

  return row;
}

function syncGameCard(game) {
  const card = gridEl.querySelector(`.card[data-game-id="${CSS.escape(game.id)}"]`);
  if (!card) {
    renderGames();
    return;
  }

  const rating = normalizeRating(game.rating);
  card.dataset.rating = String(rating);
  updateCardRatingClasses(card, rating);

  const ratingRow = card.querySelector('.overview-rating');
  if (ratingRow) {
    ratingRow.classList.remove('rating-row-golden', 'rating-row-level-1', 'rating-row-level-2', 'rating-row-level-3', 'rating-row-level-4', 'rating-row-level-5');
    if (rating === 5) {
      ratingRow.classList.add('rating-row-golden');
    } else if (rating > 0) {
      ratingRow.classList.add(`rating-row-level-${rating}`);
    }
  }

  const stars = card.querySelectorAll('.overview-rating .rating-star');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index + 1 <= rating);
  });
}

function updateCardRatingClasses(card, rating) {
  card.classList.toggle('rating-card-golden', rating === 5);
  card.classList.toggle('rating-card-low', rating === 1);
}

function selectGame(gameId, openModal = false) {
  const hasChanged = state.selectedGameId !== gameId;
  state.selectedGameId = gameId;

  if (hasChanged) {
    state.detailEditGameId = null;
    state.selectedImageIndex = 0;
  }

  updateSelectedCardStyles();

  const selected = getSelectedGame();
  renderDetails(selected);

  if (openModal && selected) {
    openModalWindow();
  }
}

function openModalWindow() {
  gameModal.classList.add('open');
  gameModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  state.detailEditGameId = null;
  gameModal.classList.remove('open');
  gameModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (state.returnToSettingsAfterDetailClose) {
    state.returnToSettingsAfterDetailClose = false;
    openSettingsPanel();
  }
}