(function () {
  const PICK_TITLE = 'Datei auswaehlen';

  class FileInputElement extends HTMLElement {
    connectedCallback() {
      if (this.dataset.upgraded === '1') {
        return;
      }

      const inputId = String(this.getAttribute('input-id') || '').trim();
      const pickId = String(this.getAttribute('pick-id') || '').trim();
      if (!inputId || !pickId) {
        return;
      }

      const labelText = String(this.getAttribute('label') || '').trim();
      const placeholder = String(this.getAttribute('placeholder') || '').trim();
      const inputTitle = String(this.getAttribute('input-title') || '').trim();
      const hideLabel = String(this.getAttribute('no-label') || '').trim().toLowerCase() === 'true';

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
      pickBtn.textContent = '📄';
      pickBtn.setAttribute('title', PICK_TITLE);
      pickBtn.setAttribute('aria-label', PICK_TITLE);

      shell.appendChild(input);
      shell.appendChild(pickBtn);
      row.appendChild(shell);

      this.textContent = '';
      if (label) {
        this.appendChild(label);
      }
      this.appendChild(row);
      this.dataset.upgraded = '1';
    }
  }

  if (!window.customElements.get('file-input')) {
    window.customElements.define('file-input', FileInputElement);
  }
})();
