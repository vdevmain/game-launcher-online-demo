(function () {
  let pendingLaunch = null;
  const earlyPreflightMessages = new Map();

  function getApp() {
    if (!window.__launcherApp) {
      throw new Error('Launcher-App ist nicht bereit.');
    }

    return window.__launcherApp;
  }

  function triggerLaunch(game) {
    if (!game || !game.id) {
      return;
    }

    const app = getApp();
    app.setStatus(t('status_checking_start_file', 'Pruefe Startdatei fuer {title}...', { title: game.title }));
    window.BackendApi.launchGame(game.id);
  }

  function sendLaunch(gameId, executableRelativePath, saveCloudAction, title) {
    const app = getApp();
    app.setStatus(t('status_starting_game', 'Starte {title}...', {
      title: title || t('game_generic', 'Spiel')
    }));
    window.BackendApi.launchGame(gameId, executableRelativePath, saveCloudAction);
  }

  function handleResponse(data) {
    if (!data) {
      return false;
    }

    if (data.needsSelection) {
      pendingLaunch = data;
      window.ExecutablePicker.show({
        title: t('launch_picker_title', 'EXE fuer {title} waehlen', { title: data.title || t('game_generic', 'Spiel') }),
        candidates: Array.isArray(data.candidates) ? data.candidates : [],
        onSelect: (candidate) => {
          if (!pendingLaunch) {
            return;
          }

          sendLaunch(pendingLaunch.gameId, candidate.relativePath, null, pendingLaunch.title);
          pendingLaunch = null;
          window.ExecutablePicker.hide();
        },
        onCancel: () => {
          pendingLaunch = null;
        }
      });
      return true;
    }

    if (data.saveCloudPreflightQueued) {
      pendingLaunch = data;
      getApp().setStatus(t('status_savecloud_checking', 'Pruefe Cloud-Spielstaende fuer {title}...', {
        title: data.title || t('game_generic', 'Spiel')
      }));
      const earlyMessage = earlyPreflightMessages.get(data.jobId);
      if (earlyMessage) {
        earlyPreflightMessages.delete(data.jobId);
        void handleSaveCloudPreflightMessage(earlyMessage);
      }
      return true;
    }

    if (data.launched) {
      pendingLaunch = null;
      const app = getApp();
      app.markGameSessionStarted(data.gameId, data.title || t('game_generic', 'Spiel'));
      app.setStatus(t('status_game_started', '{title} wurde gestartet.', { title: data.title || t('game_generic', 'Spiel') }));
      return true;
    }

    return false;
  }

  async function handleSaveCloudPreflightMessage(message) {
    if (!message) {
      return;
    }

    if (!pendingLaunch) {
      earlyPreflightMessages.set(message.jobId, message);
      return;
    }

    if (message.jobId !== pendingLaunch.jobId || message.gameId !== pendingLaunch.gameId) {
      return;
    }

    const launch = pendingLaunch;
    if (message.kind === 'saveCloudLaunchPreflightFailed') {
      pendingLaunch = null;
      getApp().setStatus(message.error || t('status_savecloud_check_failed', 'Cloud-Spielstaende konnten nicht geprueft werden.'), true);
      return;
    }

    if (message.saveFilesLocationNotFound)
    {
      let selection = null;
      //todo add lanugage file entries
      if (window.StandardYesNoDialog && typeof window.StandardYesNoDialog.confirm === 'function') {
        selection = await window.StandardYesNoDialog.confirm({
          title: t('savecloud_missing_launch_dialog_title', 'Spielstand Ordner konnte nicht gefunden werden'),
          message: t('savecloud_missing_launch_dialog_message', 'Soll der Ordner erstellt und die Cloud-Spielstände kopiert werden?', {}),
          yesText: t('savecloud_launch_dialog_copy_start', 'Kopieren und starten'),
          noText: t('savecloud_launch_dialog_start_only', 'Ohne Kopieren starten'),
          yesColorScheme: 'green',
          noColorScheme: 'blue',
          showCancel: true,
          cancelText: t('savecloud_launch_dialog_cancel', 'Abbrechen'),
          dismissValue: null,
          cancelValue: null
        });
      }

      if (selection === true)
      {
        getApp().setStatus(t('status_savecloud_restoring', 'Kopiere Cloud-Spielstaende fuer {title}...', {
          title: launch.title || t('game_generic', 'Spiel')
        }));
        window.BackendApi.launchGame(launch.gameId, launch.executableRelativePath, 'restore');
        pendingLaunch = null;
        return;
      }
      else if (selection === false)
      {
        sendLaunch(launch.gameId, launch.executableRelativePath, 'skip', launch.title);
        pendingLaunch = null;
        return;
      }
      else
      {
        getApp().setStatus(t('status_savecloud_launch_cancelled', 'Spielstart abgebrochen.'));
        pendingLaunch = null;
        return;
      }
    }


    const changedFileCount = Math.max(0, Number(message.changedFileCount || 0));
    if (changedFileCount === 0) {
      sendLaunch(launch.gameId, launch.executableRelativePath, 'store', launch.title);
      pendingLaunch = null;
      return;
    }



    let selection = null;
    if (window.StandardYesNoDialog && typeof window.StandardYesNoDialog.confirm === 'function') {
      selection = await window.StandardYesNoDialog.confirm({
        title: t('savecloud_launch_dialog_title', 'Neuere Cloud-Spielstaende gefunden'),
        message: t('savecloud_launch_dialog_message', 'Fuer {title} wurden {count} neue oder neuere Cloud-Dateien gefunden.', {
          title: launch.title || t('game_generic', 'Spiel'),
          count: changedFileCount
        }),
        yesText: t('savecloud_launch_dialog_copy_start', 'Kopieren und starten'),
        noText: t('savecloud_launch_dialog_start_only', 'Ohne Kopieren starten'),
        yesColorScheme: 'green',
        noColorScheme: 'blue',
        showCancel: true,
        cancelText: t('savecloud_launch_dialog_cancel', 'Abbrechen'),
        dismissValue: null,
        cancelValue: null
      });
    }
    if (selection === true) {
      getApp().setStatus(t('status_savecloud_restoring', 'Kopiere Cloud-Spielstaende fuer {title}...', {
        title: launch.title || t('game_generic', 'Spiel')
      }));
      window.BackendApi.launchGame(launch.gameId, launch.executableRelativePath, 'restore');
    } else if (selection === false) {
      sendLaunch(launch.gameId, launch.executableRelativePath, 'skip', launch.title);
    } else {
      getApp().setStatus(t('status_savecloud_launch_cancelled', 'Spielstart abgebrochen.'));
    }

    pendingLaunch = null;
  }

  window.GameLaunchController = {
    triggerLaunch,
    handleResponse,
    handleSaveCloudPreflightMessage
  };
})();
