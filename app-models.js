class LauncherState {
  constructor() {
    this.value = {
      request: 0,
      games: [],
      extraGames: [],
      extraGamesOpenGroups: new Set(),
      archiveGamesOpenGroups: new Set(),
      visibleGames: [],
      selectedGameId: null,
      detailEditGameId: null,
      selectedImageIndex: 0,
      filterText: '',
      statusFilters: new Set(),
      ratingFilters: new Set(),
      installFilters: new Set(),
      sourceFilters: new Set(),
      metaFilters: new Set(),
      buildStatusFilters: new Set(),
      sortBy: 'lastplayed-desc',
      randomOrder: new Map(),
      language: 'eng',
      runningSessions: new Map(),
      runningSessionsTicker: null,
      useSteam: false,
      useF95Zone: false,
      vndbUseContentTags: true,
      vndbUseSexualContentTags: true,
      vndbUseTechnicalTags: true,
      vndbTagSpoilerLevel: 0,
      vndbTagDisplayMode: 'summary',
      statusMessage: '',
      statusIsError: false,
      returnToSettingsAfterDetailClose: false,
      activeJob: null,
      activeJobTitle: '',
      activeJobOperation: '',
      activeJobCancelRequested: false,
      steamSyncRunning: false,
      steamSyncCancelRequested: false,
      lastLoadedSettings: null,
      settingsDirty: false,
      cardAspectRatioMode: 'landscape-4-3',
      cardImageFitMode: 'cover',
      cardMetaPositionMode: 'below-image',
      cardTitlePositionMode: 'below-image',
      cardRatingWidthMode: 'compact',
      showCardSourceBadges: true,
      showCardBuildStatus: false,
      showMissingGameOverlay: true,
      showCardTitle: true,
      showCardStatus: true,
      showCardLastPlayed: true,
      showCardAdded: true,
      convertImagesToWebp: false,
      cardSizePercent: 100,
      enableSaveCloud: false,
      saveCloudFolder: '',
      useSharedProtonCompatDataRoot: false,
      isLinux: false,
      showCardLastPlayed,
      fetchCoversOnImport:true,
      fetchImagesOnImport:true
    };
  }
}

class LauncherConstants {
  static STATUS_FILTERS = ['not-started', 'in-progress', 'completed', 'abandoned'];
  static RATING_FILTERS = [0, 1, 2, 3, 4, 5];
  static INSTALL_FILTERS = ['ready', 'not-installed'];
  static SOURCE_FILTERS = ['archive', 'extra', 'steam'];
  static META_FILTERS = ['no-url', 'no-tags', 'no-save-location'];
  static BUILD_STATUS_FILTERS = ['completed', 'abandoned', 'on-hold', 'in-progress'];
}

class LauncherDomRefs {
  constructor(doc) {
    this.sourceInput = doc.getElementById('sourceFolder');
    this.pickSourceFolderBtn = doc.getElementById('pickSourceFolderBtn');
    this.openSourceFolderBtn = doc.getElementById('openSourceFolderBtn');
    this.exportInput = doc.getElementById('exportFolder');
    this.pickExportFolderBtn = doc.getElementById('pickExportFolderBtn');
    this.openExportFolderBtn = doc.getElementById('openExportFolderBtn');
    this.metadataInput = doc.getElementById('metadataFolder');
    this.pickMetadataFolderBtn = doc.getElementById('pickMetadataFolderBtn');
    this.openMetadataFolderBtn = doc.getElementById('openMetadataFolderBtn');
    this.protonCommandInput = doc.getElementById('protonCommand');
    this.pickProtonCommandBtn = doc.getElementById('pickProtonCommandBtn');
    this.openProtonCommandBtn = doc.getElementById('openProtonCommandBtn');
    this.protonCompatDataRootInput = doc.getElementById('protonCompatDataRoot');
    this.pickProtonCompatDataRootBtn = doc.getElementById('pickProtonCompatDataRootBtn');
    this.openProtonCompatDataRootBtn = doc.getElementById('openProtonCompatDataRootBtn');
    this.useSharedProtonCompatDataRootInput = doc.getElementById('useSharedProtonCompatDataRoot');
    this.steamSettingsField = doc.getElementById('steamSettingsField');
    this.enableSteamGamesInput = doc.getElementById('enableSteamGames');
    this.steamFolderInput = doc.getElementById('steamFolder');
    this.pickSteamFolderBtn = doc.getElementById('pickSteamFolderBtn');
    this.openSteamFolderBtn = doc.getElementById('openSteamFolderBtn');
    this.f95CookieHeaderField = doc.getElementById('f95CookieHeaderField');
    this.vndbTagContentInput = doc.getElementById('vndbTagContent');
    this.vndbTagSexualInput = doc.getElementById('vndbTagSexual');
    this.vndbTagTechnicalInput = doc.getElementById('vndbTagTechnical');
    this.vndbTagSpoilerLevelInput = doc.getElementById('vndbTagSpoilerLevel');
    this.vndbTagDisplayModeInput = doc.getElementById('vndbTagDisplayMode');
    this.enableSaveCloudInput = doc.getElementById('enableSaveCloud');
    this.saveCloudFolderInput = doc.getElementById('saveCloudFolder');
    this.pickSaveCloudFolderBtn = doc.getElementById('pickSaveCloudFolderBtn');
    this.openSaveCloudFolderBtn = doc.getElementById('openSaveCloudFolderBtn');
    this.syncAllSaveGamesBtn = doc.getElementById('syncAllSaveGamesBtn');
    this.f95CookieHeaderInput = doc.getElementById('f95CookieHeader');
    this.cardAspectRatioModeInput = doc.getElementById('cardAspectRatioMode');
    this.cardImageFitModeInput = doc.getElementById('cardImageFitMode');
    this.cardMetaPositionModeInput = doc.getElementById('cardMetaPositionMode');
    this.cardTitlePositionModeInput = doc.getElementById('cardTitlePositionMode');
    this.cardRatingWidthModeInput = doc.getElementById('cardRatingWidthMode');
    this.languageSelect = doc.getElementById('languageSelect');
    this.showCardSourceBadgesInput = doc.getElementById('showCardSourceBadges');
    this.showCardBuildStatusInput = doc.getElementById('showCardBuildStatus');
    this.showMissingGameOverlayInput = doc.getElementById('showMissingGameOverlay');
    this.showCardTitleInput = doc.getElementById('showCardTitle');
    this.showCardStatusInput = doc.getElementById('showCardStatus');
    this.showCardLastPlayedInput = doc.getElementById('showCardLastPlayed');
    this.showCardAddedInput = doc.getElementById('showCardAdded');
    
    this.fetchCoversOnImportInput = doc.getElementById('fetchCoversOnImport');
    this.fetchImagesOnImportInput = doc.getElementById('fetchImagesOnImport');

    this.convertImagesToWebpInput = doc.getElementById('convertImagesToWebp');
    this.syncSteamGamesBtn = doc.getElementById('syncSteamGamesBtn');
    this.cancelSteamSyncBtn = doc.getElementById('cancelSteamSyncBtn');
    this.convertImagesToWebpBtn = doc.getElementById('convertImagesToWebpBtn');
    this.migrationWebpAction = doc.getElementById('migrationWebpAction');
    this.checkSaveGamePathsBtn = doc.getElementById('checkSaveGamePathsBtn');
    this.loadAllMetadataFromUrlBtn = doc.getElementById('loadAllMetadataFromUrlBtn');
    this.steamSyncProgress = doc.getElementById('steamSyncProgress');
    this.steamSyncProgressBar = doc.getElementById('steamSyncProgressBar');
    this.steamSyncProgressPercent = doc.getElementById('steamSyncProgressPercent');
    this.steamSyncProgressMessage = doc.getElementById('steamSyncProgressMessage');
    this.steamSyncProgressEta = doc.getElementById('steamSyncProgressEta');
    this.toggleSettingsBtn = doc.getElementById('toggleSettingsBtn');
    this.closeSettingsBtn = doc.getElementById('closeSettingsBtn');
    this.settingsBackdrop = doc.getElementById('settingsBackdrop');
    this.settingsPage = doc.getElementById('settingsPage');
    this.settingsPanel = doc.getElementById('settingsPanel');
    this.manualGamePathInput = doc.getElementById('manualGamePathInput');
    this.pickManualGamePathBtn = doc.getElementById('pickManualGamePathBtn');
    this.openManualGamePathBtn = doc.getElementById('openManualGamePathBtn');
    this.addManualGameBtn = doc.getElementById('addManualGameBtn');
    this.addArchiveGameBtn = doc.getElementById('addArchiveGameBtn');
    this.extraGamesList = doc.getElementById('extraGamesList');
    this.archiveGamesList = doc.getElementById('archiveGamesList');
    this.statusEl = doc.getElementById('status');
    this.gridEl = doc.getElementById('grid');
    this.filterInput = doc.getElementById('filterInput');
    this.sortSelect = doc.getElementById('sortSelect');
    this.cardSizeSlider = doc.getElementById('cardSizeSlider');
    this.cardSizeValue = doc.getElementById('cardSizeValue');
    this.toggleFiltersBtn = doc.getElementById('toggleFiltersBtn');
    this.filterMenu = doc.getElementById('filterMenu');
    this.statusFilterGroup = doc.getElementById('statusFilterGroup');
    this.ratingFilterGroup = doc.getElementById('ratingFilterGroup');
    this.ratingFilterStars = doc.getElementById('ratingFilterStars');
    this.installFilterGroup = doc.getElementById('installFilterGroup');
    this.sourceFilterGroup = doc.getElementById('sourceFilterGroup');
    this.metaFilterGroup = doc.getElementById('metaFilterGroup');
    this.buildStatusFilterGroup = doc.getElementById('buildStatusFilterGroup');
    this.steamSourceFilterOption = doc.getElementById('steamSourceFilterOption');
    this.clearFiltersBtn = doc.getElementById('clearFiltersBtn');
    this.detailPanel = doc.getElementById('detailPanel');
    this.gameModal = doc.getElementById('gameModal');
    this.modalBackdrop = doc.getElementById('modalBackdrop');
    this.modalCloseBtn = doc.getElementById('modalCloseBtn');
    this.jobOverlay = doc.getElementById('jobOverlay');
    this.jobTitle = doc.getElementById('jobTitle');
    this.jobMessage = doc.getElementById('jobMessage');
    this.jobEta = doc.getElementById('jobEta');
    this.jobProgressBar = doc.getElementById('jobProgressBar');
    this.jobPercent = doc.getElementById('jobPercent');
    this.jobElapsed = doc.getElementById('jobElapsed');
    this.jobCancelBtn = doc.getElementById('jobCancelBtn');
  }
}

const state = new LauncherState().value;

const ALL_STATUS_FILTERS = LauncherConstants.STATUS_FILTERS;
const ALL_RATING_FILTERS = LauncherConstants.RATING_FILTERS;
const ALL_INSTALL_FILTERS = LauncherConstants.INSTALL_FILTERS;
const ALL_SOURCE_FILTERS = LauncherConstants.SOURCE_FILTERS;
const ALL_META_FILTERS = LauncherConstants.META_FILTERS;
const ALL_BUILD_STATUS_FILTERS = LauncherConstants.BUILD_STATUS_FILTERS;

const dom = new LauncherDomRefs(document);

const sourceInput = dom.sourceInput;
const pickSourceFolderBtn = dom.pickSourceFolderBtn;
const openSourceFolderBtn = dom.openSourceFolderBtn;
const exportInput = dom.exportInput;
const pickExportFolderBtn = dom.pickExportFolderBtn;
const openExportFolderBtn = dom.openExportFolderBtn;
const metadataInput = dom.metadataInput;
const pickMetadataFolderBtn = dom.pickMetadataFolderBtn;
const openMetadataFolderBtn = dom.openMetadataFolderBtn;
const protonCommandInput = dom.protonCommandInput;
const pickProtonCommandBtn = dom.pickProtonCommandBtn;
const openProtonCommandBtn = dom.openProtonCommandBtn;
const protonCompatDataRootInput = dom.protonCompatDataRootInput;
const pickProtonCompatDataRootBtn = dom.pickProtonCompatDataRootBtn;
const openProtonCompatDataRootBtn = dom.openProtonCompatDataRootBtn;
const useSharedProtonCompatDataRootInput = dom.useSharedProtonCompatDataRootInput;
const steamSettingsField = dom.steamSettingsField;
const enableSteamGamesInput = dom.enableSteamGamesInput;
const steamFolderInput = dom.steamFolderInput;
const pickSteamFolderBtn = dom.pickSteamFolderBtn;
const openSteamFolderBtn = dom.openSteamFolderBtn;
const f95CookieHeaderField = dom.f95CookieHeaderField;
const vndbTagContentInput = dom.vndbTagContentInput;
const vndbTagSexualInput = dom.vndbTagSexualInput;
const vndbTagTechnicalInput = dom.vndbTagTechnicalInput;
const vndbTagSpoilerLevelInput = dom.vndbTagSpoilerLevelInput;
const vndbTagDisplayModeInput = dom.vndbTagDisplayModeInput;
const enableSaveCloudInput = dom.enableSaveCloudInput;
const saveCloudFolderInput = dom.saveCloudFolderInput;
const pickSaveCloudFolderBtn = dom.pickSaveCloudFolderBtn;
const openSaveCloudFolderBtn = dom.openSaveCloudFolderBtn;
const syncAllSaveGamesBtn = dom.syncAllSaveGamesBtn;
const f95CookieHeaderInput = dom.f95CookieHeaderInput;
const cardAspectRatioModeInput = dom.cardAspectRatioModeInput;
const cardImageFitModeInput = dom.cardImageFitModeInput;
const cardMetaPositionModeInput = dom.cardMetaPositionModeInput;
const cardTitlePositionModeInput = dom.cardTitlePositionModeInput;
const cardRatingWidthModeInput = dom.cardRatingWidthModeInput;
const languageSelect = dom.languageSelect;
const showCardSourceBadgesInput = dom.showCardSourceBadgesInput;
const showCardBuildStatusInput = dom.showCardBuildStatusInput;
const showMissingGameOverlayInput = dom.showMissingGameOverlayInput;
const showCardTitleInput = dom.showCardTitleInput;
const showCardStatusInput = dom.showCardStatusInput;
const showCardLastPlayedInput = dom.showCardLastPlayedInput;
const showCardAddedInput = dom.showCardAddedInput;
const fetchCoversOnImportInput = dom.fetchCoversOnImportInput;
const fetchImagesOnImportInput = dom.fetchImagesOnImportInput;

const convertImagesToWebpInput = dom.convertImagesToWebpInput;
const syncSteamGamesBtn = dom.syncSteamGamesBtn;
const cancelSteamSyncBtn = dom.cancelSteamSyncBtn;
const convertImagesToWebpBtn = dom.convertImagesToWebpBtn;
const migrationWebpAction = dom.migrationWebpAction;
const checkSaveGamePathsBtn = dom.checkSaveGamePathsBtn;
const loadAllMetadataFromUrlBtn = dom.loadAllMetadataFromUrlBtn;
const steamSyncProgress = dom.steamSyncProgress;
const steamSyncProgressBar = dom.steamSyncProgressBar;
const steamSyncProgressPercent = dom.steamSyncProgressPercent;
const steamSyncProgressMessage = dom.steamSyncProgressMessage;
const steamSyncProgressEta = dom.steamSyncProgressEta;
const toggleSettingsBtn = dom.toggleSettingsBtn;
const closeSettingsBtn = dom.closeSettingsBtn;
const settingsBackdrop = dom.settingsBackdrop;
const settingsPage = dom.settingsPage;
const settingsPanel = dom.settingsPanel;
const manualGamePathInput = dom.manualGamePathInput;
const pickManualGamePathBtn = dom.pickManualGamePathBtn;
const openManualGamePathBtn = dom.openManualGamePathBtn;
const addManualGameBtn = dom.addManualGameBtn;
const addArchiveGameBtn = dom.addArchiveGameBtn;
const extraGamesList = dom.extraGamesList;
const archiveGamesList = dom.archiveGamesList;
const statusEl = dom.statusEl;
const gridEl = dom.gridEl;
const filterInput = dom.filterInput;
const sortSelect = dom.sortSelect;
const cardSizeSlider = dom.cardSizeSlider;
const cardSizeValue = dom.cardSizeValue;
const toggleFiltersBtn = dom.toggleFiltersBtn;
const filterMenu = dom.filterMenu;
const statusFilterGroup = dom.statusFilterGroup;
const ratingFilterGroup = dom.ratingFilterGroup;
const ratingFilterStars = dom.ratingFilterStars;
const installFilterGroup = dom.installFilterGroup;
const sourceFilterGroup = dom.sourceFilterGroup;
const metaFilterGroup = dom.metaFilterGroup;
const buildStatusFilterGroup = dom.buildStatusFilterGroup;
const steamSourceFilterOption = dom.steamSourceFilterOption;
const clearFiltersBtn = dom.clearFiltersBtn;
const detailPanel = dom.detailPanel;
const gameModal = dom.gameModal;
const modalBackdrop = dom.modalBackdrop;
const modalCloseBtn = dom.modalCloseBtn;
const jobOverlay = dom.jobOverlay;
const jobTitle = dom.jobTitle;
const jobMessage = dom.jobMessage;
const jobEta = dom.jobEta;
const jobProgressBar = dom.jobProgressBar;
const jobPercent = dom.jobPercent;
const jobElapsed = dom.jobElapsed;
const jobCancelBtn = dom.jobCancelBtn;
