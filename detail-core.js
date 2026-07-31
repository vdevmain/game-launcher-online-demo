// Detail modal business logic.
function normalizeTagList(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const unique = [];
  const seen = new Set();
  for (const rawTag of tags) {
    const tag = String(rawTag || '').trim().replace(/^#+/, '').toLowerCase();
    if (!tag) {
      continue;
    }

    const key = tag;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(tag);
  }

  unique.sort((a, b) => a.localeCompare(b));
  return unique;
}

function parseTagsFromInput(rawInput) {
  return normalizeTagList(
    String(rawInput || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
}

function collectKnownTags() {
  const known = new Set();
  for (const game of state.games) {
    for (const tag of normalizeTagList(game.tags)) {
      known.add(tag);
    }
  }

  return [...known].sort((a, b) => a.localeCompare(b));
}

function normalizeTagQuery(rawInput) {
  const source = String(rawInput || '').trim();
  if (!source) {
    return '';
  }

  // Tag editor accepts multi-word tags (e.g. "hallo welt").
  // Only comma separates multiple tags while typing.
  const parts = source.split(',');
  const lastPart = parts.length ? parts[parts.length - 1] : source;
  return String(lastPart || '').replace(/^#+/, '').trim();
}

function getBestTagSuggestions(query, selectedTags, limit = 8) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const selectedSet = new Set(normalizeTagList(selectedTags).map((tag) => tag.toLowerCase()));

  const candidates = collectKnownTags()
    .filter((tag) => !selectedSet.has(tag.toLowerCase()))
    .map((tag) => {
      const lowerTag = tag.toLowerCase();
      let score = 0;

      if (!normalizedQuery) {
        score = 100;
      } else if (lowerTag === normalizedQuery) {
        score = 1000;
      } else if (lowerTag.startsWith(normalizedQuery)) {
        score = 700 - (lowerTag.length - normalizedQuery.length);
      } else if (lowerTag.includes(normalizedQuery)) {
        score = 350 - lowerTag.indexOf(normalizedQuery);
      } else {
        score = 0;
      }

      return { tag, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.tag.localeCompare(b.tag);
    })
    .slice(0, Math.max(1, limit));

  return candidates.map((item) => item.tag);
}

function applyRatingChoice(currentRating, chosenValue) {
  const value = normalizeRating(chosenValue);
  if (value <= 1) {
    return currentRating === 1 ? 0 : 1;
  }

  return value;
}

function updateGameRating(game, chosenValue) {
  const currentRating = normalizeRating(game.rating);
  const nextRating = applyRatingChoice(currentRating, chosenValue);
  game.rating = nextRating;
  setStatus(t('detail_status_saving_rating', 'Speichere Bewertung fuer {title}...', { title: game.title }));
  window.BackendApi.updateGameDetails({ gameId: game.id, rating: nextRating });

  if (!state.ratingFilters.has(nextRating)) {
    renderGames();
    return;
  }

  syncGameCard(game);

  const selected = getSelectedGame();
  if (selected && selected.id === game.id && gameModal.classList.contains('open')) {
    syncDetailPanelFromGame(game);
  }
}

async function openStartProgramCandidatePicker(game) {
  setStatus(t('detail_status_loading_candidates', 'Suche ausfuehrbare Dateien fuer {title}...', { title: game.title }));

  let result;
  try {
    result = await window.BackendApi.getExecutableCandidates(game.id);
  } catch (error) {
    setStatus(error?.message || t('detail_error_loading_candidates', 'Kandidaten konnten nicht geladen werden.'), true);
    return;
  }

  const candidates = Array.isArray(result?.candidates) ? result.candidates : [];
  window.ExecutablePicker.show({
    title: t('detail_pick_start_program_dialog_title', 'Startprogramm fuer {title} waehlen', { title: game.title }),
    candidates,
    onSelect: (candidate) => {
      window.ExecutablePicker.hide();
      game.executableRelativePath = candidate.relativePath;

      const startProgramInputEl = document.getElementById('detailStartProgramInput');
      if (startProgramInputEl) {
        startProgramInputEl.value = candidate.relativePath;
      }

      setStatus(t('detail_status_saving_start_program', 'Speichere Startprogramm fuer {title}...', { title: game.title }));
      window.BackendApi.updateGameDetails({ gameId: game.id, executableRelativePath: candidate.relativePath });
    },
    onCancel: () => {}
  });
}