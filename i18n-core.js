// Localization runtime (CSV-loaded languages + frontend switching).
function getLocalizationEntry(id) {
  const entries = state.localization && state.localization.entries ? state.localization.entries : {};
  return entries[id] || null;
}

function resolveLanguageCode(candidate) {
  const code = String(candidate || '').trim().toLowerCase();
  const languages = Array.isArray(state.localization?.languages) ? state.localization.languages : [];
  if (languages.some((item) => String(item.code || '').toLowerCase() === code)) {
    return code;
  }

  const fallback = String(state.localization?.defaultLanguage || 'eng').toLowerCase();
  if (languages.some((item) => String(item.code || '').toLowerCase() === fallback)) {
    return fallback;
  }

  return languages.length ? String(languages[0].code || 'eng').toLowerCase() : 'eng';
}

function t(id, fallback = '', params = null) {
  const activeLanguage = resolveLanguageCode(state.language);
  const entry = getLocalizationEntry(id);
  let text = fallback;

  if (entry && Object.prototype.hasOwnProperty.call(entry, activeLanguage)) {
    text = String(entry[activeLanguage] || fallback || '');
  }

  if (!params || typeof params !== 'object') {
    return text.replace(/\\n/g, '\n');
  }

  let resolved = text;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replaceAll(`{${key}}`, String(value));
  }
  return resolved.replace(/\\n/g, '\n');
}

function setText(selector, key, fallback) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  element.textContent = t(key, fallback);
}

function setAttr(selector, attributeName, key, fallback) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  element.setAttribute(attributeName, t(key, fallback));
}

function setOptionText(selectSelector, optionValue, key, fallback) {
  const select = document.querySelector(selectSelector);
  if (!select) {
    return;
  }
  const option = select.querySelector(`option[value="${CSS.escape(optionValue)}"]`);
  if (!option) {
    return;
  }
  option.textContent = t(key, fallback);
}

function setLabelTextFor(inputId, key, fallback) {
  const label = document.querySelector(`label[for="${CSS.escape(inputId)}"]`);
  if (!label) {
    return;
  }
  label.textContent = t(key, fallback);
}

function setCheckboxLabelText(selector, key, fallback) {
  const label = document.querySelector(selector);
  if (!label) {
    return;
  }

  const input = label.querySelector('input');
  const text = ` ${t(key, fallback)}`;
  if (!input) {
    label.textContent = t(key, fallback);
    return;
  }

  // Keep input node and only replace the attached text.
  let textNode = null;
  for (const node of label.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNode = node;
      break;
    }
  }

  if (!textNode) {
    textNode = document.createTextNode(text);
    label.appendChild(textNode);
  } else {
    textNode.nodeValue = text;
  }
}

function setCardSizeLabelText() {
  const label = document.querySelector('label[for="cardSizeSlider"]');
  if (!label) {
    return;
  }

  const valueNode = label.querySelector('#cardSizeValue');
  if (!valueNode) {
    label.textContent = t('toolbar_card_size', 'Kartengroesse');
    return;
  }

  // Replace only the text node before the percentage span.
  const translated = `${t('toolbar_card_size', 'Kartengroesse')} `;
  if (label.firstChild && label.firstChild.nodeType === Node.TEXT_NODE) {
    label.firstChild.nodeValue = translated;
  } else {
    label.insertBefore(document.createTextNode(translated), valueNode);
  }
}

function setRatingFilterStarTitles() {
  const stars = document.querySelectorAll('#ratingFilterStars .rating-filter-star, #ratingFilterStars .rating-filter-zero');
  stars.forEach((star) => {
    const raw = Number.parseInt(String(star.dataset.rating || ''), 10);
    if (!Number.isFinite(raw)) {
      return;
    }

    const title = t('filter_rating_star_title', '{count} Stern{plural}', {
      count: raw,
      plural: raw === 1 ? '' : 'e'
    });
    star.setAttribute('title', title);
    star.setAttribute('aria-label', title);
  });
}

function localizeStaticUi() {
  setText('#toggleSettingsBtn', 'settings_title', 'Einstellungen');
  setAttr('#settingsPage .settings-page-window', 'aria-label', 'settings_title', 'Einstellungen');
  setText('#settingsPage .settings-page-header h2', 'settings_title', 'Einstellungen');
  setText('#saveBtn', 'detail_btn_save', 'Speichern');
  setAttr('#refreshBtn', 'title', 'settings_refresh_title', 'Neu laden');
  setAttr('#refreshBtn', 'aria-label', 'settings_refresh_title', 'Neu laden');
  setAttr('#closeSettingsBtn', 'aria-label', 'settings_close_title', 'Einstellungen schliessen');
  setAttr('.settings-tabs', 'aria-label', 'settings_sections_aria', 'Einstellungsbereiche');
  setText('#settingsTabGeneral', 'settings_tab_general', 'Allgemein');
  setText('#settingsTabLinux', 'settings_tab_linux', 'Linux');
  setText('#settingsTabArchive', 'settings_tab_archive', 'Archive');
  setText('#settingsTabSteam', 'settings_tab_steam', 'Steam');
  setText('#settingsTabExtra', 'settings_tab_extra', 'Extra Games');
  setText('#settingsTabVndb', 'settings_tab_vndb', 'VNDB');
  setText('#settingsTabF95Zone', 'settings_tab_f95', 'F95Zone');
  setText('#settingsTabMigration', 'settings_tab_migration', 'Migration');

  setLabelTextFor('metadataFolder', 'settings_info_folder_label', 'Info-Ordner (JSON/Bilder)');
  setText('#openMetadataFolderBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openMetadataFolderBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openMetadataFolderBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickMetadataFolderBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickMetadataFolderBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');

  setLabelTextFor('protonCommand', 'settings_proton_path_label', 'Linux Proton-Pfad');
  setAttr('#protonCommand', 'title', 'settings_proton_title', 'Beispiel: proton oder voller Pfad zur Proton-Startdatei. Dieser Wert wird an das Startskript uebergeben.');
  setText('#openProtonCommandBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openProtonCommandBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openProtonCommandBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickProtonCommandBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickProtonCommandBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setLabelTextFor('protonCompatDataRoot', 'settings_compatdata_label', 'Linux CompatData-Ordner');
  setAttr('#protonCompatDataRoot', 'title', 'settings_compatdata_title', 'Beispiel: /home/user/.local/share/gamelauncher/compatdata. Pro Spiel wird darunter ein eigener Prefix angelegt.');
  setText('#openProtonCompatDataRootBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openProtonCompatDataRootBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openProtonCompatDataRootBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickProtonCompatDataRootBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickProtonCompatDataRootBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setLabelTextFor('useSharedProtonCompatDataRoot', 'settings_shared_compat_enabled', 'single compdata folder');
  setText('#useSharedProtonCompatDataRootDescription', 'settings_shared_compat_description', 'verwende fuer jedes spiel den gleichen compdata ordern anstelle eines seperaten pro spiel.');

  setLabelTextFor('enableSaveCloud', 'settings_save_cloud_enabled', 'Save Cloud aktiv');
  setLabelTextFor('saveCloudFolder', 'settings_save_cloud_folder_label', 'Save-Cloud-Ordner');
  setText('#syncAllSaveGamesBtn', 'settings_sync_all_saves', 'Alle Saves synchronisieren');
  setText('#openSaveCloudFolderBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openSaveCloudFolderBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openSaveCloudFolderBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickSaveCloudFolderBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickSaveCloudFolderBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');

  setLabelTextFor('cardAspectRatioMode', 'settings_card_format', 'Kartenformat');
  setOptionText('#cardAspectRatioMode', 'landscape-4-3', 'settings_card_format_43', '4:3');
  setOptionText('#cardAspectRatioMode', 'landscape-16-9', 'settings_card_format_169', '16:9');
  setOptionText('#cardAspectRatioMode', 'portrait-3-4', 'settings_card_format_34', '3:4');
  setOptionText('#cardAspectRatioMode', 'square-1-1', 'settings_card_format_11', '1:1');
  setOptionText('#cardAspectRatioMode', 'steam-standard', 'settings_card_format_steam', 'Steam Standard (2:3)');

  setLabelTextFor('cardImageFitMode', 'settings_image_fit', 'Bildanpassung');
  setOptionText('#cardImageFitMode', 'cover', 'settings_image_fit_cover', 'Cover (fuellen, Zuschneiden)');
  setOptionText('#cardImageFitMode', 'contain', 'settings_image_fit_contain', 'Contain (vollstaendig anzeigen)');
  setLabelTextFor('cardMetaPositionMode', 'settings_card_meta_position', 'Karten-Metaposition');
  setOptionText('#cardMetaPositionMode', 'below-image', 'settings_card_meta_position_below', 'Unter dem Bild');
  setOptionText('#cardMetaPositionMode', 'image-bottom-overlay', 'settings_card_meta_position_overlay', 'Im Bild unten');
  setLabelTextFor('cardTitlePositionMode', 'settings_card_title_position', 'Titelposition');
  setOptionText('#cardTitlePositionMode', 'below-image', 'settings_card_title_position_below', 'Unter dem Bild');
  setOptionText('#cardTitlePositionMode', 'image-overlay', 'settings_card_title_position_overlay', 'Auf dem Bild');
  setLabelTextFor('cardRatingWidthMode', 'settings_card_rating_width', 'Bewertungssterne');
  setOptionText('#cardRatingWidthMode', 'compact', 'settings_card_rating_width_compact', 'Kleine Sterne');
  setOptionText('#cardRatingWidthMode', 'full-width', 'settings_card_rating_width_full', 'Volle Kartenbreite');

  setLabelTextFor('languageSelect', 'language_label', 'Sprache');
  setLabelTextFor('showCardSourceBadges', 'settings_show_source_badges', 'Quellen-Badges anzeigen');
  setLabelTextFor('showCardBuildStatus', 'settings_show_build_status', 'Build-Status anzeigen');
  setLabelTextFor('showMissingGameOverlay', 'settings_show_missing_overlay', 'Fehlend-Markierung anzeigen');
  setLabelTextFor('showCardTitle', 'settings_show_title', 'Titel anzeigen');
  setLabelTextFor('showCardStatus', 'settings_show_status', 'Status anzeigen');
  setLabelTextFor('showCardLastPlayed', 'settings_show_lastplayed', 'Zuletzt gespielt anzeigen');
  setLabelTextFor('showCardAdded', 'settings_show_added', 'Hinzugefuegt anzeigen');

  setLabelTextFor('fetchCoversOnImport', 'settings_fetch_covers', 'Fetch Covers on Import');
  setLabelTextFor('fetchImagesOnImport', 'settings_fetch_images', 'Fetch Additional images on Import');

  setLabelTextFor('convertImagesToWebp', 'settings_convert_images_to_webp', 'Bilder zu WebP konvertieren');
  setText('#convertImagesToWebpDescription', 'settings_convert_images_to_webp_description', 'Achtung: Die automatische Konvertierung kann von Antivirenprogrammen fälschlicherweise als Bedrohung erkannt werden.');

  setLabelTextFor('sourceFolder', 'settings_archive_folder_label', 'Archiv-Ordner (zip/7z/rar)');
  setText('#openSourceFolderBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openSourceFolderBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openSourceFolderBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickSourceFolderBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickSourceFolderBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');

  setLabelTextFor('exportFolder', 'settings_export_folder_label', 'Export-Ordner (Entpackziel)');
  setText('#openExportFolderBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openExportFolderBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openExportFolderBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickExportFolderBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickExportFolderBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setText('#addArchiveGameBtn', 'settings_add_archive_game', 'Archiv-Spiel hinzufuegen');

  setLabelTextFor('enableSteamGames', 'settings_steam_enabled', 'Steam aktiv');
  setLabelTextFor('steamFolder', 'settings_steam_folder_label', 'Steam-Ordner');
  setText('#steamFolderDescription', 'settings_steam_folder_description', 'Bitte Steam Hauptordner auswählen');
  setText('#openSteamFolderBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openSteamFolderBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openSteamFolderBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickSteamFolderBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickSteamFolderBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');

  setText('#syncSteamGamesBtn', 'settings_sync_steam', 'Sync Steam Spiele');
  setText('#cancelSteamSyncBtn', 'settings_cancel_steam_sync', 'Steam-Sync abbrechen');
  setText('#settingsTabPanelExtra h3', 'settings_extra_title', 'Spiele ohne ZIP (manuell)');
  setAttr('#manualGamePathInput', 'placeholder', 'settings_manual_game_placeholder', 'C:\\Games\\MeinSpiel oder C:\\Games\\Sammlung\\*');
  setText('#openManualGamePathBtn', 'settings_open_button', 'Öffnen');
  setAttr('#openManualGamePathBtn', 'title', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#openManualGamePathBtn', 'aria-label', 'settings_open_folder_title', 'Ordner öffnen');
  setAttr('#pickManualGamePathBtn', 'title', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setAttr('#pickManualGamePathBtn', 'aria-label', 'settings_pick_folder_title', 'Ordner auswaehlen');
  setText('#addManualGameBtn', 'settings_add_manual_game', 'Spielordner hinzufuegen');

  setLabelTextFor('f95CookieHeader', 'settings_f95_cookie_label', 'F95 Cookie Header (optional)');
  setAttr('#f95CookieHeader', 'title', 'settings_f95_cookie_title', 'Wird fuer F95-Metadatenabruf als Cookie-Header mitgeschickt.');

  setText('#migrationWebpTitle', 'settings_migration_webp_title', 'Alle Bilder auf WebP konvertieren');
  setText('#migrationWebpDescription', 'settings_migration_webp_description', 'Durchsucht alle Spiele und konvertiert Cover-/Galeriebilder wenn moeglich zu WebP.');
  setText('#convertImagesToWebpBtn', 'settings_migration_webp_button', 'Konvertieren');
  setText('#migrationSavePathTitle', 'settings_migration_save_path_title', 'Save-Datei-Pfad pruefen');
  setText('#migrationSavePathDescription', 'settings_migration_save_path_description', 'Sucht fehlende Save-Pfade automatisch und migriert alte, absolute Pfade auf das aktuelle portable Format.');
  setText('#checkSaveGamePathsBtn', 'settings_migration_save_path_button', 'Pruefen');
  setText('#migrationMetadataTitle', 'settings_migration_metadata_title', 'Metadaten von URL neu laden');
  setText('#migrationMetadataDescription', 'settings_migration_metadata_description', 'Laedt fuer jedes Spiel mit hinterlegter URL die Metadaten neu (der Titel bleibt dabei unveraendert).');
  setText('#loadAllMetadataFromUrlBtn', 'settings_migration_metadata_button', 'Neu laden');
  setText('#jobCancelBtn', 'job_cancel_button', 'Abbrechen');

  setText('#vndbTagCategoriesLegend', 'settings_vndb_tag_categories', 'Verwendete Tag-Kategorien');
  setLabelTextFor('vndbTagContent', 'settings_vndb_tag_content', 'Content');
  setLabelTextFor('vndbTagSexual', 'settings_vndb_tag_sexual', 'Sexual content');
  setLabelTextFor('vndbTagTechnical', 'settings_vndb_tag_technical', 'Technical');
  setLabelTextFor('vndbTagSpoilerLevel', 'settings_vndb_spoiler_label', 'Tag-Spoilerlevel');
  setOptionText('#vndbTagSpoilerLevel', '0', 'settings_vndb_spoiler_0', 'Keine Spoiler');
  setOptionText('#vndbTagSpoilerLevel', '1', 'settings_vndb_spoiler_1', 'Minor Spoiler');
  setOptionText('#vndbTagSpoilerLevel', '2', 'settings_vndb_spoiler_2', 'Spoil me');
  setLabelTextFor('vndbTagDisplayMode', 'settings_vndb_mode_label', 'Tag-Modus');
  setOptionText('#vndbTagDisplayMode', 'summary', 'settings_vndb_mode_summary', 'Summary');
  setOptionText('#vndbTagDisplayMode', 'all', 'settings_vndb_mode_all', 'All');

  setLabelTextFor('filterInput', 'toolbar_filter', 'Filter');
  setAttr('#filterInput', 'placeholder', 'toolbar_filter_placeholder', 'Titel, Beschreibung, Datei...');
  setLabelTextFor('sortSelect', 'toolbar_sort', 'Sortierung');
  setOptionText('#sortSelect', 'lastplayed-desc', 'toolbar_sort_lastplayed', 'Zuletzt gespielt');
  setOptionText('#sortSelect', 'rating-desc', 'toolbar_sort_rating_desc', 'Sterne (absteigend)');
  setOptionText('#sortSelect', 'rating-asc', 'toolbar_sort_rating_asc', 'Sterne (aufsteigend)');
  setOptionText('#sortSelect', 'playedhours-desc', 'toolbar_sort_played_desc', 'Gespielte Stunden (absteigend)');
  setOptionText('#sortSelect', 'playedhours-asc', 'toolbar_sort_played_asc', 'Gespielte Stunden (aufsteigend)');
  setOptionText('#sortSelect', 'title-asc', 'toolbar_sort_title_asc', 'Titel A-Z');
  setOptionText('#sortSelect', 'title-desc', 'toolbar_sort_title_desc', 'Titel Z-A');
  setOptionText('#sortSelect', 'added-desc', 'toolbar_sort_added_desc', 'Neueste zuerst');
  setOptionText('#sortSelect', 'added-asc', 'toolbar_sort_added_asc', 'Aelteste zuerst');
  setOptionText('#sortSelect', 'random', 'toolbar_sort_random', 'Zufaellig');

  setCardSizeLabelText();
  setAttr('#cardSizeSlider', 'aria-label', 'toolbar_card_size', 'Kartengroesse');
  setAttr('#toggleFiltersBtn', 'title', 'toolbar_filter_menu_title', 'Filtermenu anzeigen');
  setAttr('#toggleFiltersBtn', 'aria-label', 'toolbar_filter_menu_title', 'Filtermenu anzeigen');
  setAttr('#clearFiltersBtn', 'title', 'toolbar_clear_filters_title', 'Filter loeschen');
  setAttr('#clearFiltersBtn', 'aria-label', 'toolbar_clear_filters_title', 'Filter loeschen');

  setText('#statusFilterGroup legend', 'filter_status', 'Status');
  setLabelTextFor('statusFilterNotStarted', 'filter_status_not_started', 'Noch nicht gestartet');
  setLabelTextFor('statusFilterInProgress', 'filter_status_in_progress', 'Playing');
  setLabelTextFor('statusFilterCompleted', 'filter_status_completed', 'Abgeschlossen');

  setText('#ratingFilterGroup legend', 'filter_rating', 'Bewertung');
  setAttr('#ratingFilterStars', 'aria-label', 'filter_rating_aria', 'Sternebewertung filtern');
  setRatingFilterStarTitles();
  setText('#installFilterGroup legend', 'filter_install', 'Installation');
  setLabelTextFor('installFilterReady', 'filter_install_ready', 'Spielbereit');
  setLabelTextFor('installFilterNotInstalled', 'filter_install_not_installed', 'Nicht installiert');

  setText('#sourceFilterGroup legend', 'filter_source', 'Quelle');
  setLabelTextFor('sourceFilterArchive', 'filter_source_archive', 'Archive Spiele');
  setLabelTextFor('sourceFilterExtra', 'filter_source_extra', 'Extra Spiele');
  setLabelTextFor('sourceFilterSteam', 'filter_source_steam', 'Steam Spiele');

  setText('#metaFilterGroup legend', 'filter_meta', 'Metadaten');
  setLabelTextFor('metaFilterNoUrl', 'filter_meta_no_url', 'Spiele ohne URL');
  setLabelTextFor('metaFilterNoTags', 'filter_meta_no_tags', 'Spiele ohne Tags');
  setLabelTextFor('metaFilterNoSaveLocation', 'filter_meta_no_save', 'Spiele ohne Save Location');

  setText('#buildStatusFilterGroup legend', 'filter_build_values', 'Build-Status Werte');
  setLabelTextFor('buildStatusFilterInProgress', 'build_status_in_progress', 'In Progress');
  setLabelTextFor('buildStatusFilterOnHold', 'build_status_on_hold', 'On Hold');
  setLabelTextFor('buildStatusFilterAbandoned', 'build_status_abandoned', 'Abandoned');
  setLabelTextFor('buildStatusFilterCompleted', 'build_status_completed', 'Completed');

  setAttr('#gameModal .modal-window', 'aria-label', 'modal_details_aria', 'Spieldetails');
  setAttr('#modalCloseBtn', 'aria-label', 'modal_close_title', 'Schliessen');
}

function populateLanguageSelect() {
  if (!languageSelect) {
    return;
  }

  const languages = Array.isArray(state.localization?.languages) ? state.localization.languages : [];
  languageSelect.innerHTML = '';
  for (const language of languages) {
    const code = String(language.code || '').trim().toLowerCase();
    if (!code) {
      continue;
    }

    const option = document.createElement('option');
    option.value = code;
    option.textContent = String(language.label || code);
    languageSelect.appendChild(option);
  }

  languageSelect.value = resolveLanguageCode(state.language);
}

function applyLocalizationBundle(bundle) {
  const source = bundle || {};
  const languages = Array.isArray(source.languages) ? source.languages : [];
  const entries = source.entries && typeof source.entries === 'object' ? source.entries : {};
  state.localization = {
    defaultLanguage: String(source.defaultLanguage || 'eng').toLowerCase(),
    languages: languages
      .map((item) => ({
        code: String(item.code || '').trim().toLowerCase(),
        label: String(item.label || '').trim()
      }))
      .filter((item) => item.code.length > 0),
    entries
  };

  if (!state.localization.languages.length) {
    state.localization.languages = [{ code: 'eng', label: 'English' }];
    state.localization.defaultLanguage = 'eng';
  }

  state.language = resolveLanguageCode(state.language);
  populateLanguageSelect();
  localizeStaticUi();
}

function applyLanguage(languageCode) {
  state.language = resolveLanguageCode(languageCode);
  if (languageSelect) {
    languageSelect.value = state.language;
  }

  localizeStaticUi();
  if (typeof renderSettingsGameLists === 'function') {
    renderSettingsGameLists();
  }
  if (typeof renderGames === 'function') {
    renderGames();
  }
}

window.t = t;
window.applyLocalizationBundle = applyLocalizationBundle;
window.applyLanguage = applyLanguage;


window.applyLocalizationBundle(Localization);