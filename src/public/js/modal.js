// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createModalMixin() {
  return {
    confirmModal: {
      visible: false,
      message: '',
      loading: false,
      onConfirm: null,
      anime: undefined,
      episode: undefined,
    },

    showDeleteAnimeConfirmation(anime) {
      this.confirmModal.visible = true;
      this.confirmModal.message = `Are you sure you want to delete "${anime.title}" and all its episodes?`;
      this.confirmModal.anime = anime;
      this.confirmModal.episode = undefined;
      this.confirmModal.loading = false;
    },

    showDeleteEpisodeConfirmation(anime, episode) {
      this.confirmModal.visible = true;
      this.confirmModal.message = `Are you sure you want to delete "${episode.title}" from "${anime.title}"?`;
      this.confirmModal.anime = anime;
      this.confirmModal.episode = episode;
      this.confirmModal.loading = false;
    },

    cancelConfirmation() {
      this.confirmModal.visible = false;
      this.confirmModal.anime = undefined;
      this.confirmModal.episode = undefined;
      this.confirmModal.loading = false;
    },

    getScrollbarWidth() {
      if (document.body.scrollHeight <= window.innerHeight) return 0;

      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      outer.style.msOverflowStyle = 'scrollbar';

      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    },

    onModalShow() {
      document.body.classList.add('overflow-hidden');
      document.body.style.paddingRight = `${this.getScrollbarWidth()}px`;
    },

    onModalHide() {
      const TRANSITION_DURATION = 300;

      setTimeout(() => {
        document.body.classList.remove('overflow-hidden');
        document.body.style.paddingRight = 0;
      }, TRANSITION_DURATION);
    },
  };
}
