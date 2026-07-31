(function () {
  class CheckboxInputElement extends HTMLElement {
    connectedCallback() {
      if (this.dataset.upgraded === '1') {
        return;
      }

      const inputId = String(this.getAttribute('input-id') || '').trim();
      if (!inputId) {
        return;
      }

      const labelText = String(this.getAttribute('label') || '').trim();
      const rowClass = String(this.getAttribute('row-class') || 'field-checkbox-inline field-checkbox-row settings-toggle-row').trim();
      const alignModeRaw = String(this.getAttribute('align') || 'right').trim().toLowerCase();
      const alignMode = alignModeRaw === 'left' ? 'left' : 'right';
      const descriptionText = String(this.getAttribute('description') || '').trim();
      const descriptionId = String(this.getAttribute('description-id') || '').trim();
      const descriptionClass = String(this.getAttribute('description-class') || 'checkbox-input-description').trim();
      const checked = this.hasAttribute('checked');

      this.classList.add('checkbox-input-host');
      this.classList.remove('checkbox-align-left', 'checkbox-align-right');
      this.classList.add(alignMode === 'left' ? 'checkbox-align-left' : 'checkbox-align-right');

      const content = document.createElement('div');
      content.className = 'checkbox-input-root';

      const row = document.createElement('div');
      row.className = rowClass;
      row.classList.add('checkbox-input-control-row');

      const label = document.createElement('label');
      label.setAttribute('for', inputId);
      label.textContent = labelText;

      const input = document.createElement('input');
      input.id = inputId;
      input.type = 'checkbox';
      if (checked) {
        input.checked = true;
      }

      row.appendChild(label);
      row.appendChild(input);

      this.textContent = '';
      if (descriptionText) {
        const description = document.createElement('div');
        description.className = descriptionClass;
        if (descriptionId) {
          description.id = descriptionId;
        }
        description.textContent = descriptionText;
        content.appendChild(description);
      }

      content.appendChild(row);
      this.appendChild(content);
      this.dataset.upgraded = '1';
    }
  }

  if (!window.customElements.get('checkbox-input')) {
    window.customElements.define('checkbox-input', CheckboxInputElement);
  }
})();
