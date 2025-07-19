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
  };
}
