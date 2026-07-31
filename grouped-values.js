(function () {
  class GroupedValuesElement extends HTMLElement {
    connectedCallback() {
      if (this.dataset.upgraded === '1') {
        return;
      }

      const alignRaw = String(this.getAttribute('align') || 'left').trim().toLowerCase();
      const align = alignRaw === 'right' || alignRaw === 'center' ? alignRaw : 'left';

      const equalWidthRaw = String(this.getAttribute('equal-width') || '').trim().toLowerCase();
      const equalWidth = !(equalWidthRaw === 'false' || equalWidthRaw === '0' || equalWidthRaw === 'off');

      const legendText = String(this.getAttribute('legend') || this.getAttribute('label') || '').trim();
      const legendId = String(this.getAttribute('legend-id') || '').trim();

      const entries = Array.from(this.querySelectorAll('entry'))
        .map((entryEl) => ({
          id: String(entryEl.getAttribute('id') || '').trim(),
          value: String(entryEl.getAttribute('value') || '').trim(),
          label: String(entryEl.getAttribute('label') || entryEl.textContent || '').trim(),
          checked: entryEl.hasAttribute('checked'),
          rowId: String(entryEl.getAttribute('row-id') || '').trim()
        }))
        .filter((entry) => entry.id && entry.value);

      this.textContent = '';
      this.classList.add('grouped-values-host');

      const frame = document.createElement('fieldset');
      frame.className = 'grouped-values-frame';

      if (legendText) {
        const legend = document.createElement('legend');
        if (legendId) {
          legend.id = legendId;
        }
        legend.textContent = legendText;
        frame.appendChild(legend);
      }

      const container = document.createElement('div');
      container.className = `grouped-values-container grouped-values-align-${align}`;
      if (equalWidth) {
        container.classList.add('grouped-values-equal-width');
      }

      for (const entry of entries) {
        const row = document.createElement('div');
        row.className = 'grouped-values-entry';
        row.dataset.entryId = entry.id;
        if (entry.rowId) {
          row.id = entry.rowId;
        }

        const label = document.createElement('label');
        label.setAttribute('for', entry.id);
        label.textContent = entry.label;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = entry.id;
        input.value = entry.value;
        if (entry.checked) {
          input.checked = true;
        }

        input.addEventListener('change', () => {
          this.dispatchEvent(new CustomEvent('grouped-values-change', {
            bubbles: true,
            detail: {
              id: entry.id,
              value: entry.value,
              checked: input.checked,
              values: this.getValues()
            }
          }));
        });

        row.appendChild(label);
        row.appendChild(input);
        container.appendChild(row);
      }

      frame.appendChild(container);
      this.appendChild(frame);
      this.dataset.upgraded = '1';
    }

    // Returns the underlying <input type="checkbox"> for a given entry id or value.
    getEntryInput(idOrValue) {
      const key = String(idOrValue || '').trim();
      if (!key) {
        return null;
      }

      return this.querySelector(`#${CSS.escape(key)}`) ||
        this.querySelector(`.grouped-values-entry input[value="${CSS.escape(key)}"]`);
    }

    // Returns all entries as plain data: { id, value, checked }.
    getEntries() {
      return Array.from(this.querySelectorAll('.grouped-values-entry')).map((row) => {
        const input = row.querySelector('input[type="checkbox"]');
        return {
          id: row.dataset.entryId || (input ? input.id : ''),
          value: input ? input.value : '',
          checked: !!(input && input.checked)
        };
      });
    }

    // Returns the values of all currently checked entries.
    getValues() {
      return this.getEntries()
        .filter((entry) => entry.checked)
        .map((entry) => entry.value);
    }

    // Checks whether a specific entry (by id or value) is checked.
    isChecked(idOrValue) {
      const input = this.getEntryInput(idOrValue);
      return !!(input && input.checked);
    }

    // Sets the checked state of a single entry (by id or value).
    setChecked(idOrValue, checked) {
      const input = this.getEntryInput(idOrValue);
      if (!input) {
        return false;
      }

      input.checked = !!checked;
      return true;
    }

    // Sets checked state for all entries at once based on a list of values.
    setValues(values) {
      const wanted = new Set((Array.isArray(values) ? values : []).map((value) => String(value)));
      for (const row of this.querySelectorAll('.grouped-values-entry')) {
        const input = row.querySelector('input[type="checkbox"]');
        if (input) {
          input.checked = wanted.has(input.value);
        }
      }
    }
  }

  if (!window.customElements.get('grouped-values')) {
    window.customElements.define('grouped-values', GroupedValuesElement);
  }
})();
