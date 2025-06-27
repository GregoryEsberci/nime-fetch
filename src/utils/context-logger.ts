import crypto from 'crypto';

class ContextLogger {
  #id = crypto.randomUUID();

  constructor(public context: string) {}

  #formatMessage(message: string) {
    return `[${this.context}] [${this.#id}] ${message}`;
  }

  log(message: string) {
    console.log(this.#formatMessage(message));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, ...optionalParams: any[]) {
    console.error(this.#formatMessage(message), ...optionalParams);
  }
}

export default ContextLogger;
