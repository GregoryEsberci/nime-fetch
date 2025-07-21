import chalk from 'chalk';
import crypto from 'node:crypto';
import { IncomingMessage } from 'node:http';

interface ContextLoggerOptions {
  withId?: boolean;
}

class ContextLogger {
  #id = crypto.randomUUID();

  public context: string;

  public withId: boolean;

  constructor(
    initialized: IncomingMessage | string,
    options: ContextLoggerOptions = {},
  ) {
    if (initialized instanceof IncomingMessage) {
      this.context = `${initialized.method ?? ''} ${initialized.url ?? ''}`;
    } else {
      this.context = initialized;
    }

    this.withId = options.withId ?? true;
  }

  #formatMessage(message: string) {
    const context = chalk.green(`[${this.context}]`);
    const id = this.withId ? chalk.blue(`[${this.#id}]`) : undefined;

    return [context, id, message].filter(Boolean).join(' ');
  }

  log(message: string) {
    console.log(this.#formatMessage(message));
  }

  error(message: string, ...optionalParams: any[]) {
    console.error(this.#formatMessage(message), ...optionalParams);
  }
}

export default ContextLogger;
