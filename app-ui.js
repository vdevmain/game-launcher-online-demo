// UI helpers for non-settings, non-detail areas.

function showJobOverlay(title, message, percent, elapsedSeconds, etaText) {
  jobOverlay.setAttribute('aria-hidden', 'false');
  jobOverlay.classList.add('open');
  jobTitle.textContent = title || 'Bitte warten';
  jobMessage.textContent = message || 'Operation laeuft...';
  jobProgressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  jobPercent.textContent = `${Math.max(0, Math.min(100, percent))}%`;
  jobElapsed.textContent = `Verstrichen ${formatSeconds(elapsedSeconds)}`;
  jobEta.textContent = etaText || 'ETA --';
  setJobCancelButtonState(!!state.activeJob, !!state.activeJobCancelRequested);
}

function hideJobOverlay() {
  jobOverlay.classList.remove('open');
  jobOverlay.setAttribute('aria-hidden', 'true');
  jobProgressBar.style.width = '0%';
  jobPercent.textContent = '0%';
  jobElapsed.textContent = '0.0s';
  jobEta.textContent = 'ETA --';
  setJobCancelButtonState(false, false);
}

function setJobCancelButtonState(isRunning, cancelRequested) {
  if (!jobCancelBtn) {
    return;
  }

  jobCancelBtn.disabled = !isRunning || !!cancelRequested;
  jobCancelBtn.textContent = cancelRequested
    ? t('job_cancel_requested', 'Abbruch angefordert...')
    : t('job_cancel_button', 'Abbrechen');
}

function formatSeconds(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0.0s';
  }

  return `${numeric.toFixed(1)}s`;
}
