(function () {
  const OPEN_TEXT = 'Öffnen';
  const PICK_TITLE = 'Ordner auswählen';
  const OPEN_TITLE = 'Ordner öffnen';

  function translate(key, fallback, vars) {
    if (typeof window.t !== 'function') {
      return String(fallback || '');
    }
    return window.t(key, fallback, vars);
  }

  function setStatusMessage(message, isError) {
    if (typeof window.setStatus !== 'function') {
      return;
    }
    window.setStatus(message, !!isError);
  }

  class FolderInputElement extends HTMLElement {
    getLabelText() {
      const labelKey = String(this.getAttribute('status-label-key') || '').trim();
      const labelFallback = String(this.getAttribute('status-label') || this.getAttribute('label') || '').trim();
      const inputId = String(this.getAttribute('input-id') || '').trim();
      if (inputId) {
        const dynamicLabel = this.querySelector(`label[for="${inputId}"]`);
        const dynamicLabelText = String(dynamicLabel?.textContent || '').trim();
        if (dynamicLabelText) {
          return dynamicLabelText;
        }
      }
      if (!labelKey) {
        return labelFallback;
      }
      return translate(labelKey, labelFallback);
    }

    dispatchInputChanged(input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async openFolderFromInput(input) {
      const label = this.getLabelText();
      const rawPath = String(input?.value || '').trim();
      const gameId = String(this.getAttribute('game-id') || '').trim();
      if (!rawPath) {
        setStatusMessage(
          translate('settings_open_folder_path_required', 'Bitte zuerst einen Pfad fuer {label} eingeben.', { label }),
          true
        );
        input?.focus();
        return;
      }

      setStatusMessage(translate('settings_open_folder_running', 'Oeffne {label}...', { label }));
      const result = await window.BackendApi.callAsync('openFolder', { path: rawPath, gameId });
      if (result.timedOut) {
        setStatusMessage(translate('settings_open_folder_failed', 'Ordner konnte nicht geoeffnet werden.'), true);
        return;
      }

      if (!result.ok) {
        const errorMessage = String(result.message?.error || '').trim();
        setStatusMessage(errorMessage || translate('settings_open_folder_failed', 'Ordner konnte nicht geoeffnet werden.'), true);
      }
    }

    async pickFolderIntoInput(input) {
      const label = this.getLabelText();
      const initialPath = String(input?.value || '').trim();
      const gameId = String(this.getAttribute('game-id') || '').trim();
      const result = await window.BackendApi.callAsync('pickFolder', { initialPath, gameId }, 0);

      if (result.timedOut) {
        setStatusMessage(translate('settings_folder_pick_failed', 'Ordnerauswahl fehlgeschlagen.'), true);
        return;
      }

      if (!result.ok) {
        const errorMessage = String(result.message?.error || '').trim();
        setStatusMessage(errorMessage || translate('settings_folder_pick_failed', 'Ordnerauswahl fehlgeschlagen.'), true);
        return;
      }

      const payload = result.message?.data || result.message || {};
      if (payload.cancelled) {
        return;
      }

      const selectedPath = String(payload.path || '').trim();
      if (!selectedPath) {
        return;
      }

      input.value = selectedPath;
      this.dispatchInputChanged(input);
      setStatusMessage(translate('settings_folder_selected', '{label} ausgewaehlt.', { label }));
    }

    connectedCallback() {
      if (this.dataset.upgraded === '1') {
        return;
      }

      const inputId = String(this.getAttribute('input-id') || '').trim();
      const pickId = String(this.getAttribute('pick-id') || '').trim();
      const openId = String(this.getAttribute('open-id') || '').trim();
      if (!inputId || !pickId || !openId) {
        return;
      }

      const labelText = String(this.getAttribute('label') || '').trim();
      const placeholder = String(this.getAttribute('placeholder') || '').trim();
      const inputValue = String(this.getAttribute('value') || '');
      const inputTitle = String(this.getAttribute('input-title') || '').trim();
      const hideLabel = String(this.getAttribute('no-label') || '').trim().toLowerCase() === 'true';
      const descriptionText = String(this.getAttribute('description') || '').trim();
      const descriptionId = String(this.getAttribute('description-id') || '').trim();
      const descriptionClass = String(this.getAttribute('description-class') || 'checkbox-input-description').trim();

      let label = null;
      if (!hideLabel) {
        label = document.createElement('label');
        label.setAttribute('for', inputId);
        label.textContent = labelText;
      }

      const row = document.createElement('div');
      row.className = 'settings-path-input-row';

      const shell = document.createElement('div');
      shell.className = 'settings-path-input-shell';

      const input = document.createElement('input');
      input.id = inputId;
      input.type = 'text';
      input.value = inputValue;
      if (placeholder) {
        input.placeholder = placeholder;
      }
      if (inputTitle) {
        input.title = inputTitle;
      }

      const pickBtn = document.createElement('button');
      pickBtn.id = pickId;
      pickBtn.className = 'secondary settings-path-pick-btn';
      pickBtn.type = 'button';
      pickBtn.textContent = '📂';
      pickBtn.setAttribute('title', PICK_TITLE);
      pickBtn.setAttribute('aria-label', PICK_TITLE);

      const openBtn = document.createElement('button');
      openBtn.id = openId;
      openBtn.className = 'secondary settings-path-open-btn';
      openBtn.type = 'button';
      openBtn.textContent = OPEN_TEXT;
      openBtn.setAttribute('title', OPEN_TITLE);
      openBtn.setAttribute('aria-label', OPEN_TITLE);

      pickBtn.addEventListener('click', async () => {
        if (!window.BackendApi || typeof window.BackendApi.callAsync !== 'function') {
          return;
        }
        await this.pickFolderIntoInput(input);
      });

      openBtn.addEventListener('click', async () => {
        if (!window.BackendApi || typeof window.BackendApi.callAsync !== 'function') {
          return;
        }
        await this.openFolderFromInput(input);
      });

      shell.appendChild(input);
      shell.appendChild(pickBtn);
      row.appendChild(shell);
      row.appendChild(openBtn);

      this.textContent = '';
      if (descriptionText) {
        const description = document.createElement('div');
        description.className = descriptionClass;
        if (descriptionId) {
          description.id = descriptionId;
        }
        description.textContent = descriptionText;
        this.appendChild(description);
      }
      if (label) {
        this.appendChild(label);
      }
      this.appendChild(row);
      this.dataset.upgraded = '1';
    }
  }

  if (!window.customElements.get('folder-input')) {
    window.customElements.define('folder-input', FolderInputElement);
  }
})();
