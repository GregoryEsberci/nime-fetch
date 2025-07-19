// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createToastMixin() {
  return {
    toast: {
      visible: false,
      message: '',
      /**
       * @type {"success" | "error" | "warning"}
       */
      type: 'success',
      icon: '',
      timeout: null,
    },

    showToast({ message, type = 'success', duration = 4000 }) {
      const icons = {
        success: this.icons.checkCircle,
        error: this.icons.exclamationCircle,
        warning: this.icons.exclamationTriangle,
        default: this.icons.checkCircle,
      };

      this.toast.message = message;
      this.toast.type = type;
      this.toast.icon = icons[type] || icons.default;
      this.toast.visible = true;

      if (this.toast.timeout) clearTimeout(this.toast.timeout);

      this.toast.timeout = setTimeout(() => {
        this.toast.visible = false;
      }, duration);
    },
  };
}
