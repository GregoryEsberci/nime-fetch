/* eslint-disable no-undef */

(() => {
  // Icons: https://heroicons.com/solid
  const solidIcons = {
    arrowDownTray:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>',
    arrowTopRightOnSquare:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z" clip-rule="evenodd" /></svg>',
  };

  /**
   * @type {HTMLFormElement}
   */
  const form = document.getElementById('url-form');
  /**
   * @type {HTMLButtonElement}
   */
  const submitButton = document.querySelector('button[type="submit"]');
  /**
   * @type {HTMLDivElement}
   */
  const animeList = document.getElementById('anime-list');
  /**
   * @type {HTMLInputElement}
   */
  const urlInput = form.querySelector('input[name="url"]');
  /**
   * @type {HTMLParagraphElement}
   */
  const inputError = form.querySelector('.error-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');

    const originalButtonContent = submitButton.textContent;

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Adding...';
      urlInput.disabled = true;
      urlInput.classList.remove('input-error');
      inputError.textContent = '';

      const response = await fetch('/url', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json().catch(() => undefined);

      if (!response.ok) {
        throw new Error(data?.cause || 'Unknown fetch error');
      }

      urlInput.value = '';

      await fetchLists();
    } catch (error) {
      urlInput.classList.add('input-error');
      inputError.textContent =
        error instanceof Error ? error.message : `${error}`;

      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonContent;
      urlInput.disabled = false;
    }
  });

  const episodeId = (animeId, episodeId) => `episode-${animeId}-${episodeId}`;

  const getEpisodeStatus = (episode) => {
    const statusElement = document.createElement('span');

    const textContents = {
      pending: 'Pending',
      downloading: 'Downloading',
      error: `Error - ${episode.downloadAttempts} attempts`,
    };

    statusElement.classList.add('status', `status-${episode.fileStatus}`);
    statusElement.textContent = textContents[episode.fileStatus] || '';

    if (!statusElement.textContent) {
      statusElement.hidden = true;
    }

    return statusElement;
  };

  const getEpisodeActions = (episode) => {
    const videoLink = createFileLink(episode, solidIcons.arrowTopRightOnSquare);
    const downloadLink = createFileLink(episode, solidIcons.arrowDownTray);

    downloadLink.download = true;

    const actionsElement = document.createElement('div');
    actionsElement.classList.add('actions');

    actionsElement.append(videoLink, downloadLink);

    return actionsElement;
  };

  const updateEpisodeStatus = (animeId, episode) => {
    const statusElement = document
      .getElementById(episodeId(animeId, episode.id))
      ?.querySelector('.status');

    if (!statusElement) return;

    const newStatusEl = getEpisodeStatus(episode);

    if (statusElement.outerHTML !== newStatusEl.outerHTML) {
      statusElement.replaceWith(newStatusEl);
    }
  };

  const updateEpisodeAction = (animeId, episode) => {
    const statusElement = document
      .getElementById(episodeId(animeId, episode.id))
      ?.querySelector('.actions');

    if (!statusElement) return;

    const newActionsElement = getEpisodeActions(episode);

    if (statusElement.outerHTML !== newActionsElement.outerHTML) {
      statusElement.replaceWith(newActionsElement);
    }
  };

  const createFileLink = (episode, innerHTML) => {
    const downloadLink = document.createElement('a');

    downloadLink.href = episode.filePath;
    downloadLink.innerHTML = innerHTML;
    downloadLink.classList.add('link-icon');
    downloadLink.target = '_blank';

    if (episode.fileStatus !== 'done') {
      downloadLink.classList.add('disabled');
      downloadLink.setAttribute('onclick', 'event.preventDefault()');
    }

    return downloadLink;
  };

  const fetchLists = async () => {
    try {
      const response = await fetch('/list', { method: 'GET' });
      const data = await response.json().catch(() => undefined);

      if (!response.ok) {
        throw new Error(data?.cause || 'Unknown error');
      }

      data.forEach((anime) => {
        let animeSection = document.getElementById(`anime-${anime.id}`);

        if (animeSection) {
          anime.episodes.forEach((episode) => {
            updateEpisodeStatus(anime.id, episode);
            updateEpisodeAction(anime.id, episode);
          });

          return;
        }
        const animeEpisodesHtml = anime.episodes
          .map(
            (episode) => `
              <div id="${episodeId(anime.id, episode.id)}" class="episode">
                <span>${episode.title}</span>

                ${getEpisodeStatus(episode).outerHTML}

                ${getEpisodeActions(episode).outerHTML}
              </div>
            `,
          )
          .join('\n');

        const sectionHtml = `
          <section id="anime-${anime.id}" class="anime">
            <div class="anime-header">
              <h2>${anime.title}</h2>
            </div>
            <div class="episodes">
              ${animeEpisodesHtml}
            </div>
          </section>
        `;

        animeList.insertAdjacentHTML('beforeend', sectionHtml);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const sleep = (duration) =>
    new Promise((resolve) => setTimeout(resolve, duration));

  const REFRESH_INTERVAL = 5000;

  // High performance? Nah
  // Questionable practice? Yes
  // But it's quick and works for now, maybe I'll adjust it later
  (async () => {
    while (true) {
      try {
        await fetchLists();
      } catch (error) {
        console.error(error);
      } finally {
        await sleep(REFRESH_INTERVAL);
      }
    }
  })();
})();
