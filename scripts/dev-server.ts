import { spawn, execSync, ChildProcess } from 'node:child_process';
import chokidar from 'chokidar';
import path from 'node:path';
import chalk from 'chalk';
import type { Stats } from 'node:fs';

const dirname = import.meta.dirname;

const PROJECT_ROOT = path.join(dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const JS_INDEX = path.join(PROJECT_ROOT, 'dist', 'index.js');

const logger = {
  prefix: chalk.green('[DEV SERVER]'),
  log(message: string) {
    console.log(`${this.prefix} ${message}`);
  },
  error(message: string, ...optionalParams: any[]) {
    console.error(`${this.prefix} ${message}`, ...optionalParams);
  },
};

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const build = () => {
  logger.log('Building');

  execSync(path.join(dirname, 'build.sh'), {
    stdio: 'inherit',
    env: process.env,
  });

  logger.log('Build completed');
};

const startServer = () => {
  logger.log('Starting server');

  return spawn('node', ['--inspect', JS_INDEX], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });
};

let server: ChildProcess | undefined;

process
  .on('SIGINT', () => {
    process.exit();
  })
  .on('exit', () => {
    server?.kill();
  });

build();
server = startServer();

const restartServer = debounce(() => {
  try {
    logger.log('Restarting');

    server?.kill();

    build();
    server = startServer();
  } catch (error) {
    logger.error(
      'Build failed',
      error instanceof Error ? error.message : String(error),
    );
  }
}, 200);

const ignored = (filePath: string, stats?: Stats) => {
  if (!stats?.isFile()) return false;

  const isIgnored = filePath.includes(
    path.join(SRC_DIR, 'public', 'index.html'),
  );
  const hasValidExt = ['.ts', '.js', '.html'].includes(path.extname(filePath));

  return isIgnored || !hasValidExt;
};

chokidar
  .watch(SRC_DIR, { ignored, ignoreInitial: true })
  .on('ready', () => logger.log('Watching for changes'))
  .on('add', restartServer)
  .on('change', restartServer)
  .on('unlink', restartServer)
  .on('error', (error) => logger.error('Watcher error', error));
