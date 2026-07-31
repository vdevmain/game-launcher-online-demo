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

  class StandardYesNoDialog {
    constructor(doc) {
      this.doc = doc;
      this.overlay = null;
      this.titleEl = null;
      this.messageEl = null;
      this.noBtn = null;
      this.yesBtn = null;
      this.cancelBtn = null;
      this.currentResolver = null;
      this.currentDismissValue = false;
      this.currentCancelValue = false;
      this.boundOnKeyDown = this.onKeyDown.bind(this);
      this.defaultScheme = {
        yes: 'orange',
        no: 'blue'
      };
      this.allowedSchemes = new Set(['blue', 'orange', 'darkred', 'green']);
    }

    ensureDom() {
      if (this.overlay) {
        return;
      }

      this.overlay = this.doc.createElement('section');
      this.overlay.className = 'confirm-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');

      const backdrop = this.doc.createElement('div');
      backdrop.className = 'confirm-backdrop';
      backdrop.addEventListener('click', () => this.resolve(this.currentDismissValue));

      const dialog = this.doc.createElement('article');
      dialog.className = 'confirm-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', tr('dialog_confirm_aria', 'Bestaetigung'));

      this.titleEl = this.doc.createElement('div');
      this.titleEl.className = 'confirm-title';
      this.titleEl.textContent = tr('dialog_confirm_title', 'Sicherheitsabfrage');

      this.messageEl = this.doc.createElement('div');
      this.messageEl.className = 'confirm-message';
      this.messageEl.textContent = tr('dialog_confirm_message', 'Bist du sicher?');

      const actions = this.doc.createElement('div');
      actions.className = 'confirm-actions';

      this.yesBtn = this.doc.createElement('button');
      this.yesBtn.type = 'button';
      this.yesBtn.className = 'confirm-btn';
      this.yesBtn.textContent = tr('dialog_confirm_yes', 'Ja');
      this.yesBtn.addEventListener('click', () => this.resolve(true));

      this.noBtn = this.doc.createElement('button');
      this.noBtn.type = 'button';
      this.noBtn.className = 'confirm-btn';
      this.noBtn.textContent = tr('dialog_confirm_no', 'Nein');
      this.noBtn.addEventListener('click', () => this.resolve(false));

      this.cancelBtn = this.doc.createElement('button');
      this.cancelBtn.type = 'button';
      this.cancelBtn.className = 'secondary hidden';
      this.cancelBtn.textContent = tr('dialog_confirm_cancel', 'Abbrechen');
      this.cancelBtn.addEventListener('click', () => this.resolve(this.currentCancelValue));

      actions.appendChild(this.yesBtn);
      actions.appendChild(this.noBtn);
      actions.appendChild(this.cancelBtn);

      dialog.appendChild(this.titleEl);
      dialog.appendChild(this.messageEl);
      dialog.appendChild(actions);

      this.overlay.appendChild(backdrop);
      this.overlay.appendChild(dialog);
      this.doc.body.appendChild(this.overlay);
    }

    confirm(options) {
      this.ensureDom();

      if (this.currentResolver) {
        this.resolve(false);
      }

      const title = String(options?.title || tr('dialog_confirm_title', 'Sicherheitsabfrage'));
      const message = String(options?.message || tr('dialog_confirm_message', 'Bist du sicher?'));
      const yesText = String(options?.yesText || tr('dialog_confirm_yes', 'Ja'));
      const noText = String(options?.noText || tr('dialog_confirm_no', 'Nein'));
      const showCancel = !!options?.showCancel;
      const cancelText = String(options?.cancelText || tr('dialog_confirm_cancel', 'Abbrechen'));
      const yesScheme = this.normalizeScheme(options?.yesColorScheme, this.defaultScheme.yes);
      const noScheme = this.normalizeScheme(options?.noColorScheme, this.defaultScheme.no);
      this.currentDismissValue = Object.prototype.hasOwnProperty.call(options || {}, 'dismissValue')
        ? options.dismissValue
        : false;
      this.currentCancelValue = Object.prototype.hasOwnProperty.call(options || {}, 'cancelValue')
        ? options.cancelValue
        : this.currentDismissValue;

      this.titleEl.textContent = title;
      this.messageEl.textContent = message;
      this.yesBtn.textContent = yesText;
      this.noBtn.textContent = noText;
      this.cancelBtn.textContent = cancelText;
      this.cancelBtn.classList.toggle('hidden', !showCancel);
      this.applyButtonScheme(this.yesBtn, yesScheme);
      this.applyButtonScheme(this.noBtn, noScheme);

      this.overlay.classList.add('open');
      this.overlay.setAttribute('aria-hidden', 'false');
      this.doc.addEventListener('keydown', this.boundOnKeyDown);
      if (showCancel) {
        this.cancelBtn.focus();
      } else {
        this.noBtn.focus();
      }

      return new Promise((resolve) => {
        this.currentResolver = resolve;
      });
    }

    normalizeScheme(value, fallback) {
      const key = String(value || '').trim().toLowerCase();
      if (this.allowedSchemes.has(key)) {
        return key;
      }

      return fallback;
    }

    applyButtonScheme(button, scheme) {
      if (!button) {
        return;
      }

      button.classList.remove(
        'confirm-btn-blue',
        'confirm-btn-orange',
        'confirm-btn-darkred',
        'confirm-btn-green'
      );
      button.classList.add(`confirm-btn-${scheme}`);
    }

    setDefaultSchemes(schemeOptions) {
      this.defaultScheme.yes = this.normalizeScheme(schemeOptions?.yes, this.defaultScheme.yes);
      this.defaultScheme.no = this.normalizeScheme(schemeOptions?.no, this.defaultScheme.no);
    }

    onKeyDown(event) {
      if (!this.overlay || !this.overlay.classList.contains('open')) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        this.resolve(this.currentDismissValue);
      }
    }

    resolve(result) {
      if (!this.overlay || !this.currentResolver) {
        return;
      }

      const resolver = this.currentResolver;
      this.currentResolver = null;
      this.overlay.classList.remove('open');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.doc.removeEventListener('keydown', this.boundOnKeyDown);
      resolver(result);
    }
  }

  window.StandardYesNoDialog = new StandardYesNoDialog(document);
})();