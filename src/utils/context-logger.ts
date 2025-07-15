import crypto from 'node:crypto';

class ContextLogger {
  #id = crypto.randomUUID();

  constructor(public context: string) {}

  #formatMessage(message: string) {
    return `[${this.context}] [${this.#id}] ${message}`;
  }

  log(message: string) {
    console.log(this.#formatMessage(message));
  }

  error(message: string, ...optionalParams: any[]) {
    console.error(this.#formatMessage(message), ...optionalParams);
  }
}

export default ContextLogger;
