export interface ApiErrorOptions extends ErrorOptions {
  statusCode?: number;
}

export default class ApiError extends Error {
  statusCode?: number;

  constructor(message?: string, options?: ApiErrorOptions) {
    super(message, options);

    this.statusCode = options?.statusCode;
  }
}
