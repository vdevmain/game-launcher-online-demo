// Notification and status service.
let notificationHostEl = null;
let lastNotificationHash = '';
let lastNotificationAt = 0;

// Auto-hide delay (ms) for 'info' notifications. Change this single value to adjust it.
const NOTIFICATION_AUTO_HIDE_MS = 5000;

function tr(key, fallback, params = null) {
  if (typeof window.t === 'function') {
    return window.t(key, fallback, params);
  }

  if (!params || typeof params !== 'object') {
    return fallback;
  }

  let resolved = String(fallback || '');
  for (const [name, value] of Object.entries(params)) {
    resolved = resolved.replaceAll(`{${name}}`, String(value));
  }
  return resolved;
}

function setStatus(text, isError = false) {
  state.statusMessage = text || '';
  state.statusIsError = !!isError;
  renderStatusLine();

  if (isError && String(text || '').trim()) {
    showTopNotification(String(text || '').trim(), 'error');
  }
}

function ensureNotificationHost() {
  if (notificationHostEl && document.body.contains(notificationHostEl)) {
    return notificationHostEl;
  }

  notificationHostEl = document.createElement('div');
  notificationHostEl.className = 'app-notification-host';
  document.body.appendChild(notificationHostEl);
  return notificationHostEl;
}

function showTopNotification(message, type = 'info') {
  const safeMessage = String(message || '').trim();
  if (!safeMessage) {
    return;
  }

  const now = Date.now();
  const hash = `${type}|${safeMessage}`;

  lastNotificationHash = hash;
  lastNotificationAt = now;

  const host = ensureNotificationHost();

  const toast = document.createElement('div');
  toast.className = `app-notification app-notification-${type}`;

  const textEl = document.createElement('div');
  textEl.className = 'app-notification-text';
  textEl.textContent = safeMessage;

  const closeWrap = document.createElement('div');
  closeWrap.className = 'app-notification-close-wrap';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'app-notification-close';
  closeBtn.setAttribute('aria-label', tr('notification_close_aria', 'Benachrichtigung schliessen'));
  closeBtn.textContent = '×';

  let autoHideTimer = null;
  const cancelAutoHide = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  };

  closeBtn.addEventListener('click', () => {
    cancelAutoHide();
    toast.remove();
  });

  closeWrap.appendChild(closeBtn);

  if (type === 'info' && NOTIFICATION_AUTO_HIDE_MS > 0) {
    const svgNs = 'http://www.w3.org/2000/svg';
    const ringSvg = document.createElementNS(svgNs, 'svg');
    ringSvg.setAttribute('class', 'app-notification-close-ring');
    ringSvg.setAttribute('viewBox', '0 0 30 30');

    const ringBg = document.createElementNS(svgNs, 'circle');
    ringBg.setAttribute('class', 'app-notification-close-ring-bg');
    ringBg.setAttribute('cx', '15');
    ringBg.setAttribute('cy', '15');
    ringBg.setAttribute('r', '13');

    const ringProgress = document.createElementNS(svgNs, 'circle');
    ringProgress.setAttribute('class', 'app-notification-close-ring-progress');
    ringProgress.setAttribute('cx', '15');
    ringProgress.setAttribute('cy', '15');
    ringProgress.setAttribute('r', '13');
    ringProgress.style.animationDuration = `${NOTIFICATION_AUTO_HIDE_MS}ms`;

    ringSvg.appendChild(ringBg);
    ringSvg.appendChild(ringProgress);
    closeWrap.prepend(ringSvg);

    autoHideTimer = setTimeout(() => {
      autoHideTimer = null;
      toast.remove();
    }, NOTIFICATION_AUTO_HIDE_MS);
  }

  toast.appendChild(textEl);
  toast.appendChild(closeWrap);
  host.prepend(toast);

  while (host.childElementCount > 5) {
    host.lastElementChild?.remove();
  }
}

// Caches the previously rendered running-sessions list so the 1s ticker can just
// update the elapsed-time text instead of tearing down and rebuilding the whole DOM.
let cachedRunningSessionsKey = null;
let cachedRunningTimeEls = new Map();

function renderStatusLine() {
  const isError = !!state.statusIsError;

  if (!isError && state.runningSessions.size > 0) {
    const now = Date.now();
    const entries = Array.from(state.runningSessions.entries())
      .map(([gameId, session]) => ({
        gameId,
        title: session.title || getGameTitleById(gameId) || gameId,
        cover: getGameCoverById(gameId),
        elapsedSeconds: Math.max(0, Math.floor((now - session.startedAtMs) / 1000))
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    const key = entries.map((entry) => `${entry.gameId}|${entry.title}|${entry.cover}`).join(',');
    if (key === cachedRunningSessionsKey && cachedRunningTimeEls.size === entries.length) {
      for (const entry of entries) {
        const timeEl = cachedRunningTimeEls.get(entry.gameId);
        if (timeEl) {
          timeEl.textContent = formatElapsedHhMmSs(entry.elapsedSeconds);
        }
      }
      return;
    }

    cachedRunningSessionsKey = key;
    cachedRunningTimeEls = new Map();

    statusEl.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'status-running-list';

    for (const entry of entries) {
      const item = document.createElement('div');
      item.className = 'status-running-item';

      if (entry.cover) {
        const cover = document.createElement('img');
        cover.className = 'status-running-cover';
        cover.src = entry.cover;
        cover.alt = `${entry.title} Cover`;
        item.appendChild(cover);
      } else {
        const coverFallback = document.createElement('div');
        coverFallback.className = 'status-running-cover status-running-cover-fallback';
        coverFallback.textContent = '▶';
        item.appendChild(coverFallback);
      }

      const name = document.createElement('span');
      name.className = 'status-running-name';
      name.title = entry.title;
      name.textContent = entry.title;

      const time = document.createElement('span');
      time.className = 'status-running-time';
      time.textContent = formatElapsedHhMmSs(entry.elapsedSeconds);
      cachedRunningTimeEls.set(entry.gameId, time);

      const stopBtn = document.createElement('button');
      stopBtn.type = 'button';
      stopBtn.className = 'status-running-stop';
      stopBtn.textContent = '■';
      stopBtn.title = tr('status_running_stop', 'Spiel beenden');
      stopBtn.setAttribute('aria-label', tr('status_running_stop', 'Spiel beenden'));
      stopBtn.addEventListener('click', () => {
        window.BackendApi.stopGame(entry.gameId);
      });

      item.appendChild(name);
      item.appendChild(time);
      item.appendChild(stopBtn);
      list.appendChild(item);
    }

    statusEl.appendChild(list);
    statusEl.classList.toggle('error', false);
    return;
  }

  cachedRunningSessionsKey = null;
  cachedRunningTimeEls = new Map();
  statusEl.innerHTML = '';

  const text = '';
  const summaryText = tr('toolbar_visible_count', '{visible} von {total} sichtbar', {
    visible: Array.isArray(state.visibleGames) ? state.visibleGames.length : 0,
    total: Array.isArray(state.games) ? state.games.length : 0
  });

  statusEl.textContent = summaryText;
  //statusEl.classList.toggle('error', isError);
}

function formatElapsedHhMmSs(totalSeconds) {
  const safeSeconds = Math.max(0, Math.trunc(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getGameTitleById(gameId) {
  const game = state.games.find((item) => item.id === gameId);
  return game ? game.title : '';
}

function getGameCoverById(gameId) {
  const game = state.games.find((item) => item.id === gameId);
  return game && game.coverImageDataUrl ? game.coverImageDataUrl : '';
}

function ensureRunningSessionsTicker() {
  if (state.runningSessionsTicker || state.runningSessions.size === 0) {
    return;
  }

  state.runningSessionsTicker = window.setInterval(() => {
    renderStatusLine();
  }, 1000);
}

function stopRunningSessionsTickerIfIdle() {
  if (state.runningSessions.size > 0 || !state.runningSessionsTicker) {
    return;
  }

  window.clearInterval(state.runningSessionsTicker);
  state.runningSessionsTicker = null;
}

function markGameSessionStarted(gameId, title = '') {
  if (!gameId) {
    return;
  }

  state.runningSessions.set(gameId, {
    title: title || getGameTitleById(gameId),
    startedAtMs: Date.now()
  });

  ensureRunningSessionsTicker();
  renderStatusLine();
  syncRunningGameCard(gameId);
}

function markGameSessionStopped(gameId) {
  if (!gameId) {
    return;
  }

  state.runningSessions.delete(gameId);
  stopRunningSessionsTickerIfIdle();
  renderStatusLine();
  syncRunningGameCard(gameId);
}

function syncRunningGameCard(gameId) {
  if (typeof syncGameCardContent !== 'function') {
    return;
  }

  const game = state.games.find((item) => item.id === gameId);
  if (game) {
    syncGameCardContent(game);
  }
}
