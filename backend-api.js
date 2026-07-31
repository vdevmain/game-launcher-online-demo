(function () {
  let requestCounter = 0;
  const pendingRequests = new Map();
  const pendingAwaitRequests = new Map();
  const DEFAULT_AWAIT_TIMEOUT_MS = 5000;

  /**
   * @typedef {
   *   | 'toggleFullscreen'
   *   | 'saveSettings'
   *   | 'syncSteamGames'
   *   | 'cancelSteamSync'
   *   | 'loadState'
   *   | 'loadUiViewState'
   *   | 'saveUiViewState'
   *   | 'refresh'
   *   | 'openFolder'
   *   | 'pickFolder'
   *   | 'pickFile'
   *   | 'openExternalUrl'
   *   | 'addExtraGame'
   *   | 'addArchiveGame'
   *   | 'replaceArchiveForGame'
   *   | 'removeExtraGame'
   *   | 'removeSteamGame'
   *   | 'loadGameCovers'
   *   | 'loadGameImages'
   *   | 'unpackGame'
   *   | 'packGame'
   *   | 'deleteUnpackedGame'
   *   | 'launchGame'
   *   | 'stopGame'
   *   | 'packDeleteUnpackedGame'
   *   | 'syncGameSaves'
   *   | 'syncAllGameSaves'
   *   | 'importFromUrl'
   *   | 'updateGameImage'
   *   | 'updateGameDetails'
   *   | 'getExecutableCandidates'
   *   | 'convertImagesToWebp'
   *   | 'checkSaveGamePaths'
   *   | 'loadAllMetadataFromUrl'
   *   | 'cancelJob'
   * } BackendAction
   */

  /**
   * @param {BackendAction} action
   * @param {object} payload
   */
  function send(action, payload) {
    const requestId = String(++requestCounter);

    window.BackendTransport.sendMessage(requestId, action, payload);
    return requestId;
  }

  /**
   * @param {BackendAction} action
   * @param {object} payload
   */
  function sendWithResponse(action, payload) {
    const requestId = send(action, payload);
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
    });
  }

  // Generic, opt-in await wrapper for any backend action: never rejects, always resolves with
  // { ok, timedOut, message } so callers can await without needing try/catch for backend errors.
  /**
   * @param {BackendAction} action
   * @param {object} [payload]
   * @param {number} [timeoutMs] pass 0 to disable the timeout (e.g. for user-driven dialogs)
   * @returns {Promise<{ok: boolean, timedOut: boolean, message: any}>}
   */
  function callAsync(action, payload, timeoutMs) {
    const requestId = send(action, payload);
    const noTimeout = timeoutMs === 0;
    const timeout = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : DEFAULT_AWAIT_TIMEOUT_MS;

    return new Promise((resolve) => {
      let settled = false;

      const timer = noTimeout ? null : setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        pendingAwaitRequests.delete(requestId);
        resolve({ ok: false, timedOut: true, message: null });
      }, timeout);

      pendingAwaitRequests.set(requestId, (parsed) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);

        const isOk = !(parsed && Object.prototype.hasOwnProperty.call(parsed, 'ok') && !parsed.ok);
        resolve({ ok: isOk, timedOut: false, message: parsed });
      });
    });
  }

  function bindMessageHandler(onMessage, onInvalidMessage) {
    window.BackendTransport.bindMessageHandler((parsed) => {

      console.log("message received from backend:", new Date(),parsed);
      if (window.MessageActions.dispatch(parsed)) {
        return;
      }

      const requestId = typeof parsed.requestId === 'string' ? parsed.requestId : null;
      if (requestId && pendingRequests.has(requestId)) {
        const pending = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'ok') && !parsed.ok) {
          pending.reject(new Error(parsed.error || 'Unknown backend error.'));
        } else {
          pending.resolve(parsed.data || {});
        }
      }

      if (requestId && pendingAwaitRequests.has(requestId)) {
        const pendingAwait = pendingAwaitRequests.get(requestId);
        pendingAwaitRequests.delete(requestId);
        pendingAwait(parsed);
      }

      if (typeof onMessage === 'function') {
        onMessage(parsed);
      }
    }, onInvalidMessage);
  }

  const BackendApi = {
    send,
    callAsync,
    bindMessageHandler,
    toggleFullscreen: () => send('toggleFullscreen', {}),
    saveSettings: (settings) => send('saveSettings', settings),
    syncSteamGames: () => send('syncSteamGames', {}),
    cancelSteamSync: () => send('cancelSteamSync', {}),
    loadState: () => send('loadState', {}),
    loadUiViewState: () => send('loadUiViewState', {}),
    saveUiViewState: (uiViewState) => send('saveUiViewState', uiViewState || {}),
    refreshState: () => send('refresh', {}),
    openFolder: (path, gameId) => send('openFolder', { path: String(path || ''), gameId: String(gameId || '') }),
    pickFolder: (initialPath, gameId) => sendWithResponse('pickFolder', { initialPath: String(initialPath || ''), gameId: String(gameId || '') }),
    pickFile: (initialPath, gameId, allowedExtensions) => sendWithResponse('pickFile', { initialPath: String(initialPath || ''), gameId: String(gameId || ''), allowedExtensions: String(allowedExtensions || '') }),
    openExternalUrl: (url) => send('openExternalUrl', { url }),
    addExtraGame: (gamePath) => send('addExtraGame', { gamePath }),
    addArchiveGame: () => send('addArchiveGame', {}),
    replaceArchiveForGame: (gameId) => send('replaceArchiveForGame', { gameId }),
    removeExtraGame: (gamePath) => send('removeExtraGame', { gamePath }),
    removeSteamGame: (gamePath) => send('removeSteamGame', { gamePath }),
    loadGameCovers: (gameIds) => send('loadGameCovers', { gameIds }),
    loadGameImages: (gameId) => send('loadGameImages', { gameId }),
    unpackGame: (gameId) => send('unpackGame', { gameId }),
    packGame: (gameId) => send('packGame', { gameId }),
    deleteUnpackedGame: (gameId) => send('deleteUnpackedGame', { gameId }),
    packDeleteUnpackedGame: (gameId) => send('packDeleteUnpackedGame', { gameId }),
    syncGameSaves: (gameId) => send('syncGameSaves', { gameId }),
    syncAllGameSaves: () => send('syncAllGameSaves', {}),
    importFromUrl: (gameId, url) => send('importFromUrl', { gameId, url }),
    updateGameImage: (payload) => send('updateGameImage', payload || {}),
    updateGameDetails: (payload) => send('updateGameDetails', payload || {}),
    getExecutableCandidates: (gameId) => sendWithResponse('getExecutableCandidates', { gameId }),
    launchGame: (gameId, executableRelativePath, saveCloudAction) => {
      const payload = { gameId };
      if (executableRelativePath) {
        payload.executableRelativePath = executableRelativePath;
      }
      if (saveCloudAction) {
        payload.saveCloudAction = saveCloudAction;
      }
      return send('launchGame', payload);
    },
    stopGame: (gameId) => send('stopGame', { gameId }),
    convertImagesToWebp: () => send('convertImagesToWebp', {}),
    checkSaveGamePaths: () => send('checkSaveGamePaths', {}),
    loadAllMetadataFromUrl: () => send('loadAllMetadataFromUrl', {}),
    cancelJob: (jobId) => send('cancelJob', { jobId })
  };

  window.BackendApi = BackendApi;
})();
