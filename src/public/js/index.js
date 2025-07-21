const sleep = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

/**
 * @typedef {ReturnType<typeof createToastMixin>} ToastMixin
 * @typedef {ReturnType<typeof createModalMixin>} ModalMixin
 */

class AppError extends Error {
  humanizedMessage;

  /**
   * @param {{ message: string, humanizedMessage: string, options: ErrorOptions }}
   */
  constructor({ message, options, humanizedMessage }) {
    super(message, options);

    this.humanizedMessage = humanizedMessage;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function animeApp() {
  return {
    url: '',
    errorMessage: '',
    isSubmittingUrl: false,
    animeList: [],
    pollingInterval: null,

    // Icons: https://heroicons.com/solid
    // TODO: Seeing a better way to deal with icons
    icons: {
      arrowDownTray:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>',
      arrowTopRightOnSquare:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z" clip-rule="evenodd" /></svg>',
      trash:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>',
      checkCircle:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" /></svg>',
      exclamationCircle:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>',
      exclamationTriangle:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>',
    },

    /**
     * @param {string} path
     * @param {RequestInit} [init]
     * @returns {Promise<{ response: Response, jsonData: any }>}
     */
    async apiFetch(path, init) {
      const request = new Request(`${window.BASE_PATH}/api/${path}`, init);
      const response = await fetch(request);
      const jsonData = await response.json().catch(() => undefined);

      if (!response.ok) {
        const cause =
          jsonData?.cause || `${response.status} ${response.statusText}`;

        throw new AppError({
          message: `Failed to ${request.method} ${request.url} – ${cause}.`,
          humanizedMessage: cause,
        });
      }

      return { response, jsonData };
    },

    async submitUrl() {
      this.isSubmittingUrl = true;
      this.errorMessage = '';

      try {
        await this.apiFetch('anime/url', {
          method: 'POST',
          body: JSON.stringify({ url: this.url }),
          headers: { 'Content-Type': 'application/json' },
        });

        this.showToast({ message: 'Anime added successfully!' });
        this.url = '';
        await this.fetchAnimeList();
      } catch (error) {
        console.error(error);
        const message =
          error instanceof AppError ? ` - ${error.humanizedMessage}` : '';

        this.showToast({
          message: `Failed to add${message}.`,
          type: 'error',
        });
      } finally {
        this.isSubmittingUrl = false;
      }
    },

    async fetchAnimeList() {
      const { jsonData } = await this.apiFetch('anime');

      const newList = jsonData || [];

      if (JSON.stringify(this.animeList) !== JSON.stringify(newList)) {
        this.animeList = newList;
      }
    },

    async confirmDeletion() {
      if (this.confirmModal.loading) return;

      const { anime, episode } = this.confirmModal;

      this.confirmModal.loading = true;

      try {
        if (episode) {
          await this.apiFetch(`anime-episode/${episode.id}`, {
            method: 'DELETE',
          });

          this.showToast({
            message: `Episode "${episode.title}" deleted successfully.`,
          });
        } else if (anime) {
          await this.apiFetch(`anime/${anime.id}`, {
            method: 'DELETE',
          });

          this.showToast({
            message: `Anime "${anime.title}" deleted successfully.`,
          });
        }

        await this.fetchAnimeList();
        this.cancelConfirmation();
      } catch (error) {
        console.error(error);
        const errorMessage =
          error instanceof AppError ? ` - ${error.humanizedMessage}` : '';

        this.showToast({
          message: `Failed to delete${errorMessage}.`,
          type: 'error',
        });
      } finally {
        this.confirmModal.loading = false;
      }
    },

    getStatusText(episode) {
      const fileStatusMap = {
        pending: 'Download pending',
        downloading: 'Downloading',
        error: `Download error - ${episode.downloadAttempts} attempts`,
      };

      const statusMap = {
        pending: 'Process pending',
        scraping: 'Processing',
        error: `Process error - ${episode.attempts} attempts`,
      };

      if (episode.status !== 'done') {
        return statusMap[episode.status];
      }

      return fileStatusMap[episode.fileStatus] || '';
    },

    getStatusClass(episode) {
      if (episode.status !== 'done') {
        return episode.status;
      }

      return episode.fileStatus;
    },

    startPolling() {
      const REFRESH_INTERVAL = 5000;

      // Start polling
      // High performance? Nah
      // Questionable practice? Yes
      // But it's quick and works for now, maybe I'll adjust it later
      (async () => {
        while (true) {
          try {
            if (!document.hidden) await this.fetchAnimeList();
          } catch (error) {
            console.error(error);
          } finally {
            await sleep(REFRESH_INTERVAL);
          }
        }
      })();
    },

    handleKeydown(event) {
      if (event.key !== 'Escape') return;

      if (this.confirmModal.visible) {
        this.cancelConfirmation();
      }
    },

    async init() {
      try {
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        await this.fetchAnimeList();
        this.startPolling();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        this.showToast({
          message: 'Failed to load anime list.',
          type: 'error',
        });
      }
    },

    // eslint-disable-next-line no-undef
    ...createToastMixin(),
    // eslint-disable-next-line no-undef
    ...createModalMixin(),
  };
}
