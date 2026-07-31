// "patch-games" push action: applies partial GameItemDto patches to state.games.
// Entry fields: id (required), any GameItemDto property to set, $dropped (string[] fields to
// null out), $deleted (true removes the game), $created (true adds the game if it's not known yet).
(function () {
  function applyEntry(entry) {
    if (!entry || !entry.id) {
      return;
    }

    if (entry.$deleted) {
      const index = state.games.findIndex((game) => game.id === entry.id);
      if (index !== -1) {
        state.games.splice(index, 1);
      }
      return;
    }

    let game = state.games.find((item) => item.id === entry.id);
    if (!game) {
      if (!entry.$created) {
        return;
      }
      game = { id: entry.id };
      state.games.push(game);
    }

    for (const [key, value] of Object.entries(entry)) {
      if (key === 'id' || key.startsWith('$') || value === undefined) {
        continue;
      }
      game[key] = value;
    }

    for (const field of entry.$dropped || []) {
      game[field] = null;
    }

    // A patch carrying playedMinutes/lastPlayed means the tracked play session for this
    // game has just ended (see ProcessLauncherServices.TrackPlaySessionAsync) - clear the
    // "currently running" indicator, mirroring the old applyGamePatch behavior.
    if (state.runningSessions.has(game.id) &&
        (Object.prototype.hasOwnProperty.call(entry, 'playedMinutes') || Object.prototype.hasOwnProperty.call(entry, 'lastPlayed'))) {
      markGameSessionStopped(game.id);
    }
  }

  window.MessageActions.register('patch-games', (games) => {
    if (!Array.isArray(games)) {
      return;
    }

    games.forEach(applyEntry);

    if (typeof updateExtraGamesFromState === 'function') {
      updateExtraGamesFromState();
    }

    renderGames();

    if (typeof renderSettingsGameLists === 'function') {
      renderSettingsGameLists();
    }
  });
})();
