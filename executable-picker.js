(function () {
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

  let overlay = null;
  let candidateList = null;
  let titleEl = null;
  let subtitleEl = null;
  let cancelBtn = null;

  function ensureOverlay() {
    if (overlay) {
      return;
    }

    overlay = document.createElement('section');
    overlay.className = 'exe-picker-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const backdrop = document.createElement('div');
    backdrop.className = 'exe-picker-backdrop';
    backdrop.addEventListener('click', hide);

    const dialog = document.createElement('article');
    dialog.className = 'exe-picker-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', tr('exe_picker_dialog_aria', 'EXE Auswahl'));

    const header = document.createElement('div');
    header.className = 'exe-picker-header';

    const textWrap = document.createElement('div');

    titleEl = document.createElement('div');
    titleEl.className = 'exe-picker-title';
    titleEl.textContent = tr('exe_picker_title', 'EXE auswaehlen');

    subtitleEl = document.createElement('div');
    subtitleEl.className = 'exe-picker-subtitle';
    subtitleEl.textContent = tr('exe_picker_subtitle_default', 'Waehle die ausfuehrbare Datei aus, die gestartet werden soll.');

    textWrap.appendChild(titleEl);
    textWrap.appendChild(subtitleEl);

    cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'secondary';
    cancelBtn.textContent = tr('dialog_confirm_cancel', 'Abbrechen');
    cancelBtn.addEventListener('click', hide);

    header.appendChild(textWrap);
    header.appendChild(cancelBtn);

    candidateList = document.createElement('div');
    candidateList.className = 'exe-picker-list';

    dialog.appendChild(header);
    dialog.appendChild(candidateList);
    overlay.appendChild(backdrop);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }

  function show(config) {
    ensureOverlay();
    const title = config?.title || tr('exe_picker_title', 'EXE auswaehlen');
    const candidates = Array.isArray(config?.candidates) ? config.candidates : [];
    const onSelect = typeof config?.onSelect === 'function' ? config.onSelect : null;
    const onCancel = typeof config?.onCancel === 'function' ? config.onCancel : null;

    titleEl.textContent = title;
    subtitleEl.textContent = candidates.length
      ? tr('exe_picker_subtitle_candidates', 'Die Treffer sind nach Wahrscheinlichkeit sortiert. Haeufig ist der erste Eintrag der richtige.')
      : tr('exe_picker_subtitle_empty', 'Keine Kandidaten gefunden.');

    candidateList.innerHTML = '';

    if (!candidates.length) {
      const empty = document.createElement('div');
      empty.className = 'exe-picker-empty';
      empty.textContent = tr('exe_picker_empty', 'Keine EXE-Dateien gefunden.');
      candidateList.appendChild(empty);
    } else {
      for (const candidate of candidates) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'exe-picker-item';
        item.innerHTML = `
          <div class="exe-picker-item-title">${escapeHtml(candidate.fileName || candidate.relativePath || tr('exe_picker_item_unknown', 'unbekannt'))}</div>
          <div class="exe-picker-item-path">${escapeHtml(candidate.relativePath || '')}</div>
          <div class="exe-picker-item-meta">Score ${escapeHtml(String(candidate.score ?? 0))}${candidate.reason ? ` · ${escapeHtml(candidate.reason)}` : ''}</div>
        `;
        item.addEventListener('click', () => {
          if (onSelect) {
            onSelect(candidate);
          }
        });
        candidateList.appendChild(item);
      }
    }

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    overlay.dataset.cancelled = 'false';
    overlay._onCancel = onCancel;
    cancelBtn.disabled = false;
  }

  function hide() {
    if (!overlay) {
      return;
    }

    const onCancel = overlay._onCancel;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.dataset.cancelled = 'true';
    overlay._onCancel = null;

    if (typeof onCancel === 'function') {
      onCancel();
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

  window.ExecutablePicker = {
    show,
    hide
  };
})();
