import crypto from 'node:crypto';
import { IncomingMessage } from 'node:http';

class ContextLogger {
  #id = crypto.randomUUID();

  public context: string;

  constructor(initialized: IncomingMessage | string) {
    if (initialized instanceof IncomingMessage) {
      this.context = `${initialized.method ?? ''} ${initialized.url ?? ''}`;
    } else {
      this.context = initialized;
    }
  }

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
